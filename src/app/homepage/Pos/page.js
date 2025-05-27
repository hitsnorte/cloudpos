'use client'

import { fetchGrup } from '@/src/lib/apigroup'
import { fetchProduct } from '@/src/lib/apiproduct'
import { fetchFamily } from '@/src/lib/apifamily'
import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from "next/navigation";
import { fetchIva } from '@/src/lib/apiiva';
import { fetchSubfamily } from '@/src/lib/apisubfamily';
import { fetchDashboard } from '@/src/lib/apidashboard';
import { fetchPostos } from '@/src/lib/apipostos';
import { fetchPostossalas } from '@/src/lib/apipostossalas';
import { fetchSalas } from '@/src/lib/apisalas';
import { fetchMesas } from '@/src/lib/apimesas';
import { fetchClassepreco } from '@/src/lib/apiclassepreco';
import { fetchPreco } from "@/src/lib/apipreco";
import { MdPointOfSale } from "react-icons/md";
import { Card, CardBody } from "@heroui/react";
import { useSession } from "next-auth/react"; // Import useSession
import { MdTableBar } from "react-icons/md";
import { IoIosArrowBack } from "react-icons/io";
import { TiShoppingCart } from 'react-icons/ti';
import { FaDoorOpen } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";

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
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const [viewType, setViewType] = useState('groups', 'families', 'subfamilies') // 'groups' | 'families' | 'subfamilies'


    //side bar
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [showConfirm, setShowConfirm] = useState(false);
    const popoverRef = useRef(null);

    const [postos, setPostos] = useState([]);
    const [salas, setSalas] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [postosComSalas, setPostosComSalas] = useState([]);
    const [salasComMesas, setSalasComMesas] = useState([]);


    const cardPaths = useMemo(() => {
        if (!postosComSalas) return [];
        return postosComSalas.flatMap(posto =>
            (posto.salas || []).map(sala => ({
                label: sala.Descricao,
                value: sala.ID_SALA,
                path: `/homepage/${posto.VPosto}/sala/${sala.ID_SALA}`,
            }))
        );
    }, [postosComSalas]);

    const cardPaths3 = useMemo(() => {
        if (!selectedRow || !salasComMesas.length) return [];

        const salaId = parseInt(selectedRow.split("/").pop());
        const salaSelecionada = salasComMesas.find(s => s.ID_SALA === salaId);

        if (!salaSelecionada || !salaSelecionada.mesas) return [];

        return salaSelecionada.mesas.map(mesa => ({
            label: mesa.Descricao,
            value: mesa.ID_Mesa,
            path: `/mesas/${mesa.ID_Mesa}`,
        }));
    }, [selectedRow, salasComMesas]);

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

    useEffect(() => {
        loadPostos();
        loadSalas();
        loadMesas();
    }, []);

    const loadPostos = async () => {
        try {
            const postos = await fetchPostos();

            // Aqui pode-se fazer algum enriquecimento dos dados se necessário
            const enrichedPostos = postos.map(posto => ({
                ...posto,
            }));

            setPostos(enrichedPostos);
        } catch (err) {
            setError(err.message);
        }
    };

    const loadSalas = async () => {
        try {
            const fetchedSalas = await fetchSalas();

            const enrichedSalas = fetchedSalas.map(sala => ({
                ...sala,
            }));

            setSalas(enrichedSalas);
        } catch (err) {
            setError(err.message);
        }
    };

    const loadMesas = async () => {
        try {
            const fetchedMesas = await fetchMesas();

            const enrichedMesas = fetchedMesas.map(mesa => ({
                ...mesa,
            }));
            console.log("mesas: ", enrichedMesas);
            setMesas(enrichedMesas);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const loadPostosWithSalas = async () => {
            try {
                const [postos, salas, postosSalas] = await Promise.all([
                    fetchPostos(),
                    fetchSalas(),
                    fetchPostossalas()
                ]);

                const enrichedPostos = postos.map(posto => {
                    const relacoes = postosSalas.filter(ps => ps.Posto === posto.Icodi.toString());

                    const salasRelacionadas = relacoes
                        .sort((a, b) => a.Ordem - b.Ordem)
                        .map(relacao => salas.find(s => s.ID_SALA === relacao.ID_Sala))
                        .filter(Boolean);

                    return {
                        ...posto,
                        salas: salasRelacionadas
                    };
                });

                setPostosComSalas(enrichedPostos);
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                setError("Erro ao carregar postos e salas.");
            }
        };

        loadPostosWithSalas();
    }, []);

    useEffect(() => {
        const loadMesasWithSalas = async () => {
            try {
                const [salas, mesas] = await Promise.all([
                    fetchSalas(), // função que vai buscar as salas
                    fetchMesas()  // função que vai buscar as mesas
                ]);

                const enrichedSalas = salas.map(sala => {
                    const mesasDaSala = mesas.filter(mesa => mesa.ID_Sala === sala.ID_SALA);

                    return {
                        ...sala,
                        mesas: mesasDaSala
                    };
                });

                setSalasComMesas(enrichedSalas);
            } catch (err) {
                console.error("Erro ao carregar salas e mesas:", err);
                setError("Erro ao carregar dados.");
            }
        };

        loadMesasWithSalas();
    }, []);

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
        return <LoadingBackdrop open={true} />;
    }

    if (!dashboardData) {
        return <p className="text-center text-sm">Loading dashboard...</p>;
    }

    const cardPaths2 = postos.map((posto, index) => ({
        label: posto.VDescricao,
        value: 0, // Coloque aqui algum valor real se houver (como dashboardData[posto.VDescricao])
        path: `/homepage/${posto.VPosto}`, // Ajuste conforme necessidade
    }));



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
            {!selectedCardPath && !selectedRow && (
                <>
                    <h1 className="text-3xl font-semibold px-4">Dashboard</h1>
                    <div className="px-4 flex flex-wrap gap-6 p-6">
                        {cardPaths2.map((card, index) => (
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
                                            <MdPointOfSale />
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

            {selectedCardPath && !selectedRow && (
                <>
                    <button
                        onClick={() => {
                            setSelectedCardPath(null);
                            setSelectedRow(null);
                        }}
                        className=" ml-4 px-4 py-2 rounded bg-[#FC9D25] text-white hover:bg-[#e38d20] flex items-center gap-2"
                    >
                        <IoIosArrowBack size={16} />
                        <span>Postos</span>
                    </button>

                    <div className="px-4 flex flex-wrap gap-6 p-6">
                        {cardPaths.map((card, index) => (
                            <Card
                                key={index}
                                className="w-70 h-45 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col items-center cursor-pointer hover:bg-gray-100"

                            >
                                <CardBody className="flex flex-col items-center w-full h-full relative">
                                    <div

                                        onClick={() => {
                                            console.log("Clicou na sala com path:", card.path);
                                            setSelectedRow(card.path); // usar ID da sala
                                        }}
                                    >
                                        <p className="text-5xl font-bold text-[#FC9D25] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <FaDoorOpen />
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

            {/* Etapa 3 - MOSTRAR MESAS da sala selecionada */}
            {selectedRow && (
                <>
                    <button
                        onClick={() => {
                            setSelectedRow(null); // Volta para as salas
                        }}
                        className=" ml-4 px-4 py-2 rounded bg-[#FC9D25] text-white hover:bg-[#e38d20] flex items-center gap-2"
                    >
                        <IoIosArrowBack size={16} />
                        <span>Salas</span>
                    </button>

                    <div className="px-4 flex flex-wrap gap-6 p-6">
                        {cardPaths3.map((card, index) => (
                            <Card
                                key={index}
                                className="w-70 h-45 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col items-center cursor-pointer hover:bg-gray-100"

                            >
                                <CardBody className="flex flex-col items-center w-full h-full relative">
                                    <div
                                        onClick={() => console.log("Mesa selecionada:", card.ID_MESA)}>

                                        <p className="text-5xl font-bold text-[#FC9D25] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <MdTableBar />
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



            <div className="relative">
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

                {isOpen && (
                    <div className="fixed inset-0 bg-black/40 z-30" onClick={toggleSidebar}></div>
                )}

                <div
                    className={`fixed top-0 right-0 h-full w-[400px] max-w-full bg-[#F0F0F0] shadow-lg transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-[#F0F0F0] flex items-center justify-between p-5 ml-1">
                        <h2 className="text-l font-semibold ml-1">Your order</h2>
                        <button onClick={toggleSidebar} className="text-l text-[#FC9D25]">
                            <span className="inline-block transform scale-150 font-thin mr-5">x</span>
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="p-7 flex flex-col h-[calc(100%-150px)] overflow-y-auto -mt-5">
                        {cartItems.length === 0 ? (
                            <p className="text-sm">Your order is empty.</p>
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
                                                    {item.name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                </p>
                                                <div className="flex items-center justify-between mt-2 gap-4">
                                                    {/* Quantity controls */}
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
                                Order
                            </button>
                            <button className="w-1/2 mr-2 bg-[#FC9D25] text-white rounded py-2 text-sm hover:bg-[#e88a1c] transition flex items-center justify-center gap-2">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}