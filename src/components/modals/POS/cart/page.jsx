"use client";

import { useState } from "react";
import { TiShoppingCart } from "react-icons/ti";
import { CiTrash } from "react-icons/ci";
import "./style.css";

export default function CartPage({
    currentCart,
    selectedTable,
    getCartItems,
    updateQuantity,
    removeItem,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const total = currentCart.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    return (
        <>
            {/* Carrinho */}
            {!isOpen && selectedTable && (
                <button
                    className="fixed bottom-6 right-6 md:top-6 md:right-15 md:bottom-auto text-3xl text-[#191919] hover:text-[#FC9D25] transition z-50"
                    onClick={toggleSidebar}
                >
                    <TiShoppingCart />
                    {currentCart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {currentCart.reduce((total, item) => total + item.quantity, 0)}
                        </span>
                    )}
                </button>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30"
                    onClick={toggleSidebar}
                ></div>
            )}

            <div
                className={`cart fixed top-0 right-0 h-full w-[400px] max-w-full bg-[#F0F0F0] shadow-lg transition-transform duration-300 z-[9999] ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
            {/* Header */}
                <div className=" header sticky z-10 bg-[#F0F0F0] flex items-center justify-between p-5 ml-1">
                    <h2 className="text-l font-semibold ml-1 mt-5">Your order</h2>
                    <button onClick={toggleSidebar} className="text-l text-[#FC9D25]">
                        <span className="inline-block transform scale-150 font-thin mr-5">x</span>
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-4 py-2">
                    {getCartItems().length === 0 ? (
                        <p className="text-sm">Your order is empty.</p>
                    ) : (
                        <div className="bg-white rounded-l border border-white pt-2 px-4 flex flex-col">
                            {getCartItems().map((item, idx) => (
                                <div
                                    key={item.id}
                                    className={`w-full py-4 ${idx !== getCartItems().length - 1
                                        ? "border-b border-[#EDEDED]"
                                        : "pb-7"
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-sm font-medium">
                                                {item.name
                                                    .toLowerCase()
                                                    .split(" ")
                                                    .map(
                                                        (word) =>
                                                            word.charAt(0).toUpperCase() + word.slice(1)
                                                    )
                                                    .join(" ")}
                                            </p>
                                            <div className="flex items-center justify-between mt-2 gap-4">
                                                {/* Quantity controls */}
                                                <div className="flex items-center rounded overflow-hidden border border-gray-200 w-max">
                                                    <button
                                                        className="px-3.5 py-1 bg-white text-[#FC9D25] hover:bg-gray-300 transition"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                Math.max(1, item.quantity - 1)
                                                            )
                                                        }
                                                    >
                                                        <span className="inline-block transform scale-150 font-thin">
                                                            -
                                                        </span>
                                                    </button>
                                                    <span className="px-1 py-1 bg-white text-sm font-medium text-[#191919] border-gray-300">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        className="px-3 py-1 bg-white text-[#FC9D25] hover:bg-gray-300 transition"
                                                        onClick={() =>
                                                            updateQuantity(item.id, item.quantity + 1)
                                                        }
                                                    >
                                                        <span className="inline-block transform scale-150 font-thin">
                                                            +
                                                        </span>
                                                    </button>
                                                </div>
                                                <div className="px-8 text-sm text-[#191919] whitespace-nowrap">
                                                    €{item.price.toFixed(2)}/un
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-between space-y-2">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Remover produto"
                                            >
                                                <CiTrash size={20} />
                                            </button>
                                            <p className="text-sm font-semibold text-right m-2 mt-2">
                                                €{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 w-full bg-white p-3 border-white">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold ml-2">Total:</span>
                        <span className="text-sm font-bold mr-2">€{total.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-3">
                        {showConfirm && <div className="fixed inset-0 bg-opacity-30 z-40" />}
                        <div className="relative z-50 inline-block">
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="w-12 ml-2 border border-[#ff0000] text-[#ff0000] rounded py-2 text-sm hover:bg-[#fff4e6] transition flex items-center justify-center gap-2"
                            >
                                <CiTrash className="text-sm" size={20} />
                            </button>
                        </div>
                        <button className="w-1/2 mr-2 bg-[#FC9D25] text-white rounded py-2 text-sm hover:bg-[#e88a1c] transition flex items-center justify-center gap-2">
                            Cancel
                        </button>
                        <button className="w-1/2 mr-2 bg-[#FC9D25] text-white rounded py-2 text-sm hover:bg-[#e88a1c] transition flex items-center justify-center gap-2">
                            Order
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
