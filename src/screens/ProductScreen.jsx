import React, { useMemo } from 'react';
import ProductRow from '../components/ProductRow';

const ProductScreen = ({ inventory }) => {

    const sortedInventory = useMemo(() => {
        // Logic: Low stock (< 5) first, then alphabetical
        return [...inventory].sort((a, b) => {
            // Priority 1: Negative
            if (a.currentStock < 0 && b.currentStock >= 0) return -1;
            if (b.currentStock < 0 && a.currentStock >= 0) return 1;

            // Priority 2: Critical (< 5)
            const aCritical = a.currentStock < 5;
            const bCritical = b.currentStock < 5;
            if (aCritical && !bCritical) return -1;
            if (bCritical && !aCritical) return 1;

            // Priority 3: Alphabetical
            return a.name.localeCompare(b.name);
        });
    }, [inventory]);

    return (
        <div className="pb-24">
            <div className="sticky top-0 bg-gray-900 z-10 p-4 border-b border-gray-800 shadow-md">
                <h1 className="text-2xl font-bold text-white">Tồn kho</h1>
                <div className="text-xs text-gray-400 mt-1">
                    Tổng {inventory.length} sản phẩm
                </div>
            </div>

            <div className="bg-gray-800 divide-y divide-gray-700/50">
                {sortedInventory.map(prod => (
                    <ProductRow key={prod.id} product={prod} />
                ))}
            </div>
        </div>
    );
};

export default ProductScreen;
