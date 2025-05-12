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
    const [count, setCount] = useState(1)
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
    const [isConfirmed, setIsConfirmed] = useState(() => JSON.parse(localStorage.getItem("isConfirmed")) || false);


    const [viewType, setViewType] = useState('groups', 'families', 'subfamilies') // 'groups' | 'families' | 'subfamilies'

    const toggleCart = () => setCartOpen(prev => !prev);

    const closeModal = () => {
        setSelectedProduct(null);
        setCount(1);
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
                const [groups, families, subfamilies, products, classeprecos] = await Promise.all([
                    fetchGrup(),
                    fetchFamily(),
                    fetchSubfamily(),
                    fetchProduct(),
                    fetchClassepreco(),
                ]);


                const structuredGroups = groups.map((group) => {
                    const productsForGroup = products
                        .filter((p) => String(p.VCodGrfam) === String(group.VCodGrFam))
                        .map((p, index) => ({
                            id: p?.VCodProd ? String(p.VCodProd) : `product-${index}`,
                            name: p?.VDESC1?.trim() || 'Unnamed Product',
                        }));

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

                setGroupsWithProducts(structuredGroups);
                setFamiliesWithProducts(structuredFamilies);
                setSubfamiliesWithProducts(structuredSubfamilies);
                setClasseprecoWithProducts(structuredClassePrecos);
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
              setDashboardData({ BLIND: 0, SPA: 0, FLORBELA: 0,});
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
    
      const produtosPorClasse = (vcodi) =>
        produtos.filter((p) => p.Vcodi === vcodi);
    

    if (!dashboardData) {
        return <p className="text-center text-lg">Loading dashboard...</p>;
      }

    const cardPaths = [
        { label: "BLIND", value: dashboardData.totalGroups || 0, path: "/homepage/" },
        { label: "SPA", value: dashboardData.totalFamilies || 0, path: "/homepage/" },
        { label: "FLORBELA", value: dashboardData.totalSubfamilies || 0, path: "/homepage/" },
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
        <div>

            {/*  dashboard */}
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
                      onClick={() => handleCardClick(card.path)}
                  >
                    <p className="text-5xl font-bold text-[#FC9D25] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      {card.value}
                    </p>
                    <p className="text-center h-13 text-lg text-gray-600 absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      {card.label}
                    </p>
                  </div>
                </CardBody>
              </Card>
          ))}
        </div>
      </div>


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
            <div className="absolute top-6 right-11 w-17 text-white flex items-center justify-center">
            <button
                className="relative text-3xl text-[#191919] hover:text-[#FC9D25] transition"
                onClick={toggleCart}
            >
                <TiShoppingCart />
                {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border border-white"></span>
                )}
            </button>
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

                        <div className="flex items-left justify-left space-x-4 m-5">
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
                        <div className="mt-6 flex justify-end gap-2 "
                        >
                            <button 
                                onClick={() => {
                                setCartItems(prev => {
                                    const existing = prev.find(item => item.id === selectedProduct.id);
                                    if (existing) {
                                        return prev.map(item => item.id === selectedProduct.id ? { ...item, count: item.count + count } : item);
                                    }
                                    else {
                                        return [...prev, { ...selectedProduct, count }];
                                    }
                                });
                                closeModal();
                            }} className="px-6 py-2 m-5 mt-0 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200">
                               {isLoading ? <Spinner size="sm" color="white" /> : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal do carrinho */}
            {cartOpen && (
            <div className="fixed top-16 right-15.5">
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
    )
}
