'use client'

import { fetchGrup } from '@/src/lib/apigroup'
import { fetchProduct } from '@/src/lib/apiproduct'
import { useEffect, useState } from 'react'
import { TiShoppingCart } from 'react-icons/ti'
import { IoTrashBinOutline } from "react-icons/io5";
import { ChevronDown, ChevronRight } from 'lucide-react'

export default function ProductGroups() {
    const [groupsWithProducts, setGroupsWithProducts] = useState([])
    const [openGroupID, setOpenGroupID] = useState(null)
    const [loading, setLoading] = useState(true)
    const [propertyID, setPropertyID] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [count , setCount]= useState(1)
    const [cartOpen , setCartOpen] = useState(false)
    const [cartItems, setCartItems] = useState([])

    const toggleCart = () => setCartOpen(prev => !prev);

    const closeModal = () => {
        setSelectedProduct(null);
        setCount(1);
    };


    const toggleGroup = (id) => {
        setOpenGroupID((prev) => (prev === id ? null : id))
    }

    // UseEffect to fetch propertyID from localStorage
    useEffect(() => {
        const fetchPropertyID = async () => {
            try {
                const stored = localStorage.getItem('selectedProperty')

                if (stored) {
                    const parsed = JSON.parse(stored)

                    setPropertyID(String(parsed?.id)) //Atualiza estado C/ ID
                } else {

                }
            } catch (e) {
                console.error("Error reading 'selectedProperty'", e)
            }
        }
        fetchPropertyID()
    }, [])

    //Busca grupos e produtos quando o propertyID estiver disponivel
    useEffect(() => {
        if (!propertyID) {

            return
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [groups, products] = await Promise.all([
                    fetchGrup(),
                    fetchProduct(),
                ]);


                const structuredData = groups.map((group) => {
                    const productsForGroup = products
                        .filter((p) => String(p.VCodGrfam) === String(group.VCodGrFam))
                        .map((p, index) => {


                            return {
                                id: p?.VCodProd ? String(p.VCodProd) : `product-${index}`,
                                name: p?.VDESC1?.trim() || 'Unnamed Product',
                            };
                        })


                    return {
                        id: String(group.VCodGrFam),
                        name: group.VDesc,
                        products: productsForGroup,
                    };
                });

                setGroupsWithProducts(structuredData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData()
    }, [propertyID])

    if (loading) {
        return <div className="p-6">LOADING PRODUCTS...</div>
    }

    if (groupsWithProducts.length === 0) {
        return <div className="p-6">NO GROUP OR PRODUCT FOUND</div>
    }

    return (
        <>
            {/*  botão do carrinho */}
            <div className="absolute top-4 right-4 z-50">
                <button className="text-3xl text-[#191919] hover:text-[#FC9D25] transition" onClick={toggleCart}>
                    <TiShoppingCart />
                </button>
            </div>

        {selectedProduct && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FAFAFA] bg-opacity-90 rounded-lg  w-full max-w-md p-6">
                <div className="bg-[#FAFAFA] rounded-lg shadow-xl w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-4 px-4 py-2 bg-[#FC9D25] rounded-t-lg">
                        <h2 className=" text-xl font-semibold text-white ">
                            {selectedProduct.name}
                        </h2>

                        <button onClick={closeModal} className="text-white text-xl">
                            x
                        </button>
                    </div>

                    <div className="flex items-center justify-center space-x-4 mt-4">
                        <button
                            onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                            className="px-3 py-1 bg-gray-300 text-[#191919] rounded hover:bg-gray-400 transition"
                        >
                            -
                        </button>
                        <span className="text-xl font-medium text-[#191919]">{count}</span>
                        <button
                            onClick={() => setCount((prev) => prev + 1)}
                            className="px-3 py-1 bg-gray-300 text-[#191919] rounded hover:bg-gray-400 transition"
                        >
                            +
                        </button>
                    </div>

                    {/* Modal de quantidades*/}
                    <div className="mt-6 flex justify-end gap-2">
                        <button onClick={closeModal} className="bg-red-500 text-[#191919] px-4 py-2 rounded hover: bg-indigo-600 transition ">
                            Close
                        </button>

                        <button onClick={()=>{
                            setCartItems(prev => {
                                const existing = prev.find(item => item.id === selectedProduct.id);
                                if (existing) {
                                    return prev.map(item => item.id === selectedProduct.id ? {...item, count:item.count + count} : item);
                                }
                                else {
                                    return [...prev, {...selectedProduct,count}];
                                }
                            });
                            closeModal();
                        }} className="bg-[#FC9D25] text-white px-4 py-2 rounded ml-2">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        )}

            {/* Modal do carrinho */}
            {cartOpen &&
            <div className="fixed top-16 right-4  bg-opacity-10 z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                    <button onClick={toggleCart}
                    className="absolute top-2 right-1 text-[#1919] text-lg">
                        X
                    </button>

                    <h2 className="text-xl font-semibold text-[#191919] mb-4">
                        Your Cart
                    </h2>
                    {cartItems.length === 0 ? (
                        <p className="text-[#191919]">No products added.</p>
                    ) : (
                        <ul className="space-y-2">
                            {cartItems.map((item, index) => (
                                <li
                                    key={item.id || `item-${index}`}
                                    className="flex justify-between items-center border-b pb-2"
                                >
                                    <div>
                                        <p className="font-medium text-[#191919]">{item.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.count}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#FC9D25] font-bold">...€</span>
                                        <button onClick={()=>{
                                            setCartItems(prev => prev.filter(ci => ci.id !== item.id));

                                        }}
                                                className="text-red-500 hover:text-red-700 transition"
                                        >
                                            <IoTrashBinOutline size={20}></IoTrashBinOutline>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>}

        <div className="p-6 space-y-4">
            {groupsWithProducts.map((group) => {
                const isOpen = openGroupID === group.id
                return (
                    <div key={group.id} className="rounded shadow-md overflow-hidden">
                        <div
                            className="flex items-center justify-between py-3 px-4 bg-white cursor-pointer hover:bg-indigo-50 text-[#191919] transition-colors"
                            onClick={() => toggleGroup(group.id)}
                        >
                            <div className="flex items-center text-lg font-semibold">
                                {group.name}
                            </div>
                            <div className="text-gray-500">
                                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                        </div>

                        {isOpen && (
                            <div className="overflow-x-auto bg-muted/40 transition-all duration-300 ease-in-out">
                                <table className="min-w-full bg-[#FAFAFA] border-collapse border border-[#EDEBEB]">
                                    <thead>
                                    <tr className="bg-[#FC9D25] text-white">
                                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">
                                            Product
                                        </th>
                                        <th className="border border-[#EDEBEB] px-4 py-2 text-right">
                                            Price
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-300">
                                        {group.products.map((product, index) => (
                                            <tr
                                                key={product.id || `product-${index}`}
                                                className="hover:bg-indigo-50 transition-colors"
                                            >
                                                <td className="border border-[#EDEBEB] px-4 py-2 text-gray-700">
                                                    <span
                                                        className="cursor-pointer hover:underline text-[#191919]"
                                                        onClick={() => setSelectedProduct(product)}
                                                    >
                                                        {product.name}
                                                    </span>
                                                </td>
                                                <td className="border border-[#EDEBEB] px-4 py-2 text-right text-gray-500">
                                                    ...€
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>

     </>
    )
}
