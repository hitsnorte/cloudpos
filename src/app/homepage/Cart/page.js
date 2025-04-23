'use client'

import { fetchGrup } from '@/src/lib/apigroup'
import { fetchProduct } from '@/src/lib/apiproduct'
import { useEffect, useState } from 'react'
import { TiShoppingCart } from 'react-icons/ti'
import { ChevronDown, ChevronRight } from 'lucide-react'

export default function ProductGroups() {
    const [groupsWithProducts, setGroupsWithProducts] = useState([])
    const [openGroupID, setOpenGroupID] = useState(null)
    const [loading, setLoading] = useState(true)
    const [propertyID, setPropertyID] = useState(null)

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

                    setPropertyID(String(parsed?.id)) // Update state with the ID
                } else {

                }
            } catch (e) {
                console.error("Error reading 'selectedProperty'", e)
            }
        }
        fetchPropertyID()
    }, [])

    // Fetch groups and products once propertyID is available
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

                console.log('Fetched groups:', groups);
                console.log('Fetched products:', products);

                const structuredData = groups.map((group) => {
                    const productsForGroup = products
                        .filter((p) => String(p.VCodGrfam) === String(group.VCodGrFam))
                        .map((p, index) => {
                            console.log('Product in group:', group.VDesc, p);

                            return {
                                id: p?.VCodProd ? String(p.VCodProd) : `product-${index}`,
                                name: p?.VDESC1?.trim() || 'Unnamed Product',
                            };
                        })

                    console.log('Group:', group.VDesc, 'Products matched:', productsForGroup.length);

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
                                        <th className="border border-[#EDEBEB] px-4 py-2 text-center w-[50px]">
                                            <TiShoppingCart size={20} className="mx-auto" />
                                        </th>
                                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">
                                            Produto
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-300">

                                    {(() => {
                                        console.log(`Rendering group ${group.name} with`, group.products.length, 'products')
                                        return null
                                    })()}


                                    {group.products.map((product , index) => (
                                        <tr
                                            key={product.id || `product-${index}`}
                                            className="hover:bg-indigo-50 transition-colors"
                                        >
                                            <td className="border border-[#EDEBEB] px-2 py-2 text-center">
                                                <input type="checkbox" />
                                            </td>
                                            <td className="border border-[#EDEBEB] px-4 py-2 text-gray-700">
                                                {product.name}
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
    )
}
