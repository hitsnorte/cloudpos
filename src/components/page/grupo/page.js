'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect, useMemo } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { FaMagnifyingGlass } from "react-icons/fa6";
import { fetchGrup, createGrup, deleteGrup, updateGrupt } from '@/src/lib/apigroup';
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

const DataGrupo = () => {
  const [groups, setGroups] = useState([]);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newGroup, setNewGroup] = useState({ group_name: '' });
  const [editGroup, setEditGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  
  const [columnsearchTerm, setColumnSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({ key: 'VDesc', direction: 'asc' });
  const [columns, setColumns] = useState([]);  // Para armazenar as colunas dinâmicas
  const [columnVisibility, setColumnVisibility] = useState({});

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
    const savedVisibility = loadColumnVisibility();
    setColumnVisibility(savedVisibility); // Carregar visibilidade das colunas
  }, []);

  const toggleColumnVisibility = (columnKey) => {
    setColumnVisibility((prevState) => {
      const updatedVisibility = { ...prevState, [columnKey]: !prevState[columnKey] };
      localStorage.setItem('columnVisibility', JSON.stringify(updatedVisibility)); // Salva no localStorage
      return updatedVisibility;
    });
  };

  const loadColumnVisibility = () => {
    const savedVisibility = localStorage.getItem('columnVisibility');
    if (savedVisibility) {
      return JSON.parse(savedVisibility);
    }
    return {
      codGrp: true, // estado padrão
      description: true,
      createdIn: true,
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

  const filteredGroups = groups.filter((group) =>
    group.VDesc && group.VDesc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const sortedGroups = useMemo(() => {
    if (!paginatedGroups || !Array.isArray(paginatedGroups)) return [];
  
    const sorted = [...paginatedGroups].sort((a, b) => {
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
  }, [paginatedGroups, sortConfig]);
  

  

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const grupos = await fetchGrup();
      console.log("grupos", grupos);
  
      setGroups(grupos);
  
      // Mapeamento das chaves para nomes mais amigáveis
      const columnNames = {
        VCodGrFam: 'cod Grp',
        VDesc: 'Description',
        DCriadoEm: 'created in',
        // Adicione mais chaves e seus nomes aqui conforme necessário
      };
  
      // Gerar as colunas dinamicamente com base no mapeamento
      const dynamicColumns = Object.keys(grupos[0] || {}).map((key) => {
        return {
          key, 
          label: columnNames[key] || key, // Usa o nome do mapeamento se existir, caso contrário, usa a chave original
        };
      });
  
      setColumns(dynamicColumns); // Definir as colunas dinâmicas
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

  
  const filteredColumns = columns.filter((col) =>
    col.label.toLowerCase().includes(columnsearchTerm.toLowerCase())
  );


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGroup((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.group_name) {
      setError('Preencha o nome do grupo.');
      return;
    }

    const groupExists = groups.some(
      (group) => group.group_name.toLowerCase() === newGroup.group_name.toLowerCase()
    );
    if (groupExists) {
      setError('Este grupo já existe. Por favor, use um nome diferente.');
      return;
    }

    try {
      setIsLoading(true);
      const groupData = { group_name: newGroup.group_name };
      const createdGroup = await createGrup(groupData);
      setGroups([...groups, createdGroup]);
      setNewGroup({ group_name: '' });
      setError(null); // Limpa o erro após sucesso
      onAddModalClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (groupToDelete) {
      setIsLoading(true);
      try {
        await deleteGrup(groupToDelete);
        setGroups(groups.filter((group) => group.id !== groupToDelete));
        setGroupToDelete(null);
        onDeleteModalClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditGroup = (group) => {
    setEditGroup({ ...group });
    onEditModalOpen();
  };

  const handleUpdateGroup = (id, newDesc) => {
    setGroups(prevGroups => {
        return prevGroups.map(group =>
            group.VCodGrFam === id ? { ...group, VDesc: newDesc } : group
        );
    });
    console.log(`Grupo ${id} atualizado para: ${newDesc}`);
};



  return (
    <div className="p-4">
      <div className="w-1/3">
        {/* Campo de pesquisa */}
        <div className="mb-4 relative">
        <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Pesquisar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
    </div>

      {/* button add*/}
      <Dropdown>
      <DropdownTrigger>
      <button 
          onClick={onAddModalOpen}
          className="absolute top-4 right-25 bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded">
          < Plus size={25}  />     
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
    {/* Campo de pesquisa */}
    <div className="mb-4 relative">
      <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        placeholder="Pesquisar..."
        value={columnsearchTerm}
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
          checked={columnVisibility[col.key] ?? true} // Se não definido, assume true
          onChange={() => {
            toggleColumnVisibility(col.key); // Aqui está a chamada correta para toggleColumnVisibility
          }}
          className="mr-2"
        />
        <label className="text-sm">{col.label}</label>
      </div>
    ))}
  </div>
</ModalBody>

        <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
              
            </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para adicionar grupo */} 
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
              <div className="text-xl font-bold text-white">New Group</div>
              <Button
                onClick={onClose}
                className="text-white bg-transparent border-0 text-2xl p-0"
                aria-label="Close"
              >
                &times; {/* Unicode for "×" sign */}
              </Button>
            </ModalHeader>
            <ModalBody className="py-5 px-6">
              <form id="addGroupForm" onSubmit={handleAddGroup} className="space-y-6">
                <div>
                  <label
                    htmlFor="newGroupDescription"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Description
                  </label>
                  <input
                    id="newGroupName"
                    type="text"
                    name="group_name"
                    value={newGroup.group_name}
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
                form="addGroupForm"
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
                <h3 className="text-xl flex justify-left items-left font-bold text-white">Edit group</h3>
                <Button
                  onClick={onClose}
                  className="text-white bg-transparent border-0 text-2xl p-0"
                  aria-label="Close"
                >
                  &times; {/* Unicode for "×" sign */}
                </Button>
              </ModalHeader>
              <ModalBody className="py-5 px-6">
                {editGroup && (
                  <form id="updateGroupForm" onSubmit={handleUpdateGroup} className="space-y-6">
                    <div>
                      <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-400 mb-1">
                        Description
                      </label>
                      <input
                        id="groupDesc"
                        type="text"
                        value={editGroup ? editGroup.VDesc : ''}
                        onChange={(e) =>
                          setEditGroup({ ...editGroup, VDesc: e.target.value })
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
                form="updateGroupForm"
                className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                onClick={() => handleUpdateGroup(editGroup.VCodGrFam, editGroup.VDesc)}
              >
                Save
              </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para excluir grupo */}
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
                    <span className="ml-2">Excluding...</span>
                  </div>
                ) : (
                  <p className="text-center text-gray-700">Are u sure u want to exclude the Group?</p>
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
                    handleDeleteGroup(groupToDelete);
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
        
      <table className="min-w-full bg-[#FAFAFA] border-collapse border border-[#EDEBEB] mx-auto">
      <thead>
        <tr>
          <th className="border-collapse border border-[#EDEBEB] !w-[1px] px-1 sm:px-5 py-2 bg-[#FC9D25]">
            <div className="flex items-center justify-center">
              <FaGear size={20} color="white" />
            </div>
          </th>

          {/* Renderiza as colunas dinamicamente com base na visibilidade */}
          {columns.map((col) =>
          columnVisibility[col.key] !== false && (  // Verifica se a coluna está visível
            <th 
              key={col.key} 
              className={`uppercase border-collapse border border-[#EDEBEB] sm:px-4 py-4 bg-[#FC9D25] text-[#FAFAFA] text-sm ${col.key === "VCodGrFam" ? "w-[50px] text-right" : ""}`}
            >
              <div className="flex items-right justify-right">{col.label}</div>
            </th>
          )
        )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-300">
        {/* Mudei para filteredGroups ao invés de groups */}
        {filteredGroups.map((group) => (
          <tr key={group.VCodGrFam} className="hover:bg-gray-200">
            {/* Ações */}
            <td className="border border-[#EDEBEB] px-1 py-1 text-center">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered">
                    <HiDotsVertical size={18} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Dynamic Actions" placement="bottom-end" className="bg-white shadow-lg rounded-md p-1">
                  <DropdownItem key="edit" onPress={() => handleEditGroup(group)}>
                    Edit
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </td>

            {/* Renderiza os dados das colunas de acordo com a visibilidade */}
            {columns.map((col) =>
            columnVisibility[col.key] !== false && (  // Verifica se a coluna está visível
              <td key={col.key} className="border border-[#EDEBEB] px-3 py-2 text-left">
                {/* Verifica se a chave é DCriadoEm, que é a data */}
                {col.key === "DCriadoEm" ? (
                  // Converte a data para apenas a data (sem a hora)
                  new Date(group[col.key]).toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' })
                ) : (
                  group[col.key]  // Exibe normalmente outros dados
                )}
              </td>
              
            )
            
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

export default DataGrupo;