import { subDays, format } from 'date-fns';

const PRODUCTS = [
    { id: 'CHOI_NVS', name: 'Chổi nhà vệ sinh, cọ toilet', minStock: 10 },
    { id: 'NUOC_LAU_SAN', name: 'Nước lau sàn Sunlight 10L', minStock: 20 },
    { id: 'GIAY_VS', name: 'Giấy vệ sinh cuộn lớn', minStock: 50 },
    { id: 'GANG_TAY', name: 'Găng tay cao su (Đôi)', minStock: 100 },
    { id: 'NUOC_RUA_CHEN', name: 'Nước rửa chén 5L', minStock: 15 },
];

const generateTransactions = () => {
    const data = [];
    const now = new Date();

    // Generate data for last 30 days
    for (let i = 30; i >= 0; i--) {
        const date = subDays(now, i);
        const dateStr = format(date, 'yyyy-MM-dd');

        // Each day has some random transactions
        const txCount = Math.floor(Math.random() * 5) + 1; // 1-5 tx per day

        for (let j = 0; j < txCount; j++) {
            const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
            const type = Math.random() > 0.4 ? 'IMPORT' : 'EXPORT'; // 60% import, 40% export
            let boxQty = Math.floor(Math.random() * 10) + 1;

            // Make sure exports don't force unrealistic negatives too often (mock logic)
            if (type === 'EXPORT') boxQty = Math.floor(Math.random() * 5) + 1;

            data.push({
                id: `TX-${i}-${j}`,
                date: dateStr, // Simple date string for easy filtering
                timestamp: date.toISOString(),
                productName: product.name,
                productId: product.id,
                type,
                boxQty,
            });
        }
    }
    return data;
};

const TRANSACTIONS = generateTransactions();

// Helper to calculate stock based on transactions
export const calculateInventory = (transactions, products = []) => {
    const inventory = {};

    // Initialize with PRODUCTS
    products.forEach(p => {
        inventory[p.id] = {
            ...p,
            totalImport: 0,
            totalExport: 0,
            currentStock: 0 // Mock starting stock or calculated from 0
        };
    });

    // Replay transactions
    transactions.forEach(tx => {
        if (inventory[tx.productId]) {
            if (tx.type === 'IMPORT') {
                inventory[tx.productId].totalImport += tx.boxQty;
                inventory[tx.productId].currentStock += tx.boxQty;
            } else if (tx.type === 'EXPORT') {
                inventory[tx.productId].totalExport += tx.boxQty;
                inventory[tx.productId].currentStock -= tx.boxQty;
            }
        }
    });

    return Object.values(inventory);
};

export { PRODUCTS, TRANSACTIONS };
