function doGet(e) {
  var action = e.parameter.action;
  
  if (action == 'GET_DATA') {
    return getContent();
  }
  
  return ContentService.createTextOutput("Invalid Action");
}

function doPost(e) {
  var jsonString = e.postData.contents;
  var data = JSON.parse(jsonString);
  
  if (data.action == 'EXECUTE_COMMAND') {
    return handleExecuteCommand(data);
  }
  
  return ContentService.createTextOutput("Invalid Action");
}

function getContent() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Lấy danh sách sản phẩm
  var productSheet = ss.getSheetByName("DANH_MUC");
  if (!productSheet) { // Create if not exists
     productSheet = ss.insertSheet("DANH_MUC");
     productSheet.appendRow(["Mã SP", "Tên sản phẩm", "Tồn tối thiểu"]);
  }
  
  var productsObj = [];
  var pData = productSheet.getDataRange().getValues();
  // Bỏ qua header (row 0)
  for (var i = 1; i < pData.length; i++) {
    if (pData[i][0]) { // Check ID exits
      productsObj.push({
        id: pData[i][0],
        name: pData[i][1],
        minStock: pData[i][2] || 0
      });
    }
  }
  
  // 2. Lấy lịch sử giao dịch
  var historySheet = ss.getSheetByName("LICH_SU");
  if (!historySheet) {
     historySheet = ss.insertSheet("LICH_SU");
     historySheet.appendRow(["Thời gian", "Hành động", "Mã SP", "Số lượng", "Diễn giải"]);
  }
  
  var transactionsObj = [];
  var hData = historySheet.getDataRange().getValues();
  // Get last 500 records to avoid payload too large, or all if small
  var startRow = 1;
  if (hData.length > 500) startRow = hData.length - 500;

  for (var i = startRow; i < hData.length; i++) {
    var dateVal = hData[i][0];
    // Simple date format fix if needed
    
    // Find product name
    var pName = hData[i][2]; // Default to ID
    var foundP = productsObj.find(function(p) { return p.id === hData[i][2] });
    if (foundP) pName = foundP.name;

    transactionsObj.push({
       timestamp: dateVal, // Client side will parse
       type: hData[i][1] == 'NHẬP' ? 'IMPORT' : (hData[i][1] == 'XUẤT' ? 'EXPORT' : 'CHECK'),
       productId: hData[i][2],
       productName: pName,
       boxQty: hData[i][3]
    });
  }
  
  var result = {
    products: productsObj,
    transactions: transactionsObj
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleExecuteCommand(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("LICH_SU");
  if (!sheet) sheet = ss.insertSheet("LICH_SU");
  
  var timestamp = new Date();
  var actionType = data.intent == 'IN' ? 'NHẬP' : (data.intent == 'OUT' ? 'XUẤT' : 'KIỂM');
  
  sheet.appendRow([
    timestamp,
    actionType,
    data.product_id,
    data.quantity,
    data.rawText || ""
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function setup() {
   // Helper to create mock data in Sheet if empty
   var ss = SpreadsheetApp.getActiveSpreadsheet();
   var pSheet = ss.getSheetByName("DANH_MUC");
   if (!pSheet) {
      pSheet = ss.insertSheet("DANH_MUC");
      pSheet.appendRow(["Mã SP", "Tên sản phẩm", "Tồn tối thiểu"]);
      pSheet.appendRow(["CHOI_NVS", "Chổi nhà vệ sinh, cọ toilet", 10]);
      pSheet.appendRow(["NUOC_LAU_SAN", "Nước lau sàn Sunlight 10L", 20]);
   }
}
