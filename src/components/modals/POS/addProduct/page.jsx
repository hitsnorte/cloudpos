'use client';

import React, { useState } from 'react';

export default function AddProductModal({ selectedProduct, setSelectedProduct, addToCart }) {
    const [count, setCount] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    if (!selectedProduct) return null;

    const handleSave = () => {
        if (count > 0) {
            setIsLoading(true);
            addToCart({ ...selectedProduct, quantity: count });
            setSelectedProduct(null);
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-40 h-full" />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-110 bg-white shadow-xl rounded-lg z-50 bg-[#FAFAFA]">
                <div className=" w-full">
                    <div className="flex justify-between items-center mb-4 px-4 py-3 bg-[#FC9D25] rounded-t-lg">
                        <h2 className="text-l font-semibold text-white ml-1">Add product</h2>
                    </div>

                    <h2 className="text-l font-semibold text-black ml-5 mb-5">
                        {selectedProduct.name
                            .toLowerCase()
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}
                    </h2>

                    <div className="flex items-center justify-left px-6">
                        {/* Preço */}
                        <div className="flex flex-col">
                            <div className="text-xl text-[#FC9D25] font-semibold whitespace-nowrap">
                                €{selectedProduct?.price.toFixed(2)}/un
                            </div>
                            <div className="text-sm text-black whitespace-nowrap">
                                Iva {selectedProduct?.iva?.toFixed(2)}%
                            </div>
                        </div>

                        {/* Seletor de quantidade */}
                        <div className="flex items-center rounded overflow-hidden border border-gray-200 w-max fixed ml-67 -mt-4">
                            <button
                                onClick={() => setCount(prev => Math.max(1, prev - 1))}
                                className="px-4 py-1 bg-white text-[#FC9D25] hover:bg-gray-300 transition"
                            >
                                <span className="inline-block transform scale-150 font-thin">-</span>
                            </button>
                            <span className="px-2 py-1 bg-white text-sm font-medium text-[#191919] border-gray-300">
                                {count} un
                            </span>
                            <button
                                onClick={() => setCount(prev => prev + 1)}
                                className="px-3.5 py-1 bg-white text-[#FC9D25] hover:bg-gray-300 transition"
                            >
                                <span className="inline-block transform scale-150 font-thin">+</span>
                            </button>
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex justify-end gap-4 ml-8 mb-5 mt-5 mr-7">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="w-30 py-1 bg-[#D3D3D3] text-white rounded-md font-medium"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleSave}
                            className="w-30 py-1 bg-[#FC9D25] text-white rounded-md font-medium"
                        >
                            {isLoading ? 'Saving..' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
