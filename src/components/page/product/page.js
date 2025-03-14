'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { fetchProducts, createProduct, deleteProduct, updateProduct } from '@/src/lib/apiprodut';
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

const DataTable = () => {
  const [data, setData] = useState([]);
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
      const products = await fetchProducts();
      setData(products);
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
    const sortedData = [...data].sort((a, b) => {
      if (field === 'quantity' || field === 'id') {
        return sortOrder === 'asc' ? a[field] - b[field] : b[field] - a[field];
      }
      return sortOrder === 'asc'
        ? a[field].localeCompare(b[field])
        : b[field].localeCompare(a[field]);
    });
    setData(sortedData);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 ml-1" />
    );
  };

  const filteredData = data.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.id.toString().includes(searchLower) ||
      item.product_name.toString().toLowerCase().includes(searchLower)
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'quantity') {
      const numValue = value.replace(/[^0-9]/g, ''); 
      if (numValue === '' || parseInt(numValue) > 0) {
        setNewProduct((prev) => ({ ...prev, [name]: numValue }));
        setQuantityError('');
      } else {
        setQuantityError('A quantidade deve ser maior que 0');
      }
    } else {
      setNewProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.product_name || !newProduct.quantity || parseInt(newProduct.quantity) <= 0) {
      setQuantityError('Preencha todos os campos corretamente. A quantidade deve ser maior que 0.');
      return;
    }
  
    const productExists = data.some(
      (product) => product.product_name.toLowerCase() === newProduct.product_name.toLowerCase()
    );
    if (productExists) {
      setQuantityError('Este produto já existe. Por favor, use um nome diferente.');
      return;
    }
  
    try {
      setIsLoading(true);
      const productData = {
        product_name: newProduct.product_name,
        quantity: parseInt(newProduct.quantity),
      };
      const createdProduct = await createProduct(productData);
      setData([...data, createdProduct]);
      setNewProduct({ product_name: '', quantity: '' });
      setQuantityError(''); // Limpa a mensagem de erro após sucesso
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
        setData(data.filter((item) => item.id !== productToDelete));
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
    if (editProduct) {
      try {
        const updatedProduct = await updateProduct(editProduct.id, {
          product_name: editProduct.product_name,
          quantity: parseInt(editProduct.quantity),
        });
        setData(data.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)));
        setEditProduct(null);
        onEditModalClose();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (error) return <div className="text-red-500">Erro: {error}</div>;

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
                      placeholder="Digite o nome"
                      key="add"
                      onPress={onAddModalOpen}
                      
                    >
                    adicionar        
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

      {/* Modal para adicionar produto */}
      <Modal
        isOpen={isAddModalOpen}
        onOpenChange={onAddModalClose}
        size="md"
        placement="center"
        className="bg-white shadow-xl rounded-lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-center items-center border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900">Adicionar Novo Produto</h3>
              </ModalHeader>
              <ModalBody className="py-6 px-8">
                <form id="addProductForm" onSubmit={handleAddProduct} className="space-y-6">
                  <div>
                    <label
                      htmlFor="newProductName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nome do Produto
                    </label>
                    <input
                      id="newProductName"
                      type="text"
                      name="product_name"
                      value={newProduct.product_name}
                      onChange={handleInputChange}
                      placeholder="Digite o nome do produto"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="newQuantity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quantidade
                    </label>
                    <input
                      id="newQuantity"
                      type="text" 
                      name="quantity"
                      value={newProduct.quantity}
                      onChange={handleInputChange}
                      placeholder="Digite a quantidade"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      required
                    />
                    {quantityError && (
                      <p className="text-red-500 text-sm mt-1">{quantityError}</p>
                    )}
                  </div>
                </form>
              </ModalBody>
              <ModalFooter className="flex justify-end border-t border-gray-200 pt-4 px-8">
                <Button
                  type="submit"
                  form="addProductForm"
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium transition duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner size="sm" color="white" /> : 'Adicionar'}
                </Button>
                <Button
                  onPress={onClose}
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-600 font-medium ml-3 transition duration-200"
                  disabled={isLoading}
                >
                  Cancelar
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
    className="bg-white shadow-xl rounded-lg"
  >
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex justify-center items-center border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900">Editar Produto</h3>
          </ModalHeader>
          <ModalBody className="py-6 px-8">
            {editProduct && (
              <form id="updateProductForm" onSubmit={handleUpdateProduct} className="space-y-6">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Produto
                  </label>
                  <input
                    id="productName"
                    type="text"
                    value={editProduct.product_name}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, product_name: e.target.value })
                    }
                    placeholder="Digite o nome do produto"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400- transition duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade
                  </label>
                  <input
                      id="newQuantity"
                      type="text"   
                      name="quantity"
                      value={newProduct.quantity}
                      onChange={handleInputChange}
                      placeholder="Digite a quantidade"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      required
                    />
                    {quantityError && (
                      <p className="text-red-500 text-sm mt-1">{quantityError}</p>
                    )}
                </div>
              </form>
            )}
          </ModalBody>
          <ModalFooter className="flex justify-end border-t border-gray-200 pt-4 px-8">
            <Button
              type="submit"
              form="updateProductForm"
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium transition duration-200"
            >
              Salvar
            </Button>
            <Button
              onPress={onClose}
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium ml-3 transition duration-200"
            >
              Cancelar
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
            <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
          </ModalHeader>
          <ModalBody className="py-6 px-8">
          {isLoading ? (
              <div className="flex justify-center items-center">
                <Spinner size="lg" />
                <span className="ml-2">Excluindo...</span>
              </div>
            ) : (
            <p className="text-center text-gray-700">Tem certeza que deseja excluir o produto?</p>
          )}
          </ModalBody>
          <ModalFooter className="flex justify-end border-t border-gray-200 pt-4 px-8">
            <Button
              onPress={onClose}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium"
            >
              Cancelar
            </Button>
            <Button
              onPress={() => {
                handleDeleteProduct(productToDelete);
                onClose();
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium ml-3"
            >
              Excluir
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
        {filteredData.map((item) => (
          <tr key={item.id} className="hover:bg-gray-200">
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
                      <DropdownItem
                        key="add"
                        onPress={onAddModalOpen}
                        className="hover:bg-gray-100"
                      >
                        Adicionar
                      </DropdownItem>
                      {/*<DropdownItem
                        key="edit"
                        onPress={() => {
                          handleEditGroup(group);
                          onEditModalOpen();
                        }}
                        className="hover:bg-gray-100"
                      >
                        Editar
                      </DropdownItem>*/}
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
              {item.id}
            </td>
            <td className="border-collapse border border-[#EDEBEB] px-4 py-2 whitespace-nowrap text-sm text-[#191919] text-left">
              {item.product_name}
            </td>
            <td className="border-collapse border border-[#EDEBEB] px-4 py-2 whitespace-nowrap text-sm text-[#191919] text-left">
              {item.quantity}
            </td>
            
          </tr>
        ))}
      </tbody>
    </table>
      </div>
      {filteredData.length === 0 && !error && (
        <p className="text-center py-4">Nenhum produto encontrado.</p>
      )}
    </div>
  );
};

export default DataTable;