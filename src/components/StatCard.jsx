import React from 'react';

const StatCard = ({ title, value, unit, colorClass, icon: Icon }) => {
    return (
        <div className={`bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg flex items-center justify-between`}>
            <div>
                <div className="text-gray-400 text-sm mb-1">{title}</div>
                <div className="flex items-baseline space-x-2">
                    <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
                    {unit && <span className="text-gray-500 text-xs">{unit}</span>}
                </div>
            </div>
            {Icon && (
                <div className={`p-3 rounded-full bg-gray-700/50 ${colorClass}`}>
                    <Icon size={24} />
                </div>
            )}
        </div>
    );
};

export default StatCard;
