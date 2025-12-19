import React from 'react';

const APP_STATE = {
    SLEEP: 'SLEEP',
    LISTENING: 'LISTENING',
    CONFIRMING: 'CONFIRMING'
};

const VoiceScreen = ({ appState, logs, handleMicClick }) => {
    let statusColor = "bg-gray-500";
    let statusText = "SLEEPING";

    if (appState === APP_STATE.SLEEP) {
        statusColor = "bg-red-600 shadow-red-500/50";
        statusText = "ĐANG NGỦ...ZZZ";
    } else if (appState === APP_STATE.LISTENING) {
        statusColor = "bg-green-600 shadow-green-500/50";
        statusText = "ĐANG NGHE...";
    } else if (appState === APP_STATE.CONFIRMING) {
        statusColor = "bg-yellow-500 shadow-yellow-500/50";
        statusText = "CHỜ XÁC NHẬN";
    }

    return (
        <div className="flex flex-col items-center p-4 pb-24 h-screen">
            <h1 className="text-2xl font-bold text-white mb-2 mt-4">TRỢ LÝ KHO</h1>
            <div className="text-gray-400 text-sm mb-8">Voice Warehouse Assistant v2.0</div>

            {/* MAIN MIC BUTTON */}
            <div className="relative mb-8 flex-1 flex flex-col justify-center">
                {appState === APP_STATE.LISTENING && (
                    <div className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping"></div>
                )}
                <div
                    onClick={handleMicClick}
                    className={`w-64 h-64 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${statusColor} cursor-pointer hover:scale-105 active:scale-95`}
                >
                    <div className="text-center">
                        <div className="text-6xl mb-2">🎙️</div>
                        <div className="font-bold text-xl text-white">{statusText}</div>
                        {appState === APP_STATE.SLEEP && (
                            <div className="text-xs text-white/70 mt-2">Bấm để kích hoạt loa<br />hoặc nói "Trợ lý ơi"</div>
                        )}
                    </div>
                </div>
            </div>

            {/* LOGS PANEL */}
            <div className="w-full bg-gray-800 rounded-xl p-4 h-64 overflow-y-auto border border-gray-700 shadow-inner custom-scrollbar mb-4">
                {logs.length === 0 && <div className="text-gray-500 text-center mt-20">Chưa có hội thoại nào...</div>}
                {logs.map((log, index) => (
                    <div key={index} className={`mb-3 p-3 rounded-lg ${log.type === 'user' ? 'bg-blue-900/40 ml-12 text-blue-100 text-right' :
                        log.type === 'bot' ? 'bg-green-900/40 mr-12 text-green-100' :
                            'bg-gray-700/50 text-gray-300 text-xs text-center'
                        }`}>
                        <div className="text-[10px] opacity-50 mb-1">{log.time}</div>
                        <div>{log.text}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VoiceScreen;
