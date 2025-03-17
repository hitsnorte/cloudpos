'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { fetchProduct, createProduct, deleteProduct, updateProduct } from '@/src/lib/apiproduct';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from '@nextui-org/react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";

const DataProduct = () => {
  const [products, setProducts] = useState([]);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({ product_name: '', quantity: '' });
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [quantityError, setQuantityError] = useState(''); 

  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const products = await fetchProduct();
      setProducts(products);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    const sortedProducts = [...products].sort((a, b) => {
      if (field === 'quantity' || field === 'id') {
        return sortOrder === 'asc' ? a[field] - b[field] : b[field] - a[field];
      }
      return sortOrder === 'asc'
        ? a[field].localeCompare(b[field])
        : b[field].localeCompare(a[field]);
    });
    setProducts(sortedProducts);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 ml-1" />
    );
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.id.toString().includes(searchLower) ||
      product.product_name.toString().toLowerCase().includes(searchLower)
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.product_name) {
      setError('Preencha o nome do produto.');
      return;
    }
  
    const productExists = products.some(
      (product) => product.product_name.toLowerCase() === newProduct.product_name.toLowerCase()
    );
    if (productExists) {
      setQuantityError('Este produto já existe. Por favor, use um nome diferente.');
      return;
    }
  
    try {
     setIsLoading(true);
     const productData = { product_name: newProduct.product_name, quantity: newProduct.quantity };
     const createdProduct = await createProduct(productData);
     setProducts([...products, createdProduct]);
     setNewProduct({ product_name: '' , quantity: ''});
     setError(null); // Limpa o erro após sucesso
     onAddModalClose();
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
        onDeleteModalClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct({ ...product });
    onEditModalOpen();
  };

  const handleUpdateProduct = async (e) => {
      e.preventDefault();
      if (!editProduct || !editProduct.product_name) {
        setError('Preencha o nome do produto.');
        return;
      }
    
      try {
        console.log('Enviando para API:', { id: editProduct.id, product_name: editProduct.product_name });
        const updatedProduct = await updateProduct(editProduct.id, {
          product_name: editProduct.product_name,
          quantity: editProduct.quantity,
        });
        console.log('Resposta da API:', updatedProduct);
        setProducts(products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)));
        setEditProduct(null);
        setError(null); // Limpa o erro após sucesso
        onEditModalClose();
      } catch (err) {
        console.error('Erro ao atualizar produto:', err.message);
        console.log('Erro ao atualizar produto:', err.message);
        setError(err.message); // Define o erro para exibição no modal
      }
    };

  return (
    <div className="p-4">
      {/* button */}
            <Dropdown>
            <DropdownTrigger>
            <button className="absolute top-4 right-10 bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded">
                < Plus size={25} />     
            </button>
            </DropdownTrigger>
             <DropdownMenu
                aria-label="Dynamic Actions"
                placement="bottom-end"
                className="bg-white shadow-lg rounded-md p-1"
                style={{ marginLeft: '80px' }}
                   >
                    <DropdownItem
                      type="text"
                      key="add"
                      onPress={onAddModalOpen}
                      
                    >
                    Add        
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

      {/* Modal para adicionar produto */}
      <Modal 
        isOpen={isAddModalOpen}
        onOpenChange={onAddModalClose}
        size="md"
        placement="center"
        className="w-100  shadow-xl rounded-lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="rounded bg-[#FC9D25] flex justify-left items-left">
                <h3 className="text-xl flex justify-left items-left font-bold text-white">New Product</h3>
              </ModalHeader>
              <ModalBody className="py-6 px-8">
                <form id="addProductForm" onSubmit={handleAddProduct} className="space-y-6">
                  <div>
                    <label
                      htmlFor="newProductName"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Name
                    </label>
                    <input
                      id="newProductName"
                      type="text"
                      name="product_name"
                      value={newProduct.product_name}
                      onChange={handleInputChange}
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="newQuantity"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Quantity
                    </label>
                    <input
                      id="newQuantity"
                      type="text" 
                      name="quantity"
                      value={newProduct.quantity}
                      onChange={handleInputChange}
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                    {quantityError && (
                      <p className="text-red-500 text-sm mt-1">{quantityError}</p>
                    )}
                  </div>
                </form>
              </ModalBody>
              <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
                <Button
                  type="submit"
                  form="addProductForm"
                  className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner size="sm" color="white" /> : 'Adicionar'}
                </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>

  {/* Modal para editar produto */}
  <Modal
    isOpen={isEditModalOpen}
    onOpenChange={onEditModalClose}
    size="md"
    placement="center" // Centraliza o modal
    className="w-100 bg-white shadow-xl rounded-lg"
  >
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="rounded bg-[#FC9D25] flex justify-left items-left">
            <h3 className="text-xl flex justify-left items-left font-bold text-white">Edit product</h3>
          </ModalHeader>
          <ModalBody className="py-5 px-6">
            {editProduct && (
              <form id="updateProductForm" onSubmit={handleUpdateProduct} className="space-y-6">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    id="productName"
                    type="text"
                    value={editProduct.product_name}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, product_name: e.target.value })
                    }
                    placeholder="Digite o nome do produto"
                    className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-400 mb-1">
                    Quantity
                  </label>
                  <input
                      id="newQuantity"
                      type="text"   
                      name="quantity"
                      value={editProduct.quantity}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, quantity: e.target.value })
                      }
                      placeholder="Digite a quantidade"
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                    {quantityError && (
                      <p className="text-red-500 text-sm mt-1">{quantityError}</p>
                    )}
                </div>
              </form>
            )}
          </ModalBody>
          <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
            <Button
              type="submit"
              form="updateProductForm"
              className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
            >
              Save
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>  

  {/* Modal para excluir produto */}
  <Modal
    isOpen={isDeleteModalOpen}
    onOpenChange={onDeleteModalClose}
    size="md"
    placement="center" 
    className="bg-white shadow-xl rounded-lg"
  >
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex justify-center items-center border-b border-gray-200 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
          </ModalHeader>
          <ModalBody className="py-6 px-8">
          {isLoading ? (
              <div className="flex justify-center items-center">
                <Spinner size="lg" />
                <span className="ml-2">Deletion...</span>
              </div>
            ) : (
            <p className="text-center text-gray-700">Are you sure you want to delete the product?</p>
          )}
          </ModalBody>
          <ModalFooter className="flex justify-end border-t border-gray-200 pt-4 px-8">
            <Button
              onPress={onClose}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium"
            >
              Cancel
            </Button>
            <Button
              onPress={() => {
                handleDeleteProduct(productToDelete);
                onClose();
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium ml-3"
            >
              Exclude
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
          {/*---------------------------------------------------------------------------------------------------------------------------------- */}
          <div className="overflow-x-auto sm:flex sm:flex-col bg-muted/40">
    <table className="min-w-full bg-[#FAFAFA] border-collapse border border-[#EDEBEB] mx-auto">
    <thead>
            <tr>
              <th className="border-collapse border border-[#EDEBEB] !w-[1px] px-1 sm:px-5 py-4 bg-[#FC9D25]">
                <div className=" flex items-left justify-left">
                  <FaGear size={20} color='white'/>
                </div>
              </th>
              <th className="border-collapse border border-[#EDEBEB] w-1 px-1 sm:px-5 py-4 bg-[#FC9D25] text-[#FAFAFA]">
                <div className="w-2 flex items-right justify-right"> 
                  ID
                </div>
              </th>
              <th className="border-collapse border border-[#EDEBEB] sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA]">
               <div className="flex items-center justify-left "> 
                  NAME
              </div>
              </th>
              <th className="border-collapse border border-[#EDEBEB] sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA]">
               <div className="flex items-center justify-left "> 
                  QUANTITY
              </div>
              </th>
            </tr>
          </thead>
      <tbody className="divide-y divide-gray-300">
        {filteredProducts.map((product) => (
          <tr key={product.id} className="hover:bg-gray-200">
            <td className="border-collapse border border-[#EDEBEB] w-1 py-1 whitespace-nowrap text-sm text-[#191919] text-center">
                <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered">
                        <HiDotsVertical size={18} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Dynamic Actions"
                      placement="bottom-end"
                      className="bg-white shadow-lg rounded-md p-1"
                      style={{ marginLeft: '80px' }}
                    >
                     {/* <DropdownItem
                        key="add"
                        onPress={onAddModalOpen}
                        className="hover:bg-gray-100"
                      >
                        Adicionar
                      </DropdownItem>*/}
                      <DropdownItem
                        key="edit"
                        onPress={() => {
                          handleEditProduct(product);
                          onEditModalOpen();
                        }}
                        className="hover:bg-gray-100"
                      >
                        Edit
                      </DropdownItem>
                      {/*<DropdownItem
                        key="delete"
                        className="text-danger hover:bg-red-50"
                        color="danger"
                        onPress={() => {
                          setGroupToDelete(group.id);
                          onDeleteModalOpen();
                        }}
                      >
                        Excluir
                      </DropdownItem>*/}
                    </DropdownMenu>
                  </Dropdown>

                  </td>
            <td className="border-collapse border border-[#EDEBEB] px-3 py-2 whitespace-nowrap text-sm text-[#191919] text-right">
              {product.id}
            </td>
            <td className="border-collapse border border-[#EDEBEB] px-4 py-2 whitespace-nowrap text-sm text-[#191919] text-left">
              {product.product_name}
            </td>
            <td className="border-collapse border border-[#EDEBEB] px-4 py-2 whitespace-nowrap text-sm text-[#191919] text-left">
              {product.quantity}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
      </div>
      {filteredProducts.length === 0 && !error && (
        <p className="text-center py-4">No products found.</p>
      )}
    </div>
  );
};

export default DataProduct;