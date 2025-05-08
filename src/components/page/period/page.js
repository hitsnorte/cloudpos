'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect, useMemo } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { FaMagnifyingGlass } from "react-icons/fa6";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { fetchPeriod, createPeriod } from '@/src/lib/apiperiod';
import axios from 'axios';

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

const DataPeriod = () => {
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedIva, setSelectedIva] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [isActive, setIsActive] = useState(false);

  const [periods, setPeriods] = useState([]);
  const [editPeriod, setEditPeriod] = useState(null);
  const [newPeriod, setNewPeriod] = useState({ period_name: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'Vdesc', direction: 'asc' });

  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

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
    loadPeriod();
  }, []);

  const loadPeriod = async () => {
    try {
      const periods = await fetchPeriod();

      // Mapeamos os produtos, adicionando a descrição da subfamília e da família correspondente
      const enrichedPeriods = periods.map(period => ({
        ...period,
      }));

      setPeriods(enrichedPeriods);
    } catch (err) {
      setError(err.message);
    }
  };

  const [propertyDetails, setPropertyDetails] = useState(null); // Estado para armazenar os dados da propriedade

  const fetchPropertyDetails = async () => {
    try {
      // Recuperando o selectedProperty do localStorage
      const selectedProperty = JSON.parse(localStorage.getItem('selectedProperty'));

      if (!selectedProperty) {
        console.log('No property selected');
        return;
      }

      // Fazendo a chamada para a API com o ID da propriedade
      const response = await axios.get(`/api/properties/${selectedProperty}`);

      // Armazenando os dados da propriedade
      setPropertyDetails(response.data.property);
      console.log('Property details:', response.data.property);
    } catch (error) {
      console.error('Error fetching property details:', error);
    }
  };

  useEffect(() => {
    fetchPropertyDetails();
  }, []);

  const loadColumnVisibility = () => {
    const savedVisibility = localStorage.getItem('columnVisibility');
    if (savedVisibility) {
      return JSON.parse(savedVisibility);
    }
    return {
      codPeriod: true, // estado padrão
      description: true,
      startDate: true,
      endDate: true,
      exploCenter: true,
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

  const filteredPeriods = periods.filter((period) =>
    Object.values(period).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const columns = [
    { key: 'codPeriod', label: 'Cod Period' },
    { key: 'description', label: 'Description' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End date' },
    { key: 'exploCenter', label: 'Exploration Center' },
  ];

  const [columnSearchTerm, setColumnSearchTerm] = useState('');

  const filteredColumns = columns.filter((col) =>
    col.label.toLowerCase().includes(columnSearchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPeriods.length / itemsPerPage);


  const paginatedPeriod = filteredPeriods.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditPeriod = (period) => {
    setEditPeriod({ ...period });
    onEditModalOpen();
  };

  const handleUpdatePeriod = (id, newDesc) => {
    setPeriods(prevPeriods => {
      return prevPeriods.map(period =>
        period.vcodi === id ? { ...period, Vdesc: newDesc } : period
      );
    });
    console.log(`Period ${id} atualizado para: ${newDesc}`);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPeriod((prev) => ({ ...prev, [name]: value }));
  };


  const handleAddPeriod = async (e) => {
    e.preventDefault();
    if (!newPeriod.period_name) {
      setError('Preencha o nome do period.');
      return;
    }

    const periodExists = periods.some(
      (period) => period.period_name.toLowerCase() === newPeriod.period_name.toLowerCase()
    );
    if (periodExists) {
      setError('Este classepreco já existe. Por favor, use um nome diferente.');
      return;
    }

    try {
      setIsLoading(true);
      const periodData = { period_name: newPeriod.period_name };
      const createdPeriod = await createPeriod(periodData);
      setPeriods([...periods, createdPeriod]);
      setNewPeriod({ period_name: '' });
      setError(null); // Limpa o erro após sucesso
      onAddModalClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedPeriod = useMemo(() => {
    if (!paginatedPeriod || !Array.isArray(paginatedPeriod)) return [];

    const sorted = [...paginatedPeriod].sort((a, b) => {
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
  }, [paginatedPeriod, sortConfig]);



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
                <div className="text-xl font-bold text-white">New Price classe</div>
                <Button
                  onClick={onClose}
                  className="text-white bg-transparent border-0 text-2xl p-0"
                  aria-label="Close"
                >
                  &times; {/* Unicode for "×" sign */}
                </Button>
              </ModalHeader>
              <ModalBody className="py-5 px-6">
                <form id="addClasseperiodForm" onSubmit={handleAddPeriod} className="space-y-6">
                  <div>
                    <label
                      htmlFor="newPeriodDescription"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Description
                    </label>
                    <input
                      id="newPeriodName"
                      type="text"
                      name="period_name"
                      value={newPeriod.period_name}
                      onChange={handleInputChange}
                      placeholder="Digite o nome da descriçao"
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                    {error && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>
                </form>
              </ModalBody>
              <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
                <Button
                  type="submit"
                  form="addPeriodForm"
                  className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                  disabled={isLoading}
                  onClick={() => window.location.reload()} // Recarrega a página ao clicar
                >
                  {isLoading ? <Spinner size="sm" color="white" /> : 'Save'}
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
                <div className="text-xl font-bold text-white">Edit Price Classe </div>
                <Button
                  onClick={onClose}
                  className="text-white bg-transparent border-0 text-2xl p-0"
                  aria-label="Close"
                >
                  &times; {/* Unicode for "×" sign */}
                </Button>
              </ModalHeader>
              <ModalBody className="py-5 px-6">
                {editPeriod && (
                  <form id="updatePeriodForm" onSubmit={handleUpdatePeriod} className="space-y-6">
                    <div>
                      <label htmlFor="periodDescription" className="block text-sm font-medium text-gray-400 mb-1">
                        Description
                      </label>
                      <input
                        id="periodDesc"
                        type="text"
                        value={editPeriod ? editPeriod.Vdesc : ''}
                        onChange={(e) =>
                          setEditPeriod({ ...editPeriod, Vdesc: e.target.value })
                        }
                        placeholder="Digite a nova descrição"
                        className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                        required
                      />
                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                      )}
                    </div>
                  </form>
                )}
              </ModalBody>
              <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
                <Button
                  type="submit"
                  form="updatePeriodForm"
                  className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                  onClick={() => handleUpdatePeriod(editPeriod.vcodi, editPeriod.Vdesc)}
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
              {columnVisibility.codPeriod && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-7 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Cod Period</div>
                </th>
              )}
              {columnVisibility.description && (
                <th onClick={() => handleSort('Vdesc')} className="uppercase border-collapse border border-[#EDEBEB] w-100 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
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
              {columnVisibility.startDate && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-7 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Start Date</div>
                </th>
              )}
              {columnVisibility.endDate && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-7 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">End Date</div>
                </th>
              )}
              {columnVisibility.exploCenter && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-50 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Exploration Center</div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {sortedPeriod.map((period) => (
              <tr key={period.vcodi} className="hover:bg-gray-200">

                {/* Ações */}
                <td className="border border-[#EDEBEB] px-1 py-1 text-center">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered">
                        <HiDotsVertical size={18} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Dynamic Actions" placement="bottom-end" className="bg-white shadow-lg rounded-md p-1">
                      <DropdownItem key="edit" onPress={() => handleEditPeriod(period)}>
                        Edit
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </td>

                {/* Dados do Produto */}
                {columnVisibility.codPeriod && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-right">{period.vcodi}</td>
                )}
                {columnVisibility.description && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{period.Vdesc}</td>
                )}
                {columnVisibility.startDate && (
                  <td className="border border-[#EDEBEB] px-4 py-2 text-right">
                    {new Date(period.DDataIni).toLocaleDateString('pt-PT')}
                  </td>
                )}
                {columnVisibility.endDate && (
                  <td className="border border-[#EDEBEB] px-4 py-2 text-right">
                    {new Date(period.DDataFim).toLocaleDateString('pt-PT')}
                  </td>
                )}
                {/* Exibindo o propertyName no campo "Exploration center" */}
                {columnVisibility.exploCenter && (
                  <td className="border border-[#EDEBEB] px-4 py-2 text-left">
                    {propertyDetails ? propertyDetails.propertyName : 'Loading...'}
                  </td>
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

export default DataPeriod;