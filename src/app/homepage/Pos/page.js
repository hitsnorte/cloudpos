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
import { IoIosArrowBack } from "react-icons/io";
import { TiShoppingCart } from 'react-icons/ti';
import { FaDoorOpen } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Spinner } from "@nextui-org/react";
import { FaUser } from "react-icons/fa";

//import axios
import axios from "axios";

//import loader
import LoadingBackdrop from "@/src/components/loader/page";

//import modal nrm clientes
import PopUpModal from '@/src/components/modals/nrm_clients/page';


export default function ProductGroups() {
    const [groupsWithProducts, setGroupsWithProducts] = useState([]);
    const [openGroupID, setOpenGroupID] = useState(null);
    const [loading, setLoading] = useState(true);
    const [propertyID, setPropertyID] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [count, setCount] = useState(0);
    const [cartOpen, setCartOpen] = useState(false);
    const [familiesWithProducts, setFamiliesWithProducts] = useState([]);
    const [subfamiliesWithProducts, setSubfamiliesWithProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const getCartItems = () => tableCarts[selectedTable] || [];
    const updateCartItems = (items) => {
        setTableCarts((prev) => ({
            ...prev,
            [selectedTable]: items,
        }));
    };
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
    const [tableCarts, setTableCarts] = useState({});
    const currentCart = tableCarts[selectedTable] || [];
    const [quantities, setQuantities] = useState({});

    const [viewType, setViewType] = useState('groups', 'families', 'subfamilies') // 'groups' | 'families' | 'subfamilies'


    //side bar
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);
    const total = getCartItems().reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );


    const [showConfirm, setShowConfirm] = useState(false);
    const popoverRef = useRef(null);

    const [postos, setPostos] = useState([]);
    const [salas, setSalas] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [postosComSalas, setPostosComSalas] = useState([]);
    const [salasComMesas, setSalasComMesas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [pendingTablePath, setPendingTablePath] = useState(null);
    const [clientNumber, setClienteNumber] = useState(null);

    const [mesasEmUso, setMesasEmUso] = useState([]);
    const handleConfirm = () => {
        clearCart();
        setShowConfirm(false);
    };

    useEffect(() => {
        const fetchMesas = async () => {
            try {
                const res = await fetch('/api/mesas', {
                    headers: {
                        'X-Property-ID': localStorage.getItem('selectedProperty'),
                    },
                });

                if (!res.ok) throw new Error('Erro ao buscar mesas');
                const data = await res.json();


                const mesasData = data?.data || [];

                // Agrupa mesas por salas
                const grouped = mesasData.reduce((acc, mesa) => {
                    const salaId = mesa.ID_SALA;
                    if (!acc[salaId]) acc[salaId] = { ID_SALA: salaId, mesas: [] };
                    acc[salaId].mesas.push(mesa);
                    return acc;
                }, {});

                setSalasComMesas(Object.values(grouped));
                setMesas(mesasData);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMesas();
    }, []);

    const selectedPostoVPosto = useMemo(() => {
        if (!selectedCardPath) return null;
        const parts = selectedCardPath.split("/");
        return parts[parts.length - 1]; // extrai o VPosto (ex: "posto1")
    }, [selectedCardPath]);

    const cardPaths = useMemo(() => {
        if (!postosComSalas || !selectedPostoVPosto) return [];

        const posto = postosComSalas.find(p => p.VPosto === selectedPostoVPosto);
        if (!posto || !posto.salas) return [];

        return posto.salas.map(sala => ({
            label: sala.Descricao,
            value: sala.ID_SALA,
            path: `/homepage/${posto.VPosto}/sala/${sala.ID_SALA}`,
        }));
    }, [postosComSalas, selectedPostoVPosto]);


    const cardPaths3 = useMemo(() => {
        if (!selectedRow || !salasComMesas.length || !postosComSalas.length) return [];

        const salaId = parseInt(selectedRow.split("/").pop());

        // Encontrar a sala selecionada
        const salaSelecionada = salasComMesas.find(s => s.ID_SALA === salaId);
        if (!salaSelecionada || !salaSelecionada.mesas) return [];

        // Encontrar o posto que contém essa sala
        const postoQueContemSala = postosComSalas.find(posto =>
            posto.salas?.some(sala => sala.ID_SALA === salaId)
        );

        const postoId = postoQueContemSala?.Icodi ?? null;
        if (!postoId) return [];

        return salaSelecionada.mesas.map(mesa => ({
            label: mesa.Descricao,
            value: mesa.ID_Mesa,
            path: `/mesas/${mesa.ID_Mesa}`,
            Posto: String(postoId),      // compatível com mesasEmUso
            ID_sala: salaId,
            ID_Mesa: mesa.ID_Mesa,
        }));
    }, [selectedRow, salasComMesas, postosComSalas]);



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

    const params = useParams();

    useEffect(() => {
    const storedMesa = localStorage.getItem('selectedMesa');
    if (storedMesa) {
      const mesaObj = JSON.parse(storedMesa);
      console.log('Mesa do localStorage:', mesaObj);

      // Se o ID_Mesa bate com o parâmetro da URL
      if (mesaObj.ID_Mesa?.toString() === params.id) {
        setSelectedTable(mesaObj);
      } else {
        console.warn('ID_Mesa não bate com params.id', mesaObj.ID_Mesa, params.id);
      }
    } else {
      console.warn('Nenhuma mesa encontrada no localStorage');
    }
  }, [params.id]);

    useEffect(() => {
        const loadPostosWithSalas = async () => {
            try {
                const [postos, salas, postosSalas] = await Promise.all([
                    fetchPostos(),
                    fetchSalas(),
                    fetchPostossalas()
                ]);

                console.log("Postos:", postos);
                console.log("Salas:", salas);
                console.log("PostosSalas:", postosSalas);

                const postosFiltrados = postos; // <- usar todos os postos
                console.log("Postos com trabalhaComSalas === true:", postosFiltrados);

                const enrichedPostos = postosFiltrados.map(posto => {
                    const relacoes = postosSalas.filter(ps => Number(ps.Posto) === posto.Icodi);
                    console.log(`Relações para posto ${posto.Icodi}:`, relacoes);

                    const salasRelacionadas = relacoes
                        .sort((a, b) => a.Ordem - b.Ordem)
                        .map(relacao => salas.find(s => s.ID_SALA === relacao.ID_Sala))
                        .filter(Boolean);

                    console.log(`Salas para posto ${posto.Icodi}:`, salasRelacionadas);

                    return {
                        ...posto,
                        salas: salasRelacionadas
                    };
                });

                console.log("Postos enriquecidos:", enrichedPostos);
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
        if (selectedTable && tableCarts[selectedTable]) {
            setQuantities(
                tableCarts[selectedTable].reduce((acc, item) => {
                    acc[item.id] = item.quantity || 1;
                    return acc;
                }, {})
            );
        }
    }, [tableCarts, selectedTable]);

    const removeItem = (id) => {
        const filtered = getCartItems().filter((item) => item.id !== id);
        updateCartItems(filtered);
    };


    const clearCart = () => {
        console.warn("This does not work")
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

    useEffect(() => {
        let filtered = [];

        if (viewType === 'groups') {
            filtered = filterByName(groupsWithProducts);
        } else if (viewType === 'families') {
            filtered = filterByName(familiesWithProducts);
        } else if (viewType === 'subfamilies') {
            filtered = filterByName(subfamiliesWithProducts);
        }

        // Se houver termo de pesquisa e resultados, abre só o primeiro
        if (searchTerm.trim() && filtered.length > 0) {
            setOpenGroupID(filtered[0].id); // abre só esse
        } else {
            setOpenGroupID(null); // fecha todos se não há match
        }
    }, [searchTerm, viewType, groupsWithProducts, familiesWithProducts, subfamiliesWithProducts]);



    // 1. Lê o carrinho salvo do localStorage na inicialização
    useEffect(() => {
        const saved = localStorage.getItem('tableCarts');
        if (saved) {
            const parsed = JSON.parse(saved);
            setTableCarts(parsed);
        }
    }, []);


    // 2. Salva automaticamente quando um cart muda
    useEffect(() => {
        localStorage.setItem('tableCarts', JSON.stringify(tableCarts));
    }, [tableCarts]);


    //Busca grupos e produtos quando o propertyID estiver disponivel
    useEffect(() => {
        if (!propertyID) return;

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

                // Mapear IVA
                const ivaMap = new Map();
                ivas.forEach((iva) => {
                    ivaMap.set(String(iva.VCODI), {
                        percentage: iva.NPERC,
                        description: iva.VDESC,
                    });
                });

                // Criar mapa de preços SOMENTE para classe 3
                const precoMap = new Map();
                const produtosClasse3 = new Set();

                precos.forEach(preco => {
                    if (String(preco.VCodClas) === "1") {
                        const key = String(preco.VCodprod).trim();
                        precoMap.set(key, parseFloat(String(preco.npreco).replace(',', '.')) || 0);
                        produtosClasse3.add(key); // só adicionamos classe 3
                    }
                });

                // Função auxiliar para verificar se o produto tem preço da classe 3
                const isProdutoClasse3 = (produto) => {
                    const id = String(produto.VPRODUTO || produto.VCodProd || produto.vCodigo).trim();
                    return produtosClasse3.has(id);
                };

                // Função auxiliar para mapear um produto
                const mapProduto = (produto) => {
                    const id = String(produto.VPRODUTO || produto.VCodProd || produto.vCodigo).trim();
                    const preco = precoMap.get(id) || 0;
                    const iva = ivaMap.get(String(produto.VCodIva)) || { percentage: 0, description: "IVA desconhecido" };

                    return {
                        id,
                        name: produto.VDESC1?.trim() || produto.VdescProd?.trim() || 'Unnamed Product',
                        price: preco,
                        iva: iva.percentage,
                        ivaDescription: iva.description,
                        VCodClas: 1, // classe 1 apenas
                    };
                };

                const structuredGroups = groups.map(group => {
                    const productsForGroup = products
                        .filter(p => String(p.VCodGrfam) === String(group.VCodGrFam) && isProdutoClasse3(p))
                        .map(mapProduto);

                    return {
                        id: String(group.VCodGrFam),
                        name: group.VDesc,
                        products: productsForGroup,
                    };
                });

                const structuredFamilies = families.map(family => {
                    const productsForFamily = products
                        .filter(p => String(p.VCodFam) === String(family.VCodFam) && isProdutoClasse3(p))
                        .map(mapProduto);

                    return {
                        id: String(family.VCodFam),
                        name: family.VDesc,
                        products: productsForFamily,
                    };
                });

                const structuredSubfamilies = subfamilies.map(subfamily => {
                    const productsForSubfamily = products
                        .filter(p => String(p.VCodSubFam) === String(subfamily.VCodSubFam) && isProdutoClasse3(p))
                        .map(mapProduto);

                    return {
                        id: String(subfamily.VCodSubFam),
                        name: subfamily.VDesc,
                        products: productsForSubfamily,
                    };
                });

                const structuredClassePrecos = classeprecos.map(classepreco => {
                    const productsForClassepreco = products
                        .filter(p => String(p.Vcodi) === String(classepreco.Vcodi) && isProdutoClasse3(p))
                        .map(p => ({
                            id: String(p.VCodProd),
                            name: p.VDESC1?.trim() || 'Unnamed Product',
                        }));

                    return {
                        id: String(classepreco.Vcodi),
                        name: classepreco.Vdesc,
                        products: productsForClassepreco,
                    };
                });

                const structuredPrecos = [...produtosClasse3].map((prodId) => {
                    const produto = products.find(p => String(p.VCodProd || p.VPRODUTO || p.vCodigo).trim() === prodId);
                    const preco = precoMap.get(prodId) || 0;

                    return {
                        id: prodId,
                        name: produto?.VDESC1?.trim() || produto?.VdescProd?.trim() || 'Unnamed Product',
                        price: preco,
                        products: [{
                            id: prodId,
                            name: produto?.VDESC1?.trim() || produto?.VdescProd?.trim() || 'Unnamed Product',
                            price: preco,
                        }],
                    };
                });

                // Atualiza os estados
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

    const fetchActiveTables = async () => {
        const propertyID = localStorage.getItem('selectedProperty');

        if (!propertyID) {
            console.warn("Nenhuma propriedade encontrada no localStorage!");
            return null;
        }

        try {
            const response = await axios.get(`/api/mesas_produtos/get_mesas_em_uso`, {
                headers: {
                    'X-Property-ID': propertyID
                }
            });

            console.log("Dados principais da API:", response.data);

            // Armazena o array diretamente no estado
            if (Array.isArray(response.data)) {
                setMesasEmUso(response.data);
            } else {
                console.log("Resposta inesperada da API:", response.data);
                setMesasEmUso([]);
            }

            return response;
        } catch (error) {
            console.error("Erro ao buscar detalhes da propriedade:", error);
            setMesasEmUso([]); // limpa o estado em caso de erro
            return null;
        }
    };



    if (status === "loading" || loading) {
        return <LoadingBackdrop open={true} />;
    }

    if (!dashboardData) {
        return <p className="text-center text-sm">Loading dashboard...</p>;
    }

    const cardPaths2 = postos.map((posto, index) => ({
        label: posto.VDescricao,
        value: posto.Icodi,
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

    const addToCart = (product) => {
        if (!selectedTable) return;

        const currentItems = getCartItems();
        const existing = currentItems.find((item) => item.id === product.id);

        let updatedItems;
        if (existing) {
            updatedItems = currentItems.map((item) =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + product.quantity }
                    : item
            );
        } else {
            updatedItems = [...currentItems, product];
        }

        updateCartItems(updatedItems);
    };

    const updateQuantity = (id, newQuantity) => {
        const updatedItems = getCartItems().map((item) =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        );
        updateCartItems(updatedItems);
    };

    function filterByName(groups) {
        if (!searchTerm.trim()) return groups;

        const term = searchTerm.toLowerCase();

        return groups
            .map(group => {
                const nameMatches = group.name?.toLowerCase().includes(term);
                const filteredProducts = group.products.filter(
                    product =>
                        product?.name?.toLowerCase().includes(term) ||
                        product?.VDESC1?.toLowerCase().includes(term)
                );

                if (nameMatches || filteredProducts.length > 0) {
                    return {
                        ...group,
                        products: nameMatches ? group.products : filteredProducts,
                    };
                }

                return null;
            })
            .filter(Boolean);
    }


    function toggleGroup(id) {
        setOpenGroupID(openGroupID === id ? null : id);
    }

    // Função para calcular total por mesa
    const getTotalForTable = (table) => {
        const cart = tableCarts[table] || [];
        return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    };

    const getQuantityForTable = (table) => {
        const cart = tableCarts[table] || [];
        return cart.reduce((acc, item) => acc + item.quantity, 0);
    };

    const handleClientNumberSubmit = (clientNumber) => {
        if (clientNumber.trim() !== '') {
            console.log("Número de clientes:", clientNumber);
            setClienteNumber(clientNumber);
            setShowModal(false);
            setSelectedTable(pendingTablePath); // aqui está o m.path original
            setPendingTablePath(null); // limpa depois de usar
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };



    return (
        <>
            {!selectedCardPath && !selectedRow && !selectedTable && (
                <>
                    <h1 className="text-3xl font-semibold px-4">Outlets</h1>
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

            {selectedCardPath && !selectedRow && !selectedTable && (
                <>
                    <div className="flex items-center gap-4 px-4">
                        <button
                            onClick={() => {
                                setSelectedCardPath(null);
                            }}
                            className="px-4 py-2 rounded bg-[#FC9D25] text-white hover:bg-[#e38d20] flex items-center gap-2"
                        >
                            <IoIosArrowBack size={16} />
                            <span>Postos</span>
                        </button>

                        <h1 className="text-3xl font-semibold">Rooms</h1>
                    </div>

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
            {selectedRow && !selectedTable && (
                <>
                    <div className="flex items-center gap-4 px-4">
                        <button
                            onClick={() => {
                                setSelectedRow(null);
                            }}
                            className="px-4 py-2 rounded bg-[#FC9D25] text-white hover:bg-[#e38d20] flex items-center gap-2"
                        >
                            <IoIosArrowBack size={16} />
                            <span>Rooms</span>
                        </button>
                        <h1 className="text-3xl font-semibold">Tables</h1>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6">
                        {cardPaths3.map((m, index) => {
                            const mesaAtiva = mesasEmUso.find(mesa =>
                                String(mesa.Posto) === String(m.Posto) &&
                                Number(mesa.ID_sala) === Number(m.ID_sala) &&
                                Number(mesa.ID_Mesa) === Number(m.ID_Mesa)
                            );

                            console.log("Mesa:", m.label, {
                                mesaAtiva,
                                mesaComparada: mesasEmUso.find(mesa => String(mesa.Posto) === String(m.Posto))
                            });

                            return (
                                <Card
                                    key={index}
                                    className="w-full h-40 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col items-center cursor-pointer hover:bg-gray-100"
                                >
                                    <CardBody className="flex flex-col items-center justify-center w-full h-full"
                                        onClick={() => {
                                            setPendingTablePath(m.path);
                                            setShowModal(true);
                                        }}
                                    >
                                        <div className="mb-2">
                                            <img src="/icons/table_icon.png" alt="table icon" width={80} className="mx-auto" />
                                        </div>

                                        <p className="text-center text-sm text-[#191919]">{m.label}</p>

                                        {mesaAtiva && (
                                            <p className="text-sm text-green-600 font-semibold">mesa em uso</p>
                                        )}

                                        {getTotalForTable(m.path) > 0 && (
                                            <span>Total: {getTotalForTable(m.path).toFixed(2)}€</span>
                                        )}
                                    </CardBody>

                                    {getQuantityForTable(m.path) > 0 && (
                                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 p-2 flex items-center justify-center">
                                            {getQuantityForTable(m.path)} | <FaUser size={15} /> x {clientNumber}
                                        </span>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </>
            )
            }

            {
                showModal && (
                    <PopUpModal
                        onClose={handleCloseModal}
                        onSubmit={handleClientNumberSubmit}
                    />
                )
            }

            <div className="relative">
                {selectedTable && (
                    <>
                        <button
          onClick={() => {
            localStorage.removeItem('selectedMesa');
            setSelectedTable(null);
            router.back();
          }}
          className="absolute ml-4 mt-4 px-4 py-2 rounded bg-[#FC9D25] text-white hover:bg-[#e38d20] flex items-center gap-2 z-20"
        >
          <IoIosArrowBack size={16} />
          <span>Mesas</span>
        </button>

                        <div className="flex items-center justify-center space-x-4 mt-4">
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
                        </div>

                        <div className="py-5 px-6">
                            <div className="mb-4 relative">
                                <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>
                        </div>

                        <div className="p-6 space-y-4">

                            {viewType === 'groups' && (() => {
                                const filtered = filterByName(groupsWithProducts)
                                    .filter(group => group.products && group.products.length > 0);
                                if (filtered.length === 0) {
                                    return (
                                        <div className="text-center text-gray-500 py-8">
                                            No groups or products found.
                                        </div>
                                    );
                                }
                                return filtered.map((group) => {
                                    const isOpen = openGroupID === group.id;
                                    return (
                                        <div key={group.id} className="rounded shadow-md overflow-hidden">
                                            <div
                                                className="flex items-center justify-between py-3 px-4 bg-white cursor-pointer hover:bg-indigo-50 text-[#191919] transition-colors"
                                                onClick={() => toggleGroup(group.id)}
                                            >
                                                <div className="flex items-center text-lg font-semibold uppercase">
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
                                                                <th className="border border-[#EDEBEB] px-4 py-2 text-left">
                                                                    VCodClas
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
                                                                    <td className="border border-[#EDEBEB] px-3 py-2 text-right">
                                                                        {product.VCodClas ?? '—'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}

                            {viewType === 'families' && (() => {
                                const filtered = filterByName(familiesWithProducts)
                                    .filter(family => family.products && family.products.length > 0);
                                if (filtered.length === 0) {
                                    return (
                                        <div className="text-center text-gray-500 py-8">
                                            No families or products found.
                                        </div>
                                    );
                                }
                                return filtered.map(family => {
                                    const isOpen = openGroupID === family.id;
                                    return (
                                        <div key={family.id} className="rounded shadow-md overflow-hidden">
                                            <div
                                                className="flex items-center justify-between py-3 px-4 bg-white cursor-pointer hover:bg-indigo-50 text-[#191919] transition-colors"
                                                onClick={() => toggleGroup(family.id)}
                                            >
                                                <div className="flex items-center text-lg font-semibold uppercase">{family.name}</div>
                                                <div className="text-gray-500">{isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
                                            </div>

                                            {isOpen && (
                                                <div className="overflow-x-auto bg-muted/40 transition-all duration-300 ease-in-out">
                                                    <table className="min-w-full bg-[#FAFAFA] border-collapse border border-[#EDEBEB]">
                                                        <thead>
                                                            <tr className="bg-[#FC9D25] text-white">
                                                                <th className="border border-[#EDEBEB] px-4 py-2 text-left">Product</th>
                                                                <th className="border border-[#EDEBEB] px-4 py-2 text-right">Price</th>
                                                                <th className="border border-[#EDEBEB] px-4 py-2 text-left">VCodClas</th>
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
                                                                    <td className="border border-[#EDEBEB] px-3 py-2 text-right">
                                                                        {typeof product.price === 'number' ? product.price.toFixed(2) + ' €' : '—'}
                                                                    </td>
                                                                    <td className="border border-[#EDEBEB] px-3 py-2 text-right">
                                                                        {product.VCodClas ?? '—'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}

                            {viewType === 'subfamilies' && (() => {
                                const filtered = filterByName(subfamiliesWithProducts)
                                    .filter(sub => sub.products && sub.products.length > 0);
                                if (filtered.length === 0) {
                                    return (
                                        <div className="text-center text-gray-500 py-8">
                                            No subfamilies or products found.
                                        </div>
                                    );
                                }
                                return filtered.map(sub => {
                                    const isOpen = openGroupID === sub.id;
                                    return (
                                        <div key={sub.id} className="rounded shadow-md overflow-hidden">
                                            <div
                                                className="flex items-center justify-between py-3 px-4 bg-white cursor-pointer hover:bg-indigo-50 text-[#191919] transition-colors"
                                                onClick={() => toggleGroup(sub.id)}
                                            >
                                                <div className="flex items-center text-lg font-semibold uppercase">{sub.name}</div>
                                                <div className="text-gray-500">{isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
                                            </div>

                                            {isOpen && (
                                                <div className="overflow-x-auto bg-muted/40 transition-all duration-300 ease-in-out">
                                                    <table className="min-w-full bg-[#FAFAFA] border-collapse border border-[#EDEBEB]">
                                                        <thead>
                                                            <tr className="bg-[#FC9D25] text-white">
                                                                <th className="border border-[#EDEBEB] px-4 py-2 text-left">Product</th>
                                                                <th className="border border-[#EDEBEB] px-4 py-2 text-right">Price</th>
                                                                <th className="border border-[#EDEBEB] px-4 py-2 text-left">
                                                                    VCodClas
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-300">
                                                            {sub.products.map((product, index) => (
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
                                                                    <td className="border border-[#EDEBEB] px-4 py-2 text-right">
                                                                        {product?.price != null && !isNaN(product.price)
                                                                            ? `${Number(product.price).toFixed(2)} €`
                                                                            : '—'}
                                                                    </td>
                                                                    <td className="border border-[#EDEBEB] px-3 py-2 text-right">
                                                                        {product.VCodClas ?? '—'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>

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

                    </>
                )}

                {/* Carrinho*/}
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
                        className="fixed inset-0 z-30 bg-[#F0F0F0] md:bg-black/40 block md:block"
                        onClick={toggleSidebar}
                    />
                )}

                <div
                    className={`fixed top-0 right-0 h-full w-[400px] max-w-full bg-[#F0F0F0] shadow-lg transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}` }
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
                        {getCartItems().length === 0 ? (
                            <p className="text-sm">Your order is empty.</p>
                        ) : (
                            <div className="bg-white rounded-l border border-white pt-2 px-4 flex flex-col">
                                {getCartItems().map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className={`w-full py-4 ${idx !== getCartItems().length - 1 ? "border-b border-[#EDEDED]" : "pb-7"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-sm font-medium">
                                                    {item.name
                                                        .toLowerCase()
                                                        .split(" ")
                                                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                        .join(" ")}
                                                </p>
                                                <div className="flex items-center justify-between mt-2 gap-4">
                                                    {/* Quantity controls */}
                                                    <div className="flex items-center rounded overflow-hidden border border-gray-200 w-max">
                                                        <button
                                                            className="px-3.5 py-1 bg-white text-[#FC9D25] hover:bg-gray-300 transition"
                                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        >
                                                            <span className="inline-block transform scale-150 font-thin">-</span>
                                                        </button>
                                                        <span className="px-1 py-1 bg-white text-sm font-medium text-[#191919] border-gray-300">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            className="px-3 py-1 bg-white text-[#FC9D25] hover:bg-gray-300 transition"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
            </div>
        </>
    )
}