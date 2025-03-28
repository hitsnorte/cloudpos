'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
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

const DataGrupo = () => {
  const [groups, setGroups] = useState([]);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newGroup, setNewGroup] = useState({ group_name: '' });
  const [editGroup, setEditGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

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
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const grupos = await fetchGrup();
      setGroups(grupos);
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
    const sortedGroups = [...groups].sort((a, b) => {
      if (field === 'id') {
        return sortOrder === 'asc' ? a[field] - b[field] : b[field] - a[field];
      }
      return sortOrder === 'asc'
        ? a[field].localeCompare(b[field])
        : b[field].localeCompare(a[field]);
    });
    setGroups(sortedGroups);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 ml-1" />
    );
  };

  // const filteredGroups = groups.filter((group) => {
  //   const searchLower = searchTerm.toLowerCase();
  //   return (
  //     group.id.toString().includes(searchLower) ||
  //     group.group_name.toString().toLowerCase().includes(searchLower)
  //   );
  // });

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

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!editGroup || !editGroup.group_name) {
      setError('Preencha o nome do grupo.');
      return;
    }
  
    try {
      console.log('Enviando para API:', { id: editGroup.id, group_name: editGroup.group_name });
      const updatedGroup = await updateGrupt(editGroup.id, {
        group_name: editGroup.group_name,
      });
      console.log('Resposta da API:', updatedGroup);
      setGroups(groups.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)));
      setEditGroup(null);
      setError(null); // Limpa o erro após sucesso
      onEditModalClose();
    } catch (err) {
      console.error('Erro ao atualizar grupo:', err.message);
      console.log('Erro ao atualizar grupo:', err.message);
      setError(err.message); // Define o erro para exibição no modal
    }
  };


  return (
    <div className="p-4">
      {/* button */}
      <Dropdown>
      <DropdownTrigger>
      <button 
          onClick={onAddModalOpen}
          className="absolute top-4 right-10 bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded">
          < Plus size={25}  />     
      </button>
      </DropdownTrigger>
      </Dropdown>
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
                    htmlFor="newGroupName"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Name
                  </label>
                  <input
                    id="newGroupName"
                    type="text"
                    name="group_name"
                    value={newGroup.group_name}
                    onChange={handleInputChange}
                    placeholder="Digite o nome do grupo"
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
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="rounded bg-[#FC9D25] flex justify-left items-left">
                <h3 className="text-xl flex justify-left items-left font-bold text-white">Edit group</h3>
              </ModalHeader>
              <ModalBody className="py-5 px-6">
                {editGroup && (
                  <form id="updateGroupForm" onSubmit={handleUpdateGroup} className="space-y-6">
                    <div>
                      <label htmlFor="groupName" className="block text-sm font-medium text-gray-400 mb-1">
                        Name
                      </label>
                      <input
                        id="groupName"
                        type="text"
                        value={editGroup.group_name || ''} // Garante que não seja undefined
                        onChange={(e) =>
                          setEditGroup({ ...editGroup, group_name: e.target.value })
                        }
                        placeholder="Digite o nome do grupo"
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
                  onClick={() => window.location.reload()} // Recarrega a página ao clicar
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
                <div className=" flex items-center justify-center">
                  <FaGear size={20} color='white'/>
                </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-10 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                <div className=" flex items-center justify-center"> 
                  Cod Grp
                </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-170 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className="flex items-center justify-center "> 
                  Descrição
              </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-30 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className="flex items-center justify-center "> 
                  Criado Em
              </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-10 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className="flex items-center justify-center "> 
                  ID Grp Conta
              </div>
              </th>
            </tr>
          </thead>
           <tbody className="divide-y divide-gray-300">
                    {groups.map((group) => (
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
                              <DropdownItem key="edit" onPress={() => alert(`Editando ${group.VDesc}`)}>Editar</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </td>
                        
                        {/* Dados do Produto */}
                        <td className="border border-[#EDEBEB] px-3 py-2 text-right">{group.VCodGrFam}</td>
                        <td className="border border-[#EDEBEB] px-4 py-2 text-left">{group.VDesc}</td>
                        <td className="border border-[#EDEBEB] px-4 py-2 text-right">
                          {new Date(group.DCriadoEm).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="border border-[#EDEBEB] px-4 py-2 text-right">
                          {group.ID_GrupoConta === -1 ? "" : group.ID_GrupoConta}
                      </td>
                      </tr>
                    ))}
                  </tbody>
        </table>
      </div>
      {groups.length === 0 && !error && (
        <p className="text-center py-4">No groups found.</p>
      )}
    </div>
  );
};

export default DataGrupo;