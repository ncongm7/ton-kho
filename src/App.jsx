import { useState, useEffect, useRef, useCallback } from 'react';
import Navigation from './components/Navigation';
import DashboardScreen from './screens/DashboardScreen';
import ProductScreen from './screens/ProductScreen';
import HistoryScreen from './screens/HistoryScreen';
import VoiceScreen from './screens/VoiceScreen';
import { calculateInventory } from './data/mockData';

// ================================
// CẤU HÌNH MÔI TRƯỜNG
// ================================
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama3-8b-8192";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzStyKfLD1JAY-CNKnetI1dJjxwFEbyONx_GdY3Gc6x7SBlBmaVPFIhSQLJKLUT3lwq/exec";

// ================================
// CÁC HẰNG SỐ
// ================================
const APP_STATE = {
  SLEEP: 'SLEEP',
  LISTENING: 'LISTENING',
  CONFIRMING: 'CONFIRMING'
};

const WAKE_WORDS = ["trợ lý ơi", "ê kho", "bạn ơi"];
const SYSTEM_PROMPT = `
Bạn là bộ phân tích lệnh kho.
Nhiệm vụ: trích xuất dữ liệu có cấu trúc từ câu nói tiếng Việt.
CHỈ trả về JSON hợp lệ.
KHÔNG giải thích.
Nếu không chắc chắn, đặt giá trị là null.

INTENT:
IN = nhập kho
OUT = xuất kho
CHECK = kiểm tra tồn kho

Định dạng JSON:
{
  "intent": "IN" | "OUT" | "CHECK",
  "product_id": string | null,
  "quantity": number | null
}`;


