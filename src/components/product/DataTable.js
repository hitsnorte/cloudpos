'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { fetchProducts, createProduct, deleteProduct, updateProduct } from '@/src/lib/api';
import { HiOutlinePlusSm, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Spinner, // Adicionado o Spinner do NextUI
} from '@nextui-org/react';

const DataTable = () => {
  const [data, setData] = useState([]);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({ product_name: '', quantity: '' });
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Estado para controle de carregamento
  const [productToDelete, setProductToDelete] = useState(null);

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
      <ArrowDownIcon className="w-4 h-4 ml-1" />);
  };

  const filteredData = data.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.id.toString().includes(searchLower) ||
      item.product_name.toString().toLowerCase().includes(searchLower)
    );
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        product_name: newProduct.product_name,
        quantity: parseInt(newProduct.quantity),
      };
      const createdProduct = await createProduct(productData);
      setData([...data, createdProduct]);
      setNewProduct({ product_name: '', quantity: '' });
      onAddModalClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      setIsLoading(true); // Ativa o carregamento
      try {
        await deleteProduct(productToDelete);
        setData(data.filter((item) => item.id !== productToDelete));
        setProductToDelete(null);
        onDeleteModalClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false); // Desativa o carregamento
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
    <div className="container mx-auto px-4 py-8">
    {/* Campo de pesquisa */}
    <div className="mb-4 flex flex-col sm:flex-row items-center gap-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Pesquisar por ID ou Nome..."
        className="w-full max-w-md p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
      />
      <Button
        onPress={onAddModalOpen}
        className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 whitespace-nowrap"
      >
        <HiOutlinePlusSm size={15} />
        Adicionar
      </Button>
      </div>

  {/* Modal para adicionar produto */}
  <Modal
    isOpen={isAddModalOpen}
    onOpenChange={onAddModalClose}
    size="md"
    placement="center" // Centraliza o modal
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
                <label htmlFor="newProductName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  id="newProductName"
                  type="text"
                  value={newProduct.product_name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, product_name: e.target.value })
                  }
                  placeholder="Digite o nome do produto"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="newQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  id="newQuantity"
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, quantity: e.target.value })
                  }
                  placeholder="Digite a quantidade"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  required
                />
              </div>
            </form>
          </ModalBody>
          <ModalFooter className="flex justify-end border-t border-gray-200 pt-4 px-8">
            <Button
              type="submit"
              form="addProductForm"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium transition duration-200"
            >
              Adicionar
            </Button>
            <Button
              onPress={onClose}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-600 font-medium ml-3 transition duration-200"
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    value={editProduct.quantity}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, quantity: e.target.value })
                    }
                    placeholder="Digite a quantidade"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                    required
                  />
                </div>
              </form>
            )}
          </ModalBody>
          <ModalFooter className="flex justify-end border-t border-gray-200 pt-4 px-8">
            <Button
              type="submit"
              form="updateProductForm"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium transition duration-200"
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
            <table className="min-w-full bg-white border border-gray-200 mx-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-2 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center justify-center">
                      ID
                      {renderSortIcon('id')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('product_name')}
                  >
                    <div className="flex items-center justify-center">
                      Nome
                      {renderSortIcon('product_name')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center justify-center">
                      Quantidade
                      {renderSortIcon('quantity')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {item.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {item.quantity}
                    </td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2 ">
                  <Button
                    onPress={() => {
                      handleEditProduct(item);
                      onEditModalOpen();
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  >
                    <HiOutlinePencil size={15} />
                    Editar
                  </Button>
                  <Button
                    onPress={() => {
                      setProductToDelete(item.id);
                      onDeleteModalOpen();
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <HiOutlineTrash size={15} />
                    Excluir
                  </Button>
                 
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