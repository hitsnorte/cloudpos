'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect, useMemo } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { fetchProduct, createProduct, deleteProduct, updateProduct } from '@/src/lib/apiproduct';
import { fetchUnit } from '@/src/lib/apiunit';

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

const PAGE_SIZES = [25, 50, 150, 250];

const DataUnit = () => {
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedIva, setSelectedIva] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [units, setUnits] = useState([]);

  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({ key: 'VDesc', direction: 'asc' });

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
  const {
    isOpen: isSelectModalOpen,
    onOpen: onSelectModalOpen,
    onClose: onSelectModalClose,
  } = useDisclosure();


  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const units = await fetchUnit();

      // Mapeamos os produtos, adicionando a descrição da subfamília e da família correspondente
      const enrichedUnits = units.map(unit => ({
        ...unit,
      }));

      setUnits(enrichedUnits);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const loadColumnVisibility = () => {
    const savedVisibility = localStorage.getItem('columnVisibility');
    if (savedVisibility) {
      return JSON.parse(savedVisibility);
    }
    return {
      idUnit: true, // estado padrão
      typeProd: true,
      description: true,
    };
  };

  const saveColumnVisibility = () => {
    localStorage.setItem('columnVisibility', JSON.stringify(columnVisibility));
  };

  const toggleColumn = (column) => {
    setColumnVisibility((prev) => {
      const newVisibility = { ...prev, [column]: !prev[column] };
      localStorage.setItem('columnVisibility', JSON.stringify(newVisibility)); // Atualiza no localStorage
      return newVisibility;
    });
  };

  // Agora você pode usar a loadColumnVisibility ao inicializar o state
  const [columnVisibility, setColumnVisibility] = useState(loadColumnVisibility());

  const filteredUnits = units.filter((unit) =>
    Object.values(unit).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedUnit = filteredUnits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    { key: 'idUnit', label: 'ID Unit' },
    { key: 'typeProd', label: 'Type Prod' },
    { key: 'description', label: 'Description' },
  ];

  const [columnSearchTerm, setColumnSearchTerm] = useState('');

  const filteredColumns = columns.filter((col) =>
    col.label.toLowerCase().includes(columnSearchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);

  const sortedUnits = useMemo(() => {
    if (!paginatedUnit || !Array.isArray(paginatedUnit)) return [];

    const sorted = [...paginatedUnit].sort((a, b) => {
      if (!sortConfig.key) return 0;

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'DCriadoEm') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = aValue?.toString().toLowerCase();
        bValue = bValue?.toString().toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [paginatedUnit, sortConfig]);
  //  const handleAddProduct = async (e) => {
  //      e.preventDefault();

  //      if (!newProduct.product_name || !newProduct.quantity || !selectedSubfamily) {
  //        setError('Preencha o nome do produto e selecione uma Subfamilia.');
  //        return;
  //      }

  //      const productExists = products.some(
  //        (product) => product.product_name.toLowerCase() === newProduct.product_name.toLowerCase()

  //      );

  //      if (productExists) {
  //        setError('Este produto ja existe. Por favor, use um nome diferente.');
  //        return;
  //      }

  //      try {
  //        setIsLoading(true);

  //        const productData = {
  //          product_name: newProduct.product_name,
  //          quantity: newProduct.quantity,
  //          selectedSubfamily: selectedSubfamily, // Certifique-se de que a chave no backend espera esse nome
  //        };

  //        const createdProduct = await createProduct(productData);
  //        setProducts([...products, createdProduct]);

  //        // Limpa os campos após sucesso
  //        setNewProduct({ product_name: '' });
  //        setSelectedSubfamily('');
  //        setError(null);

  //        onAddModalClose();
  //      } catch (err) {
  //        setError(err.message);
  //      } finally {
  //        setIsLoading(false);
  //      }
  //    };

  //   const handleDeleteProduct = async () => {
  //     if (productToDelete) {
  //       setIsLoading(true);
  //       try {
  //         await deleteProduct(productToDelete);
  //         setProducts(products.filter((product) => product.id !== productToDelete));
  //         setProductToDelete(null);
  //         onDeleteModalClose();
  //       } catch (err) {
  //         setError(err.message);
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     }
  //   };



  //   const handleEditProduct = (product) => {
  //     setEditProduct({ ...product });
  //     onEditModalOpen();
  //   };

  //   const handleUpdateProduct = async (e) => {
  //       e.preventDefault();
  //       if (!editProduct || !editProduct.product_name) {
  //         setError('Preencha o nome do produto.');
  //         return;
  //       }

  //       try {
  //         console.log('Enviando para API:', { id: editProduct.id, product_name: editProduct.product_name });
  //         const updatedProduct = await updateProduct(editProduct.id, {
  //           product_name: editProduct.product_name,
  //           quantity: editProduct.quantity,
  //         });
  //         console.log('Resposta da API:', updatedProduct);
  //         setProducts(products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)));
  //         setEditProduct(null);
  //         setError(null); // Limpa o erro após sucesso
  //         onEditModalClose();
  //       } catch (err) {
  //         console.error('Erro ao atualizar produto:', err.message);
  //         console.log('Erro ao atualizar produto:', err.message);
  //         setError(err.message); // Define o erro para exibição no modal
  //       }
  //     };
  const handleEditUnits = (unit) => {
    setEditUnit({ ...unit });
    onEditModalOpen();
  };

  return (
    <div className="p-4">
      <div className="w-full">
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

      {/* button */}
      <Dropdown>
        <DropdownTrigger>
          <button
            onClick={onAddModalOpen}
            className="absolute top-4 right-25 bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded">
            < Plus size={25} />
          </button>
        </DropdownTrigger>

      </Dropdown>

      {/* button adjustments*/}
      <Dropdown>
        <DropdownTrigger>
          <button
            onClick={onSelectModalOpen}
            className="absolute top-4 right-10 bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded">
            <HiAdjustmentsHorizontal size={25} />
          </button>
        </DropdownTrigger>
      </Dropdown>

      {/* Modal para adjustments do grupo */}
      <Modal
        isOpen={isSelectModalOpen}
        onOpenChange={onSelectModalClose}
        size="sm"
        placement="center"
        className="w-100 bg-white shadow-xl rounded-lg"
        hideCloseButton={true}
      >

        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="rounded bg-[#FC9D25] flex justify-between items-center">
                <div className="text-xl font-bold text-white">Select Column</div>
                <Button
                  onClick={onClose}
                  className="text-white bg-transparent border-0 text-2xl p-0"
                  aria-label="Close"
                >
                  &times; {/* Unicode for "×" sign */}
                </Button>
              </ModalHeader>
              <ModalBody className="py-5 px-6">
                <div className="w-88">
                  {/* Campo de pesquisa  */}
                  <div className="mb-4 relative">
                    <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Pesquisar..."
                      value={columnSearchTerm}
                      onChange={(e) => setColumnSearchTerm(e.target.value)}
                      className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredColumns.map((col) => (
                    <div key={col.key} className="flex items-center rounded border border-black p-1">
                      <input
                        type="checkbox"
                        checked={columnVisibility[col.key]}
                        onChange={() => toggleColumn(col.key)}
                        className="mr-2"
                      />
                      <label className="text-sm">{col.label}</label>
                    </div>
                  ))}
                </div>
              </ModalBody>

              <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
                <Button
                  type="submit"
                  form="selectGroupForm"
                  className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                  disabled={isLoading}
                  onClick={() => {
                    saveColumnVisibility(); // Salvar as configurações
                    window.location.reload(); // Recarregar a página
                  }}
                >
                  {isLoading ? <Spinner size="sm" color="white" /> : 'Save'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para adicionar produto */}
      <Modal
        isOpen={isAddModalOpen}
        onOpenChange={onAddModalClose}
        size="md"
        placement="center"
        className="w-100 bg-white shadow-xl rounded-lg"
        hideCloseButton={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="rounded bg-[#FC9D25] flex justify-between items-center">
                <div className="text-xl font-bold text-white">New product</div>
                <Button
                  onClick={onClose}
                  className="text-white bg-transparent border-0 text-2xl p-0"
                  aria-label="Close"
                >
                  &times; {/* Unicode for "×" sign */}
                </Button>
              </ModalHeader>
              <ModalBody className="py-5 px-6">
                <form id="addProductForm" onSubmit={handleAddProduct} className="space-y-6">
                  <div>
                    <label htmlFor="abreviatura" className="block text-sm font-medium text-gray-400 mb-1">
                      Abreviatura
                    </label>
                    <input
                      id="newAbreviatura"
                      type="text"
                      name="abreviatura"

                      placeholder="Digite a abreviatura"
                      className="w-65 p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />

                    <button
                      onClick={() => setIsActive(!isActive)}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300  p-1.5 
                        ${isActive ? "bg-[#FC9D25]" : "bg-gray-300"}`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300
                          ${isActive ? "translate-x-6" : "translate-x-0"}`}
                      />
                    </button>
                    <span className="text-sm font-medium text-gray-400">
                      {isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div>
                    <label htmlFor="descricao" className="block text-sm font-medium text-gray-400 mb-1">
                      Descrição
                    </label>
                    <input
                      id="newDescricao"
                      type="text"
                      name="descricao"

                      placeholder="Digite a descricao"
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="CodProd" className="block text-sm font-medium text-gray-400 mb-1">
                      Codigo do produto
                    </label>
                    <input
                      id="newCodProd"
                      type="text"
                      name="codProd"
                      placeholder="Digite o Codigo do produto"
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                  </div>
                  {/* <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={ativo}
                      onChange={(e) => setAtivo(e.target.checked)}
                    />
                    {ativo ? "Ativo" : "Inativo"}
                  </label>
                </div> */}

                  <div>
                    <label htmlFor="Conta" className="block text-sm font-medium text-gray-400 mb-1">
                      Conta CBL/ERP
                    </label>
                    <input
                      id="newConta"
                      type="text"
                      name="conta"
                      placeholder="Digite a conta CBL/ERP"
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="Artigo" className="block text-sm font-medium text-gray-400 mb-1">
                      Tipo de Artigo
                    </label>
                    <input
                      id="newArtigo"
                      type="text"
                      name="Artigo"
                      placeholder="Digite o Tipo de artigo"
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <select
                      className="w-full p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                      value={selectedIva}
                      onChange={(e) => setSelectedIva(e.target.value)}
                    >
                      <option value="">Iva</option>
                      {ivaList.map((iva) => (
                        <option key={iva.id} value={iva.taxa}>
                          {iva.taxa}% - {iva.descricao}
                        </option>
                      ))}
                    </select>

                  </div>
                  <div>
                    <select
                      className="w-full p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                      value={selectedTipo}
                      onChange={(e) => setSelectedTipo(e.target.value)}
                    >
                      <option value="">Produto de</option>
                      {tipoOperacaoList.map((tipo) => (
                        <option key={tipo.id} value={tipo.tipo}>
                          {tipo.descricao}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              </ModalBody>
              <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
                <Button
                  type="submit"
                  form="addProductForm"
                  className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                  disabled={isLoading}
                  onClick={() => window.location.reload()} // Recarrega a página ao clicar
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
        hideCloseButton={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="rounded bg-[#FC9D25] flex justify-between items-center">
                <div className="text-xl font-bold text-white">Edit product</div>
                <Button
                  onClick={onClose}
                  className="text-white bg-transparent border-0 text-2xl p-0"
                  aria-label="Close"
                >
                  &times; {/* Unicode for "×" sign */}
                </Button>
              </ModalHeader>
              <ModalBody className="py-5 px-6">
                {editProduct && (
                  <form id="updateProductForm" onSubmit={handleUpdateProduct} className="space-y-6">
                    {/* <div>
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
                    className="w-60 p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                    required
                  />
                   <input
                      type="checkbox"
                      checked={ativo}
                      className="w-15 "
                      onChange={(e) => setAtivo(e.target.checked)}
                    />
                    {ativo ? "Ativo" : "Inativo"}
                </div>
                <div >
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
                </div> */}
                    <div>
                      <label htmlFor="abreviatura" className="block text-sm font-medium text-gray-400 mb-1">
                        Abbreviation
                      </label>
                      <input
                        id="newAbreviatura"
                        type="text"
                        name="abreviatura"

                        placeholder="Digite a abreviatura"
                        className="w-65 p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                        required
                      />

                      <button
                        onClick={() => setIsActive(!isActive)}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300  p-1.5 
                        ${isActive ? "bg-[#FC9D25]" : "bg-gray-300"}`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300
                          ${isActive ? "translate-x-6" : "translate-x-0"}`}
                        />
                      </button>
                      <span className="text-sm font-medium text-gray-400">
                        {isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <div>
                      <label htmlFor="descricao" className="block text-sm font-medium text-gray-400 mb-1">
                        Descrição
                      </label>
                      <input
                        id="newDescricao"
                        type="text"
                        name="descricao"

                        placeholder="Digite a descricao"
                        className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="CodProd" className="block text-sm font-medium text-gray-400 mb-1">
                        Cod Prod
                      </label>
                      <input
                        id="newCodProd"
                        type="text"
                        name="codProd"
                        placeholder="Digite o Codigo do produto"
                        className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                        required
                      />
                    </div>
                    {/* <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={ativo}
                      onChange={(e) => setAtivo(e.target.checked)}
                    />
                    {ativo ? "Ativo" : "Inativo"}
                  </label>
                </div> */}

                    <div>
                      <label htmlFor="Conta" className="block text-sm font-medium text-gray-400 mb-1">
                        CBL/ERP
                      </label>
                      <input
                        id="newConta"
                        type="text"
                        name="conta"
                        placeholder="Digite a conta CBL/ERP"
                        className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="Artigo" className="block text-sm font-medium text-gray-400 mb-1">
                        Artigo
                      </label>
                      <input
                        id="newArtigo"
                        type="text"
                        name="Artigo"
                        placeholder="Digite o Tipo de artigo"
                        className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                        required
                      />
                    </div>
                    <div>
                      <select
                        className="w-full p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={selectedIva}
                        onChange={(e) => setSelectedIva(e.target.value)}
                      >
                        <option value="">Iva</option>
                        {ivaList.map((iva) => (
                          <option key={iva.id} value={iva.taxa}>
                            {iva.taxa}% - {iva.descricao}
                          </option>
                        ))}
                      </select>

                    </div>
                    <div>
                      <select
                        className="w-full p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={selectedTipo}
                        onChange={(e) => setSelectedTipo(e.target.value)}
                      >
                        <option value="">Produto de</option>
                        {tipoOperacaoList.map((tipo) => (
                          <option key={tipo.id} value={tipo.tipo}>
                            {tipo.descricao}
                          </option>
                        ))}
                      </select>

                    </div>
                  </form>
                )}
              </ModalBody>
              <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
                <Button
                  type="submit"
                  form="updateProductForm"
                  className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                  onClick={() => window.location.reload()} // Recarrega a página ao clicar
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
        <table className="w-full bg-[#FAFAFA] border-collapse border border-[#EDEBEB] mx-auto">

          <thead>
            <tr>
              <th className="border-collapse border border-[#EDEBEB] !w-[1px] px-1 sm:px-5 py-2 bg-[#FC9D25]">
                <div className=" flex items-center justify-center">
                  <FaGear size={20} color='white' />
                </div>
              </th>
              {columnVisibility.idUnit && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-7 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">ID Unit</div>
                </th>
              )}
              {columnVisibility.typeProd && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-7 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Type Prod</div>
                </th>
              )}
              {columnVisibility.description && (
                <th onClick={() => handleSort('Descricao')} className="uppercase border-collapse border border-[#EDEBEB] w-400 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">
                    Description
                    {sortConfig.key === 'VDesc' && (
                      <span className="ml-auto">
                        {sortConfig.direction === 'asc' ? (
                          <ArrowUpIcon className="inline-block w-4 h-4 text-white" />
                        ) : (
                          <ArrowDownIcon className="inline-block w-4 h-4 text-white" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {sortedUnits.map((unit) => (
              <tr key={unit.Id_interno} className="hover:bg-gray-200">

                {/* Ações */}
                <td className="border border-[#EDEBEB] px-1 py-1 text-center">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered">
                        <HiDotsVertical size={18} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Dynamic Actions" placement="bottom-end" className="bg-white shadow-lg rounded-md p-1">
                      <DropdownItem key="edit" onPress={() => handleEditUnits(unit)}>
                        Edit
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </td>

                {/* Dados do Produto */}
                {columnVisibility.idUnit && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-right">{unit.Id_interno}</td>
                )}
                {columnVisibility.typeProd && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{unit.TipoProduto}</td>
                )}
                {columnVisibility.description && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{unit.Descricao}</td>
                )}
              </tr>
            ))}
          </tbody>

        </table>

        <div className="flex fixed bottom-0 left-0 items-center gap-2 w-full px-4 py-3 bg-gray-200 justify-end">
          <span className="px-2 py-1">Items per page</span>

          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border p-2 rounded px-2 py-1 w-16"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>

          {/* Agrupamento do controle de paginação */}
          <div className="flex items-center border rounded-lg overflow-hidden ml-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-0.5 ${currentPage === 1 ? 'bg-white text-black cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}
            >
              &lt;
            </button>

            <span className="px-3 py-0.5 bg-white">
              {currentPage}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-0.5 ${currentPage === totalPages ? 'bg-white text-black cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUnit;