import React, { useMemo, useState } from 'react';
import { PackagePlus, PackageMinus, Boxes, Calendar } from 'lucide-react';
import { isSameDay, subDays, startOfMonth, startOfToday, isWithinInterval, parseISO } from 'date-fns';
import StatCard from '../components/StatCard';
import StockChart from '../components/StockChart';

const DashboardScreen = ({ transactions, products, inventory }) => {
    const [dateFilter, setDateFilter] = useState('TODAY'); // TODAY, YESTERDAY, 7DAYS, 30DAYS

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        const now = startOfToday();
        let startDate = now;
        let endDate = now;

        if (dateFilter === 'YESTERDAY') {
            startDate = subDays(now, 1);
            endDate = subDays(now, 1);
        } else if (dateFilter === '7DAYS') {
            startDate = subDays(now, 6);
        } else if (dateFilter === '30DAYS') {
            startDate = subDays(now, 29);
        }

        return transactions.filter(tx => {
            const txDate = parseISO(tx.timestamp);
            // Simple day comparison for single days (start=end)
            if (dateFilter === 'TODAY' || dateFilter === 'YESTERDAY') {
                return isSameDay(txDate, startDate);
            }
            return isWithinInterval(txDate, { start: startDate, end: endDate.setHours(23, 59, 59, 999) });
        });
    }, [transactions, dateFilter]);

    // Aggregation
    const stats = useMemo(() => {
        const result = {
            totalImport: 0,
            totalExport: 0,
            activeProducts: new Set()
        };

        filteredTransactions.forEach(tx => {
            if (tx.type === 'IMPORT') result.totalImport += tx.boxQty;
            if (tx.type === 'EXPORT') result.totalExport += tx.boxQty;
            result.activeProducts.add(tx.productName);
        });

        return result;
    }, [filteredTransactions]);

    // Prepare Chart Data based on filtered transactions
    const topProductsMap = useMemo(() => {
        const map = {};
        filteredTransactions.forEach(tx => {
            if (!map[tx.productName]) map[tx.productName] = { name: tx.productName, totalImport: 0, totalExport: 0 };
            if (tx.type === 'IMPORT') map[tx.productName].totalImport += tx.boxQty;
            if (tx.type === 'EXPORT') map[tx.productName].totalExport += tx.boxQty;
        });
        return Object.values(map);
    }, [filteredTransactions]);


    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-bold text-white mb-4">Tổng quan</h1>

            {/* Date Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
                {['TODAY', 'YESTERDAY', '7DAYS', '30DAYS'].map(key => (
                    <button
                        key={key}
                        onClick={() => setDateFilter(key)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${dateFilter === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                    >
                        {key === 'TODAY' ? 'Hôm nay' : key === 'YESTERDAY' ? 'Hôm qua' : key === '7DAYS' ? '7 ngày qua' : '30 ngày qua'}
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 mt-2">
                <StatCard
                    title={dateFilter === 'TODAY' ? "Nhập hôm nay" : "Tổng nhập"}
                    value={stats.totalImport}
                    unit="thùng"
                    colorClass="text-blue-400"
                    icon={PackagePlus}
                />
                <StatCard
                    title={dateFilter === 'TODAY' ? "Bán hôm nay" : "Tổng bán"}
                    value={stats.totalExport}
                    unit="thùng"
                    colorClass="text-orange-400"
                    icon={PackageMinus}
                />
                <StatCard
                    title="Sản phẩm phát sinh"
                    value={stats.activeProducts.size}
                    unit="loại"
                    colorClass="text-green-400"
                    icon={Boxes}
                />
            </div>

            {/* Charts */}
            {topProductsMap.length > 0 ? (
                <StockChart data={topProductsMap} />
            ) : (
                <div className="mt-8 text-center text-gray-500 text-sm italic">
                    Không có dữ liệu trong khoảng thời gian này
                </div>
            )}
        </div>
    );
};

export default DashboardScreen;
