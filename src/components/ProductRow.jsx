import React from 'react';
import { AlertTriangle, CheckCircle, PackageX } from 'lucide-react';

const ProductRow = ({ product }) => {
    const { name, totalImport, totalExport, currentStock, minStock } = product;

    let statusIcon = <CheckCircle size={18} className="text-green-500" />;
    let statusText = "";
    let rowClass = "border-b border-gray-700 hover:bg-gray-700/30 transition-colors";

    if (currentStock < 0) {
        statusIcon = <PackageX size={18} className="text-red-500 animate-pulse" />;
        statusText = "Lệch kho";
        rowClass += " bg-red-900/20";
    } else if (currentStock < minStock) {
        statusIcon = <AlertTriangle size={18} className="text-yellow-500" />;
        statusText = "Sắp hết";
    }

    return (
        <div className={`flex items-center p-4 ${rowClass}`}>
            <div className="mr-3 w-8 flex justify-center">
                {statusIcon}
            </div>
            <div className="flex-1">
                <div className="font-medium text-white text-sm">{name}</div>
                <div className="flex space-x-4 mt-1 text-xs text-gray-400">
                    <span>Nhập: <strong className="text-blue-400">{totalImport}</strong></span>
                    <span>Bán: <strong className="text-orange-400">{totalExport}</strong></span>
                </div>
                {statusText && <div className="text-[10px] text-red-400/80 mt-1 uppercase tracking-wider font-bold">{statusText}</div>}
            </div>
            <div className="text-right">
                <div className={`text-xl font-bold ${currentStock < minStock ? 'text-red-500' : 'text-green-500'}`}>
                    {currentStock}
                </div>
                <div className="text-[10px] text-gray-500">Tồn kho</div>
            </div>
        </div>
    );
};

export default ProductRow;