function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');

  // App Data State
  const [dataTransactions, setDataTransactions] = useState([]);
  const [dataProducts, setDataProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Voice App State
  const [appState, setAppState] = useState(APP_STATE.SLEEP);
  const [logs, setLogs] = useState([]);
  const [pendingCommand, setPendingCommand] = useState(null);

  // Refs
  const recognitionRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const isSpeakingRef = useRef(false);

  // ================================
  // 0. DATA INIT
  // ================================
  // ================================
  // 0. DATA INIT (FETCH FROM GOOGLE SHEETS)
  // ================================
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Proxy dev, direct prod
      const baseUrl = import.meta.env.DEV ? '/api-proxy' : 'https://script.google.com';
      const scriptPath = GOOGLE_SCRIPT_URL.replace('https://script.google.com', '');
      const fetchUrl = import.meta.env.DEV ? `${baseUrl}${scriptPath}` : GOOGLE_SCRIPT_URL;

      addLog("Đang đồng bộ dữ liệu...", 'sys');
      const response = await fetch(`${fetchUrl}?action=GET_DATA`);

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API không trả về JSON (Có thể do chưa mở quyền 'Anyone')");
      }

      const json = await response.json();

      if (json.products) setDataProducts(json.products);
      if (json.transactions) setDataTransactions(json.transactions);

      addLog("Đã cập nhật dữ liệu mới nhất.", 'sys');
    } catch (error) {
      console.error("Fetch Error:", error);
      addLog(`Lỗi tải dữ liệu: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    // Recalculate inventory whenever transactions or products change
    if (dataProducts.length > 0) {
      const inv = calculateInventory(dataTransactions, dataProducts);
      setInventory(inv);
    }
  }, [dataTransactions, dataProducts]);

  // ================================
  // 1. UTILS: LOGGING & SPEAKING
  // ================================
  const addLog = (text, type = 'info') => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), text, type }, ...prev]);
  };

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      isSpeakingRef.current = true;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const vnVoice = voices.find(v => v.lang.includes('vi'));
      if (vnVoice) utterance.voice = vnVoice;

      utterance.onend = () => {
        isSpeakingRef.current = false;
        if (appState === APP_STATE.LISTENING && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch (e) { }
        }
      };

      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      addLog(`BOT: ${text}`, 'bot');
    }
  }, [appState]);

  const handleMicClick = () => {
    speak("Trợ lý sẵn sàng.");
    if (appState === APP_STATE.SLEEP) {
      setAppState(APP_STATE.LISTENING);
    }
  };

  // ================================
  // 2. AUTO SLEEP TIMER
  // ================================
  const resetSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (appState !== APP_STATE.SLEEP) {
      sleepTimerRef.current = setTimeout(() => {
        speak("Em nghỉ đây");
        setAppState(APP_STATE.SLEEP);
      }, 5 * 60 * 1000);
    }
  }, [appState, speak]);

  useEffect(() => {
    resetSleepTimer();
    return () => clearTimeout(sleepTimerRef.current);
  }, [appState, resetSleepTimer]);

  // ================================
  // 3. HANDLERS (Same Logic)
  // ================================
  const handleConfirmation = async (transcript) => {
    const normalizedText = transcript.toLowerCase();

    if (normalizedText.includes("đúng") || normalizedText.includes("ok") || normalizedText.includes("chính xác")) {
      if (!pendingCommand) return;

      addLog("Đang thực hiện lệnh...", 'sys');

      try {
        const payload = {
          action: "EXECUTE_COMMAND",
          ...pendingCommand,
          rawText: transcript
        };

        const baseUrl = import.meta.env.DEV ? '/api-proxy' : 'https://script.google.com';
        const scriptPath = GOOGLE_SCRIPT_URL.replace('https://script.google.com', '');
        const fetchUrl = import.meta.env.DEV ? `${baseUrl}${scriptPath}` : GOOGLE_SCRIPT_URL;

        const response = await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("API request failed");

        speak("Đã thực hiện xong ạ.");

        // Refresh data after successful command
        setTimeout(() => refreshData(), 2000);

      } catch (e) {
        console.error(e);
        speak(`Lỗi: ${e.message}`);
        addLog(`Lỗi xử lý giọng nói: ${e.message}`, 'error');
      }

      setPendingCommand(null);
      setAppState(APP_STATE.LISTENING);

    } else if (normalizedText.includes("không") || normalizedText.includes("sai") || normalizedText.includes("hủy")) {
      speak("Vâng, anh nói lại giúp em");
      setPendingCommand(null);
      setAppState(APP_STATE.LISTENING);
    } else {
      speak("Em chưa nghe rõ, anh xác nhận Đúng hay Không ạ?");
    }
  };

  const handleWakeWordDetection = (transcript) => {
    const lower = transcript.toLowerCase();
    const detected = WAKE_WORDS.some(word => lower.includes(word));
    if (detected) {
      setAppState(APP_STATE.LISTENING);
      speak("CHÀO FEN CÔNG ! CHÚC ANH MỘT  NGÀY TỐT LÀNH ANH CẦN EM GIÚP ĐỠ GÌ VỀ KHO");
      setActiveTab('voice'); // Switch to voice tab automatically
    }
  };

  const processVoiceCommand = async (transcript) => {
    addLog(`Đang phân tích: "${transcript}"...`, 'sys');

    const productContext = dataProducts.map(p => `- ${p.id}: ${p.name}`).join('\n');
    const userPrompt = `
Danh sách sản phẩm hiện có:
${productContext}

Người dùng nói:
"${transcript}"

Hãy trích xuất lệnh.`;

    try {
      if (!GROQ_API_KEY) throw new Error("Chưa có API KEY");

      const res = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1, // Để thấp cho chính xác theo yêu cầu
          max_tokens: 150
        })
      });

      if (!res.ok) {
        throw new Error(`Lỗi Groq: ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices[0]?.message?.content;

      if (!content) throw new Error("No AI response");

      const result = JSON.parse(content);
      addLog(`AI HIỂU: ${JSON.stringify(result)}`, 'bot');

      if (!result.intent) { speak("Em chưa hiểu ý anh."); return; }
      if (!result.product_id) { speak("Sản phẩm nào vậy ạ?"); return; }
      if (!result.quantity) { result.quantity = 1; }

      const product = dataProducts.find(p => p.id === result.product_id);
      const productName = product ? product.name : result.product_id;

      if (result.intent === 'CHECK') {
        const stock = inventory.find(i => i.id === result.product_id)?.currentStock || 0;
        speak(`${productName} hiện còn ${stock} thùng.`);
        setAppState(APP_STATE.LISTENING);
        return;
      }

      setPendingCommand({ ...result, productName });
      setAppState(APP_STATE.CONFIRMING);

      const intentText = result.intent === 'IN' ? "NHẬP" : "XUẤT";
      speak(`Anh muốn ${intentText} ${result.quantity} thùng ${productName}. Đúng không?`);

    } catch (e) {
      console.error(e);
      speak("Lỗi kết nối.");
    }
  };

  // ================================
  // 4. SPEECH INIT
  // ================================
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onend = () => {
      if (!isSpeakingRef.current && appState !== APP_STATE.SLEEP) {
        try { recognition.start(); } catch (e) { }
      } else if (appState === APP_STATE.SLEEP) {
        if (!isSpeakingRef.current) {
          try { recognition.start(); } catch (e) { }
        }
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      addLog(`USER: ${transcript}`, 'user');
      resetSleepTimer();

      if (appState === APP_STATE.SLEEP) {
        handleWakeWordDetection(transcript);
      } else if (appState === APP_STATE.LISTENING) {
        processVoiceCommand(transcript);
      } else if (appState === APP_STATE.CONFIRMING) {
        handleConfirmation(transcript);
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) { }

    return () => {
      recognition.stop();
    };
  }, [appState, dataProducts, inventory]);


  // ================================
  // RENDER UI
  // ================================
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Screens */}
      <div className="mx-auto max-w-md bg-gray-900 min-h-screen relative">
        {activeTab === 'dashboard' && <DashboardScreen transactions={dataTransactions} products={dataProducts} inventory={inventory} />}
        {activeTab === 'products' && <ProductScreen inventory={inventory} />}
        {activeTab === 'history' && <HistoryScreen transactions={dataTransactions} />}
        {activeTab === 'voice' && <VoiceScreen appState={appState} logs={logs} handleMicClick={handleMicClick} />}
      </div>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
