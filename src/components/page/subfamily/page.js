'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect, useMemo } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { Plus } from "lucide-react";
import { FaGear } from "react-icons/fa6";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { fetchSubfamily, createSubfamily, deleteSubfamily, updateSubfamily } from '@/src/lib/apisubfamily';
import { fetchFamily } from '@/src/lib/apifamily';
import { fetchGrup } from '@/src/lib/apigroup';

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

const DataSubfamilia = () => {
  const [subfamilias, setSubfamilias] = useState([]);
  const [families, setFamilies] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSubfamilia, setNewSubfamilia] = useState({ nome: '' });
  const [editSubfamilia, setEditSubfamilia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subfamiliaToDelete, setSubfamiliaToDelete] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState("");

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
    loadSubfamilias();
    loadFamilies();
  }, []);

  const loadColumnVisibility = () => {
    const savedVisibility = localStorage.getItem('columnVisibility');
    if (savedVisibility) {
      return JSON.parse(savedVisibility);
    }
    return {
      codSubFam: true, // estado padrão
      description: true,
      createdIn: true,
      madeby: true,
      codFam: true,
      descFam: true,
      codGrpFam: true,
      descGrp: true,
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

  const filteredSubfamilias = subfamilias.filter((subfamilia) =>
    Object.values(subfamilia).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const columns = [
    { key: 'codSubFam', label: 'Cod Sub Fam' },
    { key: 'description', label: 'Description' },
    { key: 'createdIn', label: 'Created In' },
    { key: 'madeby', label: 'Made By' },
    { key: 'codFam', label: 'Cod Fam' },
    { key: 'descFam', label: 'Desc Fam' },
    { key: 'codGrpFam', label: 'Cod Grp' },
    { key: 'descGrp', label: 'Desc Grp' },
  ];

  const [columnSearchTerm, setColumnSearchTerm] = useState('');

  const filteredColumns = columns.filter((col) =>
    col.label.toLowerCase().includes(columnSearchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubfamilias.length / itemsPerPage);

  const paginatedSubfamilias = filteredSubfamilias.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const sortedFamilies = useMemo(() => {
    if (!paginatedSubfamilias || !Array.isArray(paginatedSubfamilias)) return [];

    const sorted = [...paginatedSubfamilias].sort((a, b) => {
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
  }, [paginatedSubfamilias, sortConfig]);

  const loadSubfamilias = async () => {
    try {
      const subfamilias = await fetchSubfamily();
      const familyMap = await fetchFamilyMap();
      const groupMap = await fetchGroupMap();

      // Mapeamos os produtos, adicionando a descrição da subfamília e da família correspondente
      const enrichedSubfamilias = subfamilias.map(subfamilia => ({
        ...subfamilia,
        VDescFamily: familyMap[subfamilia.VCodFam] || "N/A", // Se não houver correspondência, coloca "N/A"
        VDescGroup: groupMap[subfamilia.VCodGrfam] || "N/A", // Se não houver correspondência, coloca "N/A"
      }));

      setSubfamilias(enrichedSubfamilias);
    } catch (err) {
      setError(err.message);
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

  const loadFamilies = async () => {
    try {
      const families = await fetchFamily();
      setFamilies(families);
    } catch (err) {
      setError(err.message);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubfamilia((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubfamilia = async (e) => {
    e.preventDefault();

    if (!newSubfamilia.nome || !selectedFamily) {
      setError('Preencha o nome da Sub família e selecione uma familia.');
      return;
    }

    const subfamiliaExists = subfamilias.some(
      (subfamilia) => subfamilia.nome.toLowerCase() === newSubfamilia.nome.toLowerCase()
    );

    if (subfamiliaExists) {
      setError('Esta sub família já existe. Por favor, use um nome diferente.');
      return;
    }

    try {
      setIsLoading(true);

      const subfamiliaData = {
        nome: newSubfamilia.nome,
        selectedFamily: selectedFamily, // Certifique-se de que a chave no backend espera esse nome
      };

      const createdSubfamilia = await createSubfamily(subfamiliaData);
      setSubfamilias([...subfamilias, createdSubfamilia]);

      // Limpa os campos após sucesso
      setNewSubfamilia({ nome: '' });
      setSelectedFamily('');
      setError(null);

      onAddModalClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubfamilia = async () => {
    if (subfamiliaToDelete) {
      setIsLoading(true);
      try {
        await deleteSubfamily(subfamiliaToDelete);
        setSubfamilias(subfamilias.filter((subfamilia) => subfamilia.id !== subfamiliaToDelete));
        setSubfamiliaToDelete(null);
        onDeleteModalClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditSubfamilia = (subfamilia) => {
    setEditSubfamilia({ ...subfamilia });
    onEditModalOpen();
  };

  const handleUpdateSubfamilia = async (e) => {
    e.preventDefault();
    if (!editSubfamilia || !editSubfamilia.nome) {
      setError('Preencha o nome da subfamilia.');
      return;
    }

    try {
      console.log('Enviando para API:', { id: editSubfamilia.id, nome: editSubfamilia.nome });
      const updatedSubfamilia = await updateSubfamily(editSubfamilia.id, {
        nome: editSubfamilia.nome,
      });
      console.log('Resposta da API:', updatedSubfamilia);
      setSubfamilias(subfamilias.map((subfamilia) => (subfamilia.id === updatedSubfamilia.id ? updatedSubfamilia : subfamilia)));
      setEditSubfamilia(null);
      setError(null); // Limpa o erro após sucesso
      onEditModalClose();
    } catch (err) {
      console.error('Erro ao atualizar a sub familia:', err.message);
      console.log('Erro ao atualizar sub familia:', err.message);
      setError(err.message); // Define o erro para exibição no modal
    }
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="p-4 pb-10">

      <div className="w-full">
        {/* Campo de pesquisa */}
        <div className="mb-4 relative">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full  pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
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

      {/* Modal para adicionar subfamilia */}
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
                <div className="text-xl font-bold text-white">New Sub Family</div>
                <Button
                  onClick={onClose}
                  className="text-white bg-transparent border-0 text-2xl p-0"
                  aria-label="Close"
                >
                  &times; {/* Unicode for "×" sign */}
                </Button>
              </ModalHeader>
              <ModalBody className="py-5 px-6">
                <form id="addSubfamiliaForm" onSubmit={handleAddSubfamilia} className="space-y-6">


                  <div>
                    <label
                      htmlFor="newSubfamiliaName"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Name
                    </label>
                    <input
                      id="newSubfamiliaName"
                      type="text"
                      name="nome"
                      value={newSubfamilia.nome}
                      onChange={handleInputChange}
                      placeholder="Digite o nome da sub familia"
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                    {error && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="selectFamily" className="block text-sm font-medium text-gray-400 mb-1">
                      Select a Family
                    </label>
                    <select
                      id="selectFamily"
                      value={selectedFamily}
                      onChange={(e) => setSelectedFamily(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-[#FC9D25]"
                    >
                      <option value="">Select...</option>
                      {families.map((family) => (
                        <option key={family.id} value={family.id}>
                          {family.family_name}
                        </option>
                      ))}
                    </select>
                  </div>

                </form>
              </ModalBody>
              <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
                <Button
                  type="submit"
                  form="addSubfamiliaForm"
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

      {/* Modal para editar grupo */}
      <Modal
        isOpen={isEditModalOpen}
        onOpenChange={onEditModalClose}
        size="md"
        placement="center"
        className="w-100 bg-white shadow-xl rounded-lg"
        hideCloseButton={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="rounded bg-[#FC9D25] flex justify-between items-center">
                <h3 className="text-xl flex justify-left items-left font-bold text-white">Edit Subfamily</h3>
                <Button
                  onClick={onClose}
                  className="text-white bg-transparent border-0 text-2xl p-0"
                  aria-label="Close"
                >
                  &times; {/* Unicode for "×" sign */}
                </Button>
              </ModalHeader>
              <ModalBody className="py-5 px-6">
                {editSubfamilia && (
                  <form id="updateSubfamiliaForm" onSubmit={handleUpdateSubfamilia} className="space-y-6">
                    <div>
                      <label htmlFor="subfamiliaDescription" className="block text-sm font-medium text-gray-400 mb-1">
                        Description
                      </label>
                      <input
                        id="subfamiliaVDesc"
                        type="text"
                        value={editSubfamilia ? editSubfamilia.VDesc : ''}// Garante que não seja undefined
                        onChange={(e) =>
                          setEditSubfamilia({ ...editSubfamilia, VDesc: e.target.value })
                        }
                        placeholder="Digite a descriçao da sub familia"
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
                  form="updateSubfamiliaForm"
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

      {/* Modal para excluir sub familia */}
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
                  <p className="text-center text-gray-700">Are you sure you want to delete the sub family?</p>
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
                    handleDeleteSubfamilia(subfamiliaToDelete);
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

      {/* Tabela */}
      <div className="overflow-x-auto sm:flex sm:flex-col bg-muted/40">
        <table className="w-450 bg-[#FAFAFA] border-collapse border border-[#EDEBEB] mx-auto">
          <thead>
            <tr>
              <th className="border-collapse border border-[#EDEBEB] !w-[2px] px-1 sm:px-5 py-3 bg-[#FC9D25]">
                <div className=" flex items-center justify-center">
                  <FaGear size={20} color='white' />
                </div>
              </th>
              {columnVisibility.codSubFam && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-30 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">CodSubFam</div>
                </th>
              )}
              {columnVisibility.description && (
                <th onClick={() => handleSort('VDesc')} className="uppercase border-collapse border border-[#EDEBEB] w-400 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
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
              {columnVisibility.createdIn && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-20 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Created In</div>
                </th>
              )}
              {columnVisibility.madeby && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-20 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Made By</div>
                </th>
              )}
              {columnVisibility.codFam && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-10 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Cod Fam</div>
                </th>
              )}
              {columnVisibility.descFam && (
                <th onClick={() => handleSort('VDescFamily')} className="uppercase border-collapse border border-[#EDEBEB] w-400 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">
                    Desc Fam
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
              {columnVisibility.codGrpFam && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-10 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Cod Grp</div>
                </th>
              )}
              {columnVisibility.descGrp && (
                <th onClick={() => handleSort('VDescGroup')} className="uppercase border-collapse border border-[#EDEBEB] w-400 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">
                    Desc Grp
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
            {sortedFamilies.map((subfamilia) => (
              <tr key={subfamilia.VCodSubFam} className="hover:bg-gray-200">
                {/* Ações */}
                <td className="border border-[#EDEBEB] px-1 py-1 text-center">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered">
                        <HiDotsVertical size={18} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Dynamic Actions" placement="bottom-end" className="bg-white shadow-lg rounded-md p-1">
                      <DropdownItem key="edit" onPress={() => handleEditSubfamilia(subfamilia)}>
                        Edit
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </td>

                {/* Dados do Produto */}
                {columnVisibility.codSubFam && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-right">{subfamilia.VCodSubFam}</td>
                )}
                {columnVisibility.description && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{subfamilia.VDesc}</td>
                )}
                {columnVisibility.createdIn && (
                  <td className="border border-[#EDEBEB] px-4 py-2 text-right">
                    {new Date(subfamilia.dcriadoem).toLocaleDateString('pt-BR')}
                  </td>
                )}
                {columnVisibility.madeby && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{subfamilia.vcriadopor}</td>
                )}

                {columnVisibility.codFam && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-right">{subfamilia.VCodFam}</td>
                )}
                {columnVisibility.descFam && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{subfamilia.VDescFamily}</td>
                )}
                {columnVisibility.codGrpFam && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-right">{subfamilia.VCodGrfam}</td>
                )}
                {columnVisibility.descGrp && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{subfamilia.VDescGroup}</td>
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

export default DataSubfamilia;