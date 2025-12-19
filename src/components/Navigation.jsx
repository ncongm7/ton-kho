import React from 'react';
import { LayoutDashboard, Package, History, Mic } from 'lucide-react';

const TAB_ITEMS = [
    { id: 'dashboard', label: 'Thống kê', icon: LayoutDashboard },
    { id: 'products', label: 'Sản phẩm', icon: Package },
    { id: 'history', label: 'Lịch sử', icon: History },
    { id: 'voice', label: 'Trợ lý', icon: Mic },
];

const Navigation = ({ activeTab, onTabChange }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 pb-safe shadow-2xl z-50">
            <div className="flex justify-around items-center h-16">
                {TAB_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Navigation;
