'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaMagnifyingGlass } from 'react-icons/fa6'; // Certifique-se de importar isso
import { fetchGrup } from '@/src/lib/apigroup'
import { fetchProduct } from '@/src/lib/apiproduct'
import { fetchFamily } from '@/src/lib/apifamily'
import { fetchIva } from '@/src/lib/apiiva';
import { fetchSubfamily } from '@/src/lib/apisubfamily';
import { fetchClassepreco } from '@/src/lib/apiclassepreco';
import { fetchPreco } from "@/src/lib/apipreco";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TiShoppingCart } from 'react-icons/ti';
import { IoIosArrowBack } from "react-icons/io"
import AddProductModal from '@/src/components/modals/POS/addProduct/page';
import CartPage from '@/src/components/modals/POS/cart/page';
import { fetchPostos } from '@/src/lib/apipostos';
import { fetchMesas } from '@/src/lib/apimesas';
import { fetchSalas } from '@/src/lib/apisalas';
import { fetchPostossalas } from '@/src/lib/apipostossalas';

export default function Cart() {
    const [propertyID, setPropertyID] = useState(null);
    const [viewType, setViewType] = useState('groups');
    const [searchTerm, setSearchTerm] = useState('');
    const [groupsWithProducts, setGroupsWithProducts] = useState([]);
    const [familiesWithProducts, setFamiliesWithProducts] = useState([]);
    const [subfamiliesWithProducts, setSubfamiliesWithProducts] = useState([]);
    const [openGroupID, setOpenGroupID] = useState(null);
    const [loading, setLoading] = useState(true);
    const [classeprecoWithProducts, setClasseprecoWithProducts] = useState([]);
    const [precoWithProducts, setPrecoWithProducts] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    // modal adiciona produto
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [count, setCount] = useState(0);

    const params = useParams();
    const [selectedTable, setSelectedTable] = useState(null);


    const [posto, setPosto] = useState(null);
    const [sala, setSala] = useState(null);
    const [mesa, setMesa] = useState(null);

    const router = useRouter();

    useEffect(() => {
        if (!params?.id) return;
        setSelectedTable({ ID_Mesa: params.id }); // ou buscar mais info da mesa aqui
    }, [params?.id]);

    useEffect(() => {
        const storedPosto = JSON.parse(localStorage.getItem("selectedPosto"));
        const storedSala = JSON.parse(localStorage.getItem("selectedSala"));
        const storedMesa = JSON.parse(localStorage.getItem("selectedMesa"));

        setPosto(storedPosto);
        setSala(storedSala);
        setMesa(storedMesa);
    }, []);

    const cartKey = posto && mesa && sala ? `${posto.Icodi}:${mesa.ID_Mesa}:${sala.ID_SALA}` : null;

    useEffect(() => {
        const storedID = localStorage.getItem('selectedProperty');
        if (storedID) {
            setPropertyID(storedID);
            console.log("PropertyID do localStorage:", storedID);
        } else {
            console.warn("Nenhuma propriedade encontrada no localStorage!");
        }
    }, []);

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

    const addToCart = (productWithQuantity) => {
        if (!cartKey) return; // garantir que cartKey existe

        // Recuperar o carrinho atual
        const existingCartJson = localStorage.getItem(cartKey);
        const existingCart = existingCartJson ? JSON.parse(existingCartJson) : [];

        // Verificar se o produto já existe no carrinho
        const index = existingCart.findIndex(item => item.id === productWithQuantity.id);

        if (index > -1) {
            // Atualizar quantidade do produto existente
            existingCart[index].quantity += productWithQuantity.quantity;
        } else {
            // Adicionar novo produto
            existingCart.push(productWithQuantity);
        }

        // Guardar carrinho atualizado
        localStorage.setItem(cartKey, JSON.stringify(existingCart));

        // Opcional: atualizar estado local para re-renderizar modal, se tiver
        setCurrentCart(existingCart);
    };


    const [currentCart, setCurrentCart] = useState([]);

    const handleBackToTables = () => {
        const previousPage = localStorage.getItem("previousPage");
        console.log("Previous Page:", previousPage);

        if (previousPage) {
            localStorage.removeItem("previousPage");
            router.push(previousPage);
        } else {
            router.back();
        }
    };

    // Carregar produtos do localStorage ao abrir o carrinho
    useEffect(() => {
        if (isCartOpen && cartKey) {
            const storedCart = localStorage.getItem(cartKey);
            setCurrentCart(storedCart ? JSON.parse(storedCart) : []);
        }
    }, [isCartOpen, cartKey]);

    useEffect(() => {
        if (cartKey) {
            const storedCart = localStorage.getItem(cartKey);
            setCurrentCart(storedCart ? JSON.parse(storedCart) : []);
        }
    }, [cartKey]);

    // Função para obter itens atuais (passar para CartPage)
    const getCartItems = () => currentCart;

    // Atualizar quantidade no carrinho e no localStorage
    const updateQuantity = (productId, newQuantity) => {
        const updatedCart = currentCart.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
        );
        setCurrentCart(updatedCart);
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    };

    // Remover item do carrinho e atualizar localStorage
    const removeItem = (productId) => {
        const updatedCart = currentCart.filter(item => item.id !== productId);
        setCurrentCart(updatedCart);
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    };

    return (
        <>
            <div className="relative">
                <button
                    className="fixed bottom-6 right-6 md:top-6 md:right-15 md:bottom-auto text-3xl text-[#191919] hover:text-[#FC9D25] transition z-50"
                    onClick={() => setIsCartOpen(true)}
                >
                    <TiShoppingCart />
                    {currentCart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {currentCart.reduce((total, item) => total + item.quantity, 0)}
                        </span>
                    )}
                </button>

                {isCartOpen && (
                    <CartPage
                        currentCart={currentCart}
                        selectedTable={selectedTable}
                        getCartItems={getCartItems}
                        updateQuantity={updateQuantity}
                        removeItem={removeItem}
                    />
                )}

                <div className="w-full px-4 py-2">
                    {/* Título com o Posto */}
                    {mesa ? (
                        <h2 className="text-lg text-center mb-4">
                            Posto: {posto?.VDescricao || posto?.Nome || 'Posto não definido'}
                        </h2>
                    ) : (
                        <h2 className="text-lg font-semibold text-center mb-4">
                            Nenhuma mesa selecionada
                        </h2>
                    )}

                    {/* Botões */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 max-w-md mx-auto ">
                        {/* Mesas button */}
                        <button
                            onClick={handleBackToTables}
                            className="flex items-left justify-center gap-x-2 px-4 py-2 bg-[#FC9D25] text-white rounded"
                        >
                            <IoIosArrowBack size={21} />
                            <span>Mesas</span>
                        </button>

                        {/* Groups */}
                        <button
                            onClick={() => setViewType('groups')}
                            className={`px-4 py-2 rounded ${viewType === 'groups' ? 'bg-[#FC9D25] text-white' : 'bg-gray-200 text-[#191919]'}`}
                        >
                            Groups
                        </button>

                        {/* Families */}
                        <button
                            onClick={() => setViewType('families')}
                            className={`px-4 py-2 rounded ${viewType === 'families' ? 'bg-[#FC9D25] text-white' : 'bg-gray-200 text-[#191919]'}`}
                        >
                            Families
                        </button>

                        {/* Subfamilies */}
                        <button
                            onClick={() => setViewType('subfamilies')}
                            className={` px-4 py-2 min-w-[120px] rounded ${viewType === 'subfamilies' ? 'bg-[#FC9D25] text-white' : 'bg-gray-200 text-[#191919]'}`}
                        >
                            Subfamilies
                        </button>
                    </div>
                </div>

            </div>

            <div className="flex items-center justify-between space-x-4 flex-wrap md:flex-nowrap mt-4">
                <div className="relative flex-1 min-w-[200px] md:min-w-auto">
                    <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2"
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

                {selectedProduct && (
                    <AddProductModal
                        selectedProduct={selectedProduct}
                        setSelectedProduct={setSelectedProduct}
                        addToCart={addToCart}
                        count={count}
                        setCount={setCount}
                    />
                )}
            </div>
        </>
    );
}