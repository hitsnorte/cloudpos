'use client'

import { fetchGrup } from '@/src/lib/apigroup'
import { fetchProduct } from '@/src/lib/apiproduct'
import { fetchFamily } from '@/src/lib/apifamily'
import { useEffect, useState } from 'react'
import { TiShoppingCart } from 'react-icons/ti'
import { useRouter } from "next/navigation";
import { IoTrashBinOutline } from "react-icons/io5";
import { ChevronDown, ChevronRight } from 'lucide-react'
import { fetchSubfamily } from '@/src/lib/apisubfamily';
import { fetchDashboard } from '@/src/lib/apidashboard';
import { fetchClassepreco } from '@/src/lib/apiclassepreco';
import { fetchPreco } from "@/src/lib/apipreco";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { Card, CardBody } from "@heroui/react";
import { useSession } from "next-auth/react"; // Import useSession
import {
    Spinner,
} from '@nextui-org/react';


export default function ProductGroups() {
    const [groupsWithProducts, setGroupsWithProducts] = useState([])
    const [openGroupID, setOpenGroupID] = useState(null)
    const [loading, setLoading] = useState(true)
    const [propertyID, setPropertyID] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [cartOpen, setCartOpen] = useState(false)
    const [cartItems, setCartItems] = useState([])
    const [familiesWithProducts, setFamiliesWithProducts] = useState([]);
    const [subfamiliesWithProducts, setSubfamiliesWithProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [produtos, setProdutos] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const router = useRouter();
    const { data: session, status } = useSession();
    const [classeprecoWithProducts, setClasseprecoWithProducts] = useState([]);
    const [precoWithProducts, setPrecoWithProducts] = useState([]);
    const [isConfirmed, setIsConfirmed] = useState(() => JSON.parse(localStorage.getItem("isConfirmed")) || false);
    const [selectedCardPath, setSelectedCardPath] = useState(null);


    const [viewType, setViewType] = useState('groups', 'families', 'subfamilies') // 'groups' | 'families' | 'subfamilies'


    //side bar
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);


    const toggleCart = () => setCartOpen(prev => !prev);

    const closeModal = () => {
        setSelectedProduct(null);
        setCount(1);
    };

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);

            if (existingItem) {
                // Já existe — somar quantidade
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + product.quantity }
                        : item
                );
            } else {
                // Novo produto
                return [...prevItems, product];
            }
        });
    };
    const filterByName = (items) => {
        if (!searchTerm.trim()) return items;

        return items
            .map((item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ? item : null
            )
            .filter(Boolean);
    };

    const toggleGroup = (id) => {
        setOpenGroupID((prev) => (prev === id ? null : id))
    }

    //side bar carrinho
    useEffect(() => {
        console.log("Cart updated:", cartItems);
    }, [cartItems]);

    const [quantities, setQuantities] = useState(() => {
        return cartItems.reduce((acc, item) => {
            acc[item.id] = item.quantity || 1;
            return acc;
        }, {});
    });

    useEffect(() => {
        setQuantities(
            cartItems.reduce((acc, item) => {
                acc[item.id] = item.quantity || 1;
                return acc;
            }, {})
        );
    }, [cartItems]);

    const removeItem = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
        setQuantities({});
    };


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

    const [count, setCount] = useState(() => {
        return selectedProduct?.id ? (quantities[selectedProduct.id] || 1) : 1;
    });

    //Busca grupos e produtos quando o propertyID estiver disponivel
    useEffect(() => {
        if (!propertyID) {

            return
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [groups, families, subfamilies, products, classeprecos, precos] = await Promise.all([
                    fetchGrup(),
                    fetchFamily(),
                    fetchSubfamily(),
                    fetchProduct(),
                    fetchClassepreco(),
                    fetchPreco(),
                ]);


                const precoMap = new Map();
                precos.forEach((preco) => {
                    const key = String(preco.VCodprod).trim();  // usar VCodprod (mesmo que VPRODUTO na api produtos)
                    const value = parseFloat(String(preco.npreco).replace(',', '.')) || 0;
                    precoMap.set(key, value);
                });

                const structuredGroups = groups.map((group) => {
                    const productsForGroup = products
                        .filter((p) => String(p.VCodGrfam) === String(group.VCodGrFam))
                        .map((p, index) => {
                            const id = p?.VPRODUTO ? String(p.VPRODUTO) : `product-${index}`;
                            const name = p?.VDESC1?.trim() || 'Unnamed Product';
                            const price = precoMap.get(String(p.VPRODUTO)) || 0;

                            return { id, name, price };
                        });

                    return {
                        id: String(group.VCodGrFam),
                        name: group.VDesc,
                        products: productsForGroup,
                    };
                });

                // Processa famílias
                const structuredFamilies = families.map((family) => {
                    const productsForFamily = products
                        .filter((p) => String(p.VCodFam) === String(family.VCodFam))
                        .map((p, index) => ({
                            id: p?.VCodProd ? String(p.VCodProd) : `product-${index}`,
                            name: p?.VDESC1?.trim() || 'Unnamed Product',
                        }));

                    return {
                        id: String(family.VCodFam),
                        name: family.VDesc,
                        products: productsForFamily,
                    };
                });

                // Subfamílias
                const structuredSubfamilies = subfamilies.map((subfamily) => {
                    const productsForSubfamily = products
                        .filter((p) => String(p.VCodSubFam) === String(subfamily.VCodSubFam))
                        .map((p, index) => ({
                            id: p?.VCodProd ? String(p.VCodProd) : `product-${index}`,
                            name: p?.VDESC1?.trim() || 'Unnamed Product',
                        }));
                    return {
                        id: String(subfamily.VCodSubFam),
                        name: subfamily.VDesc,
                        products: productsForSubfamily,
                    };
                });


                //classepreco
                const structuredClassePrecos = classeprecos.map((classepreco) => {
                    const productsForClassepreco = products
                        .filter((p) => String(p.Vcodi) === String(classepreco.Vcodi))
                        .map((p, index) => ({
                            id: p?.VCodProd ? String(p.VCodProd) : `product-${index}`,
                            name: p?.VDESC1?.trim() || 'Unnamed Product',
                        }));

                    return {
                        id: String(classepreco.Vcodi),
                        name: classepreco.Vdesc,
                        products: productsForClassepreco,
                    };
                });

                //preco
                const structuredPrecos = precos.map((preco) => {
                    const productsForPreco = products
                        .filter((p) => String(p.vCodigo) == String(preco.vCodigo))
                        .map((p, index) => ({
                            id: p?.VCodProd ? String(p.VCodProd) : `product-${index}`,
                            name: p?.VdescProd?.trim() || 'Unnamed Product',
                            price: parseFloat(p?.npreco) || 0, // Garantir número, não string
                        }));

                    return {
                        id: String(preco.vCodigo),
                        name: preco.VdescProd,
                        price: preco.npreco,
                        products: productsForPreco,
                    };
                });

                setGroupsWithProducts(structuredGroups);
                setFamiliesWithProducts(structuredFamilies);
                setSubfamiliesWithProducts(structuredSubfamilies);
                setClasseprecoWithProducts(structuredClassePrecos);
                setPrecoWithProducts(structuredPrecos);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [propertyID]);

    // If the property is not confirmed, redirect to homepage
    useEffect(() => {
        if (!isConfirmed) {
            router.push("/"); // Redirect to the homepage if the property is not confirmed
        }
    }, [isConfirmed, router]);

    // useeffect para a dashboard
    useEffect(() => {
        const fetchData = async () => {
            if (status === "authenticated" && isConfirmed) {
                try {
                    const data = await fetchDashboard();
                    if (data && data.BLIND !== undefined && data.SPA !== undefined && data.FLORBELA !== undefined) {
                        setDashboardData(data); // Store the fetched data
                    } else {
                        throw new Error('Invalid data received from API');
                    }
                } catch (error) {
                    console.log('Error fetching dashboard data:', error);
                    setDashboardData({ BLIND: 0, SPA: 0, FLORBELA: 0, });
                }
            }
        };

        // Only fetch data if the status is authenticated and the property is confirmed
        if (status === "authenticated" && isConfirmed) {
            fetchData(); // Fetch dashboard data when status or isConfirmed changes
        }
    }, [status, isConfirmed]); // Fetch data again when the session or confirmation status changes


    if (status === "loading" || loading) {
        return <p className="text-center text-lg">Carregando...</p>;
    }

    if (!dashboardData) {
        return <p className="text-center text-lg">Loading dashboard...</p>;
    }

    const cardPaths = [
        { label: "BLIND", value: dashboardData.BLIND || 0, path: "/homepage/" },
        { label: "SPA", value: dashboardData.SPA || 0, path: "/homepage/" },
        { label: "FLORBELA", value: dashboardData.FLORBELA || 0, path: "/homepage/" },
    ];

    if (loading) {
        return <div className="p-6">LOADING PRODUCTS...</div>
    }

    if (groupsWithProducts.length === 0) {
        return <div className="p-6">NO GROUP OR PRODUCT FOUND</div>
    }

    if (familiesWithProducts.length === 0) {
        return <div className="p-6">NO FAMILIES OR PRODUCT FOUND</div>
    }

    if (subfamiliesWithProducts.length === 0) {
        return <div className="p-6">NO SUBFAMILIES OR PRODUCT FOUND</div>
    }


    return (
        <>
            {!selectedCardPath && (
                <>
                    <h1 className="text-3xl font-semibold px-4">Dashboard</h1>
                    <div className="px-4 flex flex-wrap gap-6 p-6">
                        {cardPaths.map((card, index) => (
                            <Card
                                key={index}
                                className="w-70 h-45 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col items-center cursor-pointer hover:bg-gray-100"
                            >
                                <CardBody className="flex flex-col items-center w-full h-full relative">
                                    <div
                                        className="w-full h-full cursor-pointer hover:bg-gray-100"
                                        onClick={() => setSelectedCardPath(card.path)} // define o card selecionado
                                    >
                                        <p className="text-5xl font-bold text-[#FC9D25] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <TiShoppingCart />
                                        </p>
                                        <p className="text-center h-13 text-lg text-gray-600 absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                            {card.label}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </>
            )}


            {/* Conteúdo restante só aparece após clicar em um card */}
            {selectedCardPath && (
                <>


                    <div className="flex items-center justify-center space-x-4 ">

                        {/*  botão de selecao de groups, families e subfamilies */}
                        <button
                            onClick={() => setViewType('groups')}
                            className={`px-4 py-2 rounded ${viewType === 'groups' ? 'bg-[#FC9D25] text-white' : 'bg-gray-200 text-[#191919]'}`}
                        >
                            Groups
                        </button>
                        <button
                            onClick={() => setViewType('families')}
                            className={`px-4 py-2 rounded ${viewType === 'families' ? 'bg-[#FC9D25] text-white' : 'bg-gray-200 text-[#191919]'}`}
                        >
                            Families
                        </button>
                        <button
                            onClick={() => setViewType('subfamilies')}
                            className={`px-4 py-2 rounded ${viewType === 'subfamilies' ? 'bg-[#FC9D25] text-white' : 'bg-gray-200 text-[#191919]'}`}
                        >
                            Subfamilies
                        </button>
                        {selectedCardPath && (
                            <button
                                onClick={() => setSelectedCardPath(null)}
                                className="fixed top-6 right-[958] bg-[#FC9D25] text-white px-4 py-2 rounded "
                            >
                                Dashboard
                            </button>
                        )}
                    </div>

                    <div className="py-5 px-6 " >
                        {/* Campo de pesquisa */}
                        <div className="mb-4 relative">
                            <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Pesquisar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>
                    </div>

                    {/*  botão do carrinho */}
                    <div className="relative">
                        {/* Botão Carrinho */}
                        {!isOpen && (
                            <button
                                className="fixed top-6 right-15 z-50 text-3xl text-[#191919] hover:text-[#FC9D25] transition"
                                onClick={toggleSidebar}
                            >
                                <TiShoppingCart />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItems.reduce((total, item) => total + item.quantity, 0)}
                                    </span>
                                )}
                            </button>
                        )}
                        {/* Overlay escuro */}
                        {isOpen && (
                            <div
                                className="fixed inset-0 bg-black/40 z-30"
                                onClick={toggleSidebar}
                            ></div>
                        )}
                        {/* Sidebar Carrinho */}
                        <div
                            className={`fixed top-0 right-0 h-full w-[400px] max-w-full bg-white shadow-lg transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                                }`}
                        >
                            {/* Cabeçalho */}
                            <div className="flex items-center justify-between p-3 border-b">
                                <h2 className="text-xl font-semibold">O seu carrinho</h2>
                                <button onClick={toggleSidebar} className="text-2xl font-bold text-gray-600 hover:text-black">&times;</button>
                            </div>

                            {/* Conteúdo do Carrinho */}
                            <div className="p-7 flex flex-col h-[calc(100%-150px)] overflow-y-auto">
                                {cartItems.length === 0 ? (
                                    <p className="text-gray-500">O seu carrinho está vazio.</p>
                                ) : (
                                    cartItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-3 border-b">
                                            <div className="w-full">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-medium">{item.name}</p>

                                                        <div className="flex items-center rounded overflow-hidden border border-gray-200 w-max">
                                                            <button
                                                                className="px-3.5 py-1.5 bg-white text-[#191919] hover:bg-gray-300 transition"

                                                                onClick={() => {
                                                                    setQuantities(prev => {
                                                                        const newQuantity = Math.max(1, (prev[item.id] || 1) - 1);

                                                                        // Atualiza a quantidade no cartItems também
                                                                        setCartItems(cartPrev =>
                                                                            cartPrev.map(ci =>
                                                                                ci.id === item.id ? { ...ci, quantity: newQuantity } : ci
                                                                            )
                                                                        );

                                                                        return {
                                                                            ...prev,
                                                                            [item.id]: newQuantity,
                                                                        };
                                                                    });
                                                                }}
                                                            >
                                                                -
                                                            </button>

                                                            <span className="px-4 py-1 bg-white text-xl font-medium text-[#191919] border-gray-300">
                                                                {quantities[item.id] || 1}
                                                            </span>

                                                            <button
                                                                className="px-3.5 py-1.5 bg-white text-[#191919] hover:bg-gray-300 transition"

                                                                onClick={() => {
                                                                    setQuantities(prev => {
                                                                        const newQuantity = (prev[item.id] || 1) + 1;

                                                                        setCartItems(cartPrev =>
                                                                            cartPrev.map(ci =>
                                                                                ci.id === item.id ? { ...ci, quantity: newQuantity } : ci
                                                                            )
                                                                        );

                                                                        return {
                                                                            ...prev,
                                                                            [item.id]: newQuantity,
                                                                        };
                                                                    });
                                                                }}
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                    </div>

                                                    <div className="flex flex-col items-end justify-between min-w-[70px] space-y-2">
                                                        {/* Botão de remover */}
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Remover produto"
                                                        >
                                                            <IoTrashBinOutline />
                                                        </button>

                                                        {/* Preço total do item */}
                                                        <p className="text-sm font-semibold text-right m-2">
                                                            {(item.price * quantities[item.id]).toFixed(2)} €
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Rodapé */}
                            < div className="absolute bottom-0 w-full bg-white p-4 border-t" >
                                <div className="flex justify-between mb-4">
                                    <span className="text-sm font-medium">Total:</span>
                                    <span className="text-lg font-bold">{total.toFixed(2)} €</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={clearCart} // função que deves ter para limpar o carrinho
                                        className="w-12 border border-[#FC9D25] text-[#FC9D25] rounded py-2 text-sm hover:bg-[#fff4e6] transition flex items-center justify-center gap-2"
                                    >
                                        <IoTrashBinOutline className="text-lg" />

                                    </button>
                                    <button className="w-full bg-[#FC9D25] text-white rounded py-2 text-sm hover:bg-[#e88a1c] transition flex items-center justify-center gap-2">
                                        <TiShoppingCart className="text-lg" />
                                        Comprar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedProduct && (
                        <div className="absolute top-1/3 left-1/3 w-100 bg-white shadow-xl rounded-lg ">
                            <div className="bg-[#FAFAFA] w-full ">
                                <div className="flex justify-between items-center mb-4 px-4 py-2 bg-[#FC9D25] rounded-t-lg">
                                    <h2 className=" text-xl font-semibold text-white ">
                                        {selectedProduct.name}
                                    </h2>

                                    <button onClick={closeModal} className="text-white text-xl">
                                        x
                                    </button>
                                </div>

                                <div className="flex items-center justify-center space-x-33 m-5">
                                    {/* Preço */}
                                    <div className="text-lg text-[#191919] font-semibold whitespace-nowrap">
                                        Price: {(selectedProduct?.price).toFixed(2)} €
                                    </div>

                                    {/* Seletor de quantidade */}
                                    <div className="flex items-center rounded overflow-hidden border border-gray-200 w-max">
                                        <button
                                            onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                                            className="px-4 py-1.5 bg-white text-[#191919] hover:bg-gray-300 transition"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-1 bg-white text-xl font-medium text-[#191919] border-gray-300">
                                            {count}
                                        </span>
                                        <button
                                            onClick={() => setCount((prev) => prev + 1)}
                                            className="px-3.5 py-1.5 bg-white text-[#191919] hover:bg-gray-300 transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Modal de quantidades*/}
                                <div className="mt-6 flex justify-end gap-2 "
                                >

                                    <button
                                        onClick={() => {
                                            if (count > 0) {
                                                addToCart({ ...selectedProduct, quantity: count });
                                                setSelectedProduct(null); // fecha o modal
                                            }
                                        }} className="px-6 py-2 m-5 mt-0 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200">
                                        {isLoading ? <Spinner size="sm" color="white" /> : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal do carrinho */}
                    {cartOpen && (
                        <div className="fixed top-16 right-16">
                            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 relative">
                                <button
                                    onClick={toggleCart}
                                    className="absolute top-4 right-4 text-[#191919] text-lg"
                                >
                                    X
                                </button>

                                <h2 className="text-xl font-semibold text-[#191919] mb-7">Your Cart</h2>
                                {cartItems.length === 0 ? (
                                    <p className="text-[#191919] text-left">No products added.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {cartItems.map((item, index) => (
                                            <li
                                                key={item.id || `item-${index}`}
                                                className="flex justify-between items-center border-b pb-2"
                                            >
                                                <div>
                                                    <p className="font-medium text-[#191919] px-5">{item.name}</p>
                                                    <div className="px-5 text-sm text-gray-500 flex items-center gap-2">
                                                        Qty:
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.count}
                                                            onChange={(e) => {
                                                                const newCount = parseInt(e.target.value);
                                                                if (newCount >= 1) {
                                                                    setCartItems((prev) =>
                                                                        prev.map((ci) =>
                                                                            ci.id === item.id ? { ...ci, count: newCount } : ci
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                            className="w-16 border rounded px-2 py-1 text-center"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[#FC9D25] font-bold">...€</span>
                                                    <button
                                                        onClick={() => {
                                                            setCartItems((prev) =>
                                                                prev.filter((ci) => ci.id !== item.id)
                                                            );
                                                        }}
                                                        className="text-red-500 hover:text-red-700 transition"
                                                    >
                                                        <IoTrashBinOutline size={20} />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}


                    <div className="p-6 space-y-4">
                        {viewType === 'groups' && filterByName(groupsWithProducts).map((group) => {
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
                                                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">
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
                                                                    onClick={() => {
                                                                        setSelectedProduct(product); // abre modal
                                                                        setCount(1); // resetar quantidade
                                                                    }}

                                                                >
                                                                    {product.name}
                                                                </span>
                                                            </td>
                                                            
                                                             <td className="border border-[#EDEBEB] px-3 py-2 text-right">{product.price.toFixed(2)} €</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )
                        })}


                        {viewType === 'families' && filterByName(familiesWithProducts).map((family) => {
                            const isOpen = openGroupID === family.id;
                            return (
                                <div key={family.id} className="rounded shadow-md overflow-hidden">
                                    <div
                                        className="flex items-center justify-between py-3 px-4 bg-white cursor-pointer hover:bg-indigo-50 text-[#191919] transition-colors"
                                        onClick={() => toggleGroup(family.id)}
                                    >
                                        <div className="flex items-center text-lg font-semibold">
                                            {family.name}
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
                                                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">Product</th>
                                                        <th className="border border-[#EDEBEB] px-4 py-2 text-right">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-300">
                                                    {family.products.map((product, index) => (
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
                                                            <td className="border border-[#EDEBEB] px-4 py-2 text-right text-gray-500">...€</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {viewType === 'subfamilies' && filterByName(subfamiliesWithProducts).map((sub) => {
                            const isOpen = openGroupID === sub.id;
                            return (
                                <div key={sub.id} className="rounded shadow-md overflow-hidden">
                                    <div
                                        className="flex items-center justify-between py-3 px-4 bg-white cursor-pointer hover:bg-indigo-50 text-[#191919] transition-colors"
                                        onClick={() => toggleGroup(sub.id)}
                                    >
                                        <div className="flex items-center text-lg font-semibold">
                                            {sub.name}
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
                                                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">Product</th>
                                                        <th className="border border-[#EDEBEB] px-4 py-2 text-right">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-300">
                                                    {sub.products.map((product, index) => (
                                                        <tr key={product.id || `product-${index}`} className="hover:bg-indigo-50 transition-colors">
                                                            <td className="border border-[#EDEBEB] px-4 py-2 text-gray-700">
                                                                <span
                                                                    className="cursor-pointer hover:underline text-[#191919]"
                                                                    onClick={() => setSelectedProduct(product)}
                                                                >
                                                                    {product.name}
                                                                </span>
                                                            </td>
                                                            <td className="border border-[#EDEBEB] px-4 py-2 text-right text-gray-500">...€</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </>
            )}
        </>


    )
}
