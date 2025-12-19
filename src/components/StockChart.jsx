import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const StockChart = ({ data }) => {
    const [mode, setMode] = useState('IMPORT'); // 'IMPORT' | 'EXPORT'

    // Transform data for chart: Group by product name
    const chartData = data.map(item => ({
        name: item.name,
        IMPORT: item.totalImport,
        EXPORT: item.totalExport,
    }));

    return (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg mt-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">Biểu đồ hoạt động</h3>
                <div className="flex space-x-2 bg-gray-900 rounded-lg p-1">
                    <button
                        onClick={() => setMode('IMPORT')}
                        className={`px-3 py-1 text-xs rounded transition-all ${mode === 'IMPORT' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                    >
                        Nhập
                    </button>
                    <button
                        onClick={() => setMode('EXPORT')}
                        className={`px-3 py-1 text-xs rounded transition-all ${mode === 'EXPORT' ? 'bg-orange-600 text-white' : 'text-gray-400'}`}
                    >
                        Bán
                    </button>
                </div>
            </div>

            <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" interval={0} fontSize={10} tickFormatter={(val) => val.split(' ')[0] + '...'} />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar
                            dataKey={mode}
                            fill={mode === 'IMPORT' ? '#3B82F6' : '#EA580C'}
                            radius={[4, 4, 0, 0]}
                            name={mode === 'IMPORT' ? 'Số lượng Nhập' : 'Số lượng Bán'}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StockChart;
