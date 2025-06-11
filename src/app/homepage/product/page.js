'use client';

import { useState, useEffect } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import CustomPagination from "@/src/components/table/page";
import { fetchProduct, createProduct, deleteProduct, updateProduct } from '@/src/lib/apiproduct';
import { fetchSubfamily } from '@/src/lib/apisubfamily';
import { fetchFamily } from '@/src/lib/apifamily';
import { fetchGrup } from '@/src/lib/apigroup';

const DataProduct = () => {
  const [products, setProducts] = useState([]);
  const [subfamilies, setSubfamilies] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({ product_name: '', quantity: '' });
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedSubfamily, setSelectedSubfamily] = useState(null);

  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadProducts();
    loadSubfamilies();
  }, []);

  const handleChangeRowsPerPage = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setItemsPerPage(newSize);
    setCurrentPage(1); // Reset to the first page
  };

  const loadProducts = async () => {
    try {
      const products = await fetchProduct();
      const subfamilyMap = await fetchSubfamilyMap();
      const familyMap = await fetchFamilyMap();
      const groupMap = await fetchGroupMap();

      const enrichedProducts = products.map(product => ({
        ...product,
        VDescSubfamily: subfamilyMap[product.VSUBFAM] || "N/A",
        VDescFamily: familyMap[product.VCodFam] || "N/A",
        VDescGroup: groupMap[product.VCodGrfam] || "N/A",
      }));

      setProducts(enrichedProducts);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchSubfamilyMap = async () => {
    try {
      const subfamilies = await fetchSubfamily();
      return subfamilies.reduce((map, subfamily) => {
        map[subfamily.VCodSubFam] = subfamily.VDesc;
        return map;
      }, {});
    } catch (err) {
      setError(err.message);
      return {};
    }
  };

  const fetchFamilyMap = async () => {
    try {
      const families = await fetchFamily();
      return families.reduce((map, family) => {
        map[family.VCodFam] = family.VDesc;
        return map;
      }, {});
    } catch (err) {
      setError(err.message);
      return {};
    }
  };

  const fetchGroupMap = async () => {
    try {
      const groups = await fetchGrup();
      return groups.reduce((map, group) => {
        map[group.VCodGrFam] = group.VDesc;
        return map;
      }, {});
    } catch (err) {
      setError(err.message);
      return {};
    }
  };

  const loadSubfamilies = async () => {
    try {
      const subfamilies = await fetchSubfamily();
      setSubfamilies(subfamilies);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.product_name || !selectedSubfamily) {
      setError('Preencha o nome do produto e selecione uma Subfamília.');
      return;
    }

    try {
      setIsLoading(true);
      const productData = {
        product_name: newProduct.product_name,
        quantity: newProduct.quantity,
        selectedSubfamily,
      };

      await createProduct(productData);
      await loadProducts();
      setNewProduct({ product_name: '', quantity: '' });
      setSelectedSubfamily('');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct({ ...product });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editProduct || !editProduct.product_name) {
      setError('Preencha o nome do produto.');
      return;
    }

    try {
      setIsLoading(true);
      await updateProduct(editProduct.id, { product_name: editProduct.product_name });
      await loadProducts();
      setEditProduct(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      setIsLoading(true);
      try {
        await deleteProduct(productToDelete);
        setProducts(products.filter((product) => product.id !== productToDelete));
        setProductToDelete(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredProducts = products.filter((product) =>
    Object.values(product).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="p-4">
      {/* Header with Search and Add */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">All Products</h2>
        <button
          onClick={() => setNewProduct({ product_name: '', quantity: '' })}
          className="bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded"
        >
          <Plus size={25} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex mb-4 items-center gap-2">
        <input
          type="text"
          placeholder="Search by any field..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FC9D25]"
        />
      </div>

      {/* Table */}
      <div className="mt-5">
        {paginatedProducts.length > 0 ? (
          <table className="w-full text-left mb-5 border-collapse">
            <thead>
              <tr className="bg-[#FC9D25] text-white h-12">
                <td className="pl-2 pr-2 w-8 border-r border-[#e6e6e6]">
                  <FaGear size={18} color="white" />
                </td>
                <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6] uppercase">Cod Prod</td>
                <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6] uppercase">Description</td>
                <td className="pl-2 pr-2 border-r border-[#e6e6e6] uppercase">Cod SubFam</td>
                <td className="pl-2 pr-2 border-r border-[#e6e6e6] uppercase">Desc SubFam</td>
                <td className="pl-2 pr-2 border-r border-[#e6e6e6] uppercase">Cod Fam</td>
                <td className="pl-2 pr-2 border-r border-[#e6e6e6] uppercase">Desc Fam</td>
                <td className="pl-2 pr-2 border-r border-[#e6e6e6] uppercase">Cod Grp</td>
                <td className="pl-2 pr-2 uppercase">Desc Grp</td>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product, index) => (
                <tr
                  key={product.VPRODUTO || index}
                  className="h-10 border-b border-[#e8e6e6] text-left transition-colors duration-150 hover:bg-[#FC9D25]/20"
                >
                  <td className="pl-1 flex items-start border-r border-[#e6e6e6]">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          variant="light"
                          className="flex justify-center items-center w-auto min-w-0 p-0 m-0"
                        >
                          <HiDotsVertical size={20} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Actions" className="min-w-[150px] bg-white rounded-lg shadow-xl py-2 px-1">
                        <DropdownItem onPress={() => handleEditProduct(product)}>Edit</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </td>
                  <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6]">{product.VPRODUTO}</td>
                  <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6]">{product.VDESC1}</td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{product.VSUBFAM}</td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{product.VDescSubfamily}</td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{product.VCodFam}</td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{product.VDescFamily}</td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{product.VCodGrfam}</td>
                  <td className="pl-2 pr-2">{product.VDescGroup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No products available</p>
        )}
      </div>

      {/* Pagination */}
      <div className="bottom-0 w-full bg-white p-0 m-0 pagination-container">
        <CustomPagination
          page={currentPage}
          pages={totalPages}
          rowsPerPage={itemsPerPage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          setPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default DataProduct;