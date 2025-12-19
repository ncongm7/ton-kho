import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const HistoryScreen = ({ transactions }) => {
    // Sort by newest first
    const sortedTx = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div className="pb-24">
            <div className="sticky top-0 bg-gray-900 z-10 p-4 border-b border-gray-800 shadow-md">
                <h1 className="text-2xl font-bold text-white">Lịch sử</h1>
                <div className="text-xs text-gray-400 mt-1">
                    {transactions.length} giao dịch gần nhất
                </div>
            </div>

            <div className="bg-gray-800 divide-y divide-gray-700/50">
                {sortedTx.map((tx, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-700/30">
                        <div className="flex items-center">
                            <div className={`p-2 rounded-full mr-3 ${tx.type === 'IMPORT' ? 'bg-blue-900/30 text-blue-400' : 'bg-orange-900/30 text-orange-400'}`}>
                                {tx.type === 'IMPORT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                            </div>
                            <div>
                                <div className="text-white font-medium text-sm">{tx.productName}</div>
                                <div className="text-gray-500 text-xs mt-0.5">{tx.date}</div>
                            </div>
                        </div>
                        <div className={`font-bold text-base ${tx.type === 'IMPORT' ? 'text-blue-400' : 'text-orange-400'}`}>
                            {tx.type === 'IMPORT' ? '+' : '-'}{tx.boxQty}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryScreen;
