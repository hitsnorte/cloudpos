'use client'

import { fetchGrup } from '@/src/lib/apigroup'
import { fetchProduct } from '@/src/lib/apiproduct'
import { fetchFamily } from '@/src/lib/apifamily'
import { useEffect, useState, useRef } from 'react'
import { TiShoppingCart } from 'react-icons/ti'
import { useRouter } from "next/navigation";
import { IoTrashBinOutline } from "react-icons/io5";
import { ChevronDown, ChevronRight } from 'lucide-react'
import { fetchIva } from '@/src/lib/apiiva';
import { fetchSubfamily } from '@/src/lib/apisubfamily';
import { fetchDashboard } from '@/src/lib/apidashboard';
import { fetchClassepreco } from '@/src/lib/apiclassepreco';
import { CiTrash } from "react-icons/ci";
import { FaTrash } from "react-icons/fa";
import { fetchPreco } from "@/src/lib/apipreco";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { Card, CardBody } from "@heroui/react";
import { useSession } from "next-auth/react"; // Import useSession
import {
    Spinner,
} from '@nextui-org/react';

//import loader
import LoadingBackdrop from "@/src/components/loader/page";

export default function ProductGroups() {
    const [groupsWithProducts, setGroupsWithProducts] = useState([])
    const [openGroupID, setOpenGroupID] = useState(null)
    const [loading, setLoading] = useState(true)
    const [propertyID, setPropertyID] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [cartOpen, setCartOpen] = useState(false)
    const [familiesWithProducts, setFamiliesWithProducts] = useState([]);
    const [subfamiliesWithProducts, setSubfamiliesWithProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
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

    const [showConfirm, setShowConfirm] = useState(false);
    const popoverRef = useRef(null);

    const [cardPaths, setCardPaths] = useState([]);

    const handleConfirm = () => {
        clearCart();
        setShowConfirm(false);
    };

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

    // Fecha o popover se clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setShowConfirm(false);
            }
        }

        if (showConfirm) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showConfirm]);


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



    // 1. Lê o carrinho salvo do localStorage na inicialização
    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) {
            const parsed = JSON.parse(saved);
            setCartItems(parsed);

            const quantityMap = {};
            parsed.forEach(item => {
                quantityMap[item.id] = item.quantity || 1;
            });
            setQuantities(quantityMap);
        }
    }, []);

    // 2. Salva automaticamente quando cartItems muda
    useEffect(() => {
        console.log('Saving cart to localStorage:', cartItems);
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('quantities', JSON.stringify(quantities));
    }, [quantities]);

    useEffect(() => {
        const storedQuantities = localStorage.getItem('quantities');
        if (storedQuantities) {
            setQuantities(JSON.parse(storedQuantities));
        }
    }, []);

    //Busca grupos e produtos quando o propertyID estiver disponivel
    useEffect(() => {
        if (!propertyID) {

            return
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [groups, families, subfamilies, products, classeprecos, precos, ivas] = await Promise.all([
                    fetchGrup(),
                    fetchFamily(),
                    fetchSubfamily(),
                    fetchProduct(),
                    fetchClassepreco(),
                    fetchPreco(),
                    fetchIva(),
                ]);

                const ivaMap = new Map();
                ivas.forEach((iva) => {
                    ivaMap.set(String(iva.VCODI), {
                        percentage: iva.NPERC,
                        description: iva.VDESC,
                    });
                });
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
                            const iva = ivaMap.get(String(p.VCodIva)) || { percentage: 0, description: "IVA desconhecido" };

                            return {
                                id,
                                name,
                                price,
                                iva: iva.percentage,
                                ivaDescription: iva.description,
                            };
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

                if (classeprecos && dashboardData) {
                    const dynamicCardPaths = classeprecos.map((classe) => ({
                        label: classe.Vdesc,
                        value: dashboardData?.[classe.Vdesc.toUpperCase()] || 0,
                        path: "/homepage/",
                    }));

                    setCardPaths(dynamicCardPaths);  // Usa a variável aqui, no mesmo escopo
                }

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
                    // Busca dashboard e classeprecos em paralelo
                    const [dashboard, classeprecos] = await Promise.all([
                        fetchDashboard(),
                        fetchClassepreco(),
                    ]);

                    // Verifica se dashboard tem as propriedades mínimas
                    if (dashboard && typeof dashboard === 'object') {
                        setDashboardData(dashboard);
                    } else {
                        throw new Error('Invalid dashboard data received');
                    }

                    // Verifica se classeprecos é um array válido
                    if (Array.isArray(classeprecos)) {
                        // Monta cardPaths dinamicamente
                        const dynamicCardPaths = classeprecos.map((classe) => ({
                            label: classe.Vdesc,
                            value: dashboard?.[classe.Vdesc.toUpperCase()] || 0,
                            path: "/homepage/",
                        }));

                        setCardPaths(dynamicCardPaths);
                    } else {
                        throw new Error('Invalid classeprecos data received');
                    }

                } catch (error) {
                    console.error('Error fetching data:', error);
                    setDashboardData({});  // Zera dashboardData em erro
                    setCardPaths([]);      // Zera cardPaths em erro
                }
            }
        };

        fetchData();
    }, [status, isConfirmed]);


    if (status === "loading" || loading) {
        return <LoadingBackdrop open={true} />;
    }

    if (!dashboardData) {
       return <LoadingBackdrop open={true} />;
    }

    if (loading) {
        return <LoadingBackdrop open={true} />;
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
                                        <p className="text-center h-13 text-sm text-gray-600 absolute bottom-4 left-1/2 transform -translate-x-1/2">
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
                                className="fixed top-6 right-378 bg-[#FC9D25] text-white px-4 py-2 rounded "
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
                            className={`fixed top-0 right-0 h-full w-[400px] max-w-full bg-[#F0F0F0] shadow-lg transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                                }`}
                        >
                            {/* Cabeçalho */}
                            <div className="sticky top-0 z-10 bg-[#F0F0F0] flex items-center justify-between p-5 ml-1">
                                <h2 className="text-l font-semibold ml-1">Your Shopping Cart</h2>
                                <button onClick={toggleSidebar} className="text-l text-[#FC9D25]">
                                    <span className="inline-block transform scale-150 font-thin mr-5">x</span>
                                </button>
                            </div>

                            {/* Conteúdo do Carrinho */}
                            <div className="p-7 flex flex-col h-[calc(100%-150px)] overflow-y-auto  -mt-5">
                                {cartItems.length === 0 ? (
                                    <p className="text-sm">Your Shopping Card Is Empty.</p>
                                ) : (
                                    <div className="bg-white rounded-l border border-white pt-2 px-4 flex flex-col">
                                        {cartItems.map((item, idx) => (
                                            <div
                                                key={item.id}
                                                className={`w-full py-4 ${idx !== cartItems.length - 1 ? "border-b border-[#EDEDED]" : "pb-7"}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-sm font-medium">
                                                            {item.name
                                                                .toLowerCase()
                                                                .split(' ')
                                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                .join(' ')}

                                                        </p>
                                                        <div className="flex items-center justify-between mt-2 gap-4">
                                                            {/* Quantity controls with border */}
                                                            <div className="flex items-center rounded overflow-hidden border border-gray-200 w-max">
                                                                <button
                                                                    className="px-3.5 py-1 bg-white text-[#FC9D25] hover:bg-gray-300 transition"
                                                                    onClick={() => {
                                                                        setQuantities(prev => {
                                                                            const newQuantity = Math.max(1, (prev[item.id] || 1) - 1);
                                                                            setCartItems(cartPrev =>
                                                                                cartPrev.map(ci =>
                                                                                    ci.id === item.id ? { ...ci, quantity: newQuantity } : ci
                                                                                )
                                                                            );
                                                                            return { ...prev, [item.id]: newQuantity };
                                                                        });
                                                                    }}
                                                                >
                                                                    <span className="inline-block transform scale-150 font-thin">-</span>
                                                                </button>
                                                                <span className="px-1 py-1 bg-white text-sm font-medium text-[#191919] border-gray-300">
                                                                    {quantities[item.id] || 1} un
                                                                </span>
                                                                <button
                                                                    className="px-3 py-1 bg-white text-[#FC9D25] hover:bg-gray-300 transition"
                                                                    onClick={() => {
                                                                        setQuantities(prev => {
                                                                            const newQuantity = (prev[item.id] || 1) + 1;
                                                                            setCartItems(cartPrev =>
                                                                                cartPrev.map(ci =>
                                                                                    ci.id === item.id ? { ...ci, quantity: newQuantity } : ci
                                                                                )
                                                                            );
                                                                            return { ...prev, [item.id]: newQuantity };
                                                                        });
                                                                    }}
                                                                >
                                                                    <span className="inline-block transform scale-150 font-thin">+</span>
                                                                </button>
                                                            </div>

                                                            {/* Price - OUTSIDE the bordered box */}
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
                                                            €{(item.price * quantities[item.id]).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>


                            {/* Rodapé */}
                            < div className="absolute bottom-0 w-full bg-white p-3 border-white" >
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-bold ml-2">Total:</span>
                                    <span className="text-sm font-bold mr-2">€{total.toFixed(2)}</span>
                                </div>
                                <div className="flex gap-3">

                                    {showConfirm && (
                                        <div className="fixed inset-0 bg-opacity-30 z-40" />
                                    )}

                                    <div className="relative z-50 inline-block">
                                        <button
                                            onClick={() => setShowConfirm(true)}
                                            className="w-12 ml-2 border border-[#ff0000] text-[#ff0000] rounded py-2 text-sm hover:bg-[#fff4e6] transition flex items-center justify-center gap-2"
                                        >
                                            <CiTrash className="text-sm" size={20} />
                                        </button>


                                    </div>
                                    <button className="w-full mr-2 bg-[#FC9D25] text-white rounded py-2 text-sm hover:bg-[#e88a1c] transition flex items-center justify-center gap-2">
                                        <TiShoppingCart className="text-sm" />
                                        Payment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showConfirm && (
                        <>
                            <div
                                className="fixed inset-0 bg-black/40 z-40"
                                onClick={() => setShowConfirm(false)}
                            />
                            <div
                                ref={popoverRef}

                                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                                bg-white w-[440px] text-center rounded-lg shadow-md z-50 overflow-hidden"                                            >
                                <p className="text-l font-semibold text-white flex justify-between items-center mb-4 px-4 py-3 bg-[#FC9D25]">
                                    Attention

                                </p>
                                <div className="px-6 pb-5">
                                    <p className="flex justift-left mb-4 text-sm text-gray-800 -ml-2">
                                        Are you sure you want to delete all items from the cart?
                                    </p>

                                    <div className="flex justify-center gap-3">
                                        <button
                                            onClick={() => setShowConfirm(false)}
                                            className="px-4 py-2 text-sm text-white bg-[#D3D3D3] text-white rounded-md hover:bg-gray"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            className="px-4 py-2 text-sm bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {selectedProduct && (
                        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-115 bg-white shadow-xl rounded-lg z-50">
                            <div className="bg-[#FAFAFA] w-full ">
                                <div className="flex justify-between items-center mb-4 px-4 py-3 bg-[#FC9D25] rounded-t-lg">
                                    <h2 className=" text-l font-semibold text-white ml-1 ">
                                        Add product
                                    </h2>
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
                                    <div className="flex flex-col ">
                                        <div className="text-xl text-[#FC9D25] font-semibold whitespace-nowrap">
                                            €{(selectedProduct?.price).toFixed(2)}/un
                                        </div>

                                        <div className="text-sm text-black whitespace-nowrap">
                                            Iva {selectedProduct?.iva?.toFixed(2)}%
                                        </div>
                                    </div>

                                    {/* Seletor de quantidade */}
                                    <div className="flex items-center rounded overflow-hidden border border-gray-200 w-max fixed ml-72 -mt-4">
                                        <button
                                            onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                                            className="px-4 py-1 bg-white text-[#FC9D25] hover:bg-gray-300 transition"
                                        >
                                            <span className="inline-block transform scale-150 font-thin">-</span>
                                        </button>
                                        <span className="px-2 py-1 bg-white text-sm font-medium text-[#191919] border-gray-300">
                                            {count} un
                                        </span>
                                        <button
                                            onClick={() => setCount((prev) => prev + 1)}
                                            className="px-3.5 py-1 bg-white text-[#FC9D25] hover:bg-gray-300 transition"
                                        >
                                            <span className="inline-block transform scale-150 font-thin">+</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Modal de quantidades*/}
                                <div className="flex justify-end space-x-3 ml-8 mb-5 m-5 mr-7">
                                    {/* Botão Close */}
                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        className="px-10.5 py-1 bg-[#D3D3D3] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                                    >
                                        Close
                                    </button>

                                    {/* Botão Save */}
                                    <button
                                        onClick={() => {
                                            if (count > 0) {
                                                addToCart({ ...selectedProduct, quantity: count });
                                                setSelectedProduct(null);
                                            }
                                        }}
                                        className="px-10.5 py-1 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                                    >
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
                                                    <p className="font-medium text-[#191919] px-5">
                                                        {item.name} - <span className="text-[#FC9D25] font-semibold">{item.price.toFixed(2)}€</span>
                                                    </p>

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
                                                            <td className="...">
                                                                {product?.price != null && !isNaN(product.price)
                                                                    ? `${Number(product.price).toFixed(2)} €`
                                                                    : '—'}
                                                            </td>
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
                                                            <td className="...">
                                                                {product?.price != null && !isNaN(product.price)
                                                                    ? `${Number(product.price).toFixed(2)} €`
                                                                    : '—'}
                                                            </td>
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
