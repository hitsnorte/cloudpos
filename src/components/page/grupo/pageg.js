'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { fetchGrup, createGrup, deleteGrup, updateGrupt } from '@/src/lib/apigrup';
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

  const filteredGroups = groups.filter((group) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      group.id.toString().includes(searchLower) ||
      group.group_name.toString().toLowerCase().includes(searchLower)
    );
  });

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
      setError(err.message); // Define o erro para exibição no modal
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Campo de pesquisa */}
      <div className="mb-4 flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por ID ou Nome do Grupo..."
          className="w-full max-w-md p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Modal para adicionar grupo */}
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
                <h3 className="text-lg font-semibold text-gray-900">Adicionar Novo Grupo</h3>
              </ModalHeader>
              <ModalBody className="py-6 px-8">
                <form id="addGroupForm" onSubmit={handleAddGroup} className="space-y-6">
                  <div>
                    <label
                      htmlFor="newGroupName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nome do Grupo
                    </label>
                    <input
                      id="newGroupName"
                      type="text"
                      name="group_name"
                      value={newGroup.group_name}
                      onChange={handleInputChange}
                      placeholder="Digite o nome do grupo"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      required
                    />
                    {error && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>
                </form>
              </ModalBody>
              <ModalFooter className="flex justify-end border-t border-gray-200 pt-4 px-8">
                <Button
                  type="submit"
                  form="addGroupForm"
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

      {/* Modal para editar grupo */}
      <Modal
  isOpen={isEditModalOpen}
  onOpenChange={onEditModalClose}
  size="md"
  placement="center"
  className="bg-white shadow-xl rounded-lg"
>
  <ModalContent>
    {(onClose) => (
      <>
        <ModalHeader className="flex justify-center items-center border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Editar Grupo</h3>
        </ModalHeader>
        <ModalBody className="py-6 px-8">
          {editGroup && (
            <form id="updateGroupForm" onSubmit={handleUpdateGroup} className="space-y-6">
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Grupo
                </label>
                <input
                  id="groupName"
                  type="text"
                  value={editGroup.group_name || ''} // Garante que não seja undefined
                  onChange={(e) =>
                    setEditGroup({ ...editGroup, group_name: e.target.value })
                  }
                  placeholder="Digite o nome do grupo"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200"
                  required
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
            </form>
          )}
        </ModalBody>
        <ModalFooter className="flex justify-end border-t border-gray-200 pt-4 px-8">
          <Button
            type="submit"
            form="updateGroupForm"
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
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
              </ModalHeader>
              <ModalBody className="py-6 px-8">
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <Spinner size="lg" />
                    <span className="ml-2">Excluindo...</span>
                  </div>
                ) : (
                  <p className="text-center text-gray-700">Tem certeza que deseja excluir o grupo?</p>
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
                  Excluir
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Tabela */}
      <div className="overflow-x-auto sm:flex sm:flex-col bg-muted/40">
        <table className="min-w-full bg-white border border-gray-200 mx-auto">
          <thead className="bg-gray-200">
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
                onClick={() => handleSort('group_name')}
              >
                <div className="flex items-center justify-center">
                  Nome do Grupo
                  {renderSortIcon('group_name')}
                </div>
              </th>
              <th className="px-2 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
             
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredGroups.map((group) => (
              <tr key={group.id} className="hover:bg-gray-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {group.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {group.group_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
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
                      <DropdownItem
                        key="delete"
                        className="text-danger hover:bg-red-50"
                        color="danger"
                        onPress={() => {
                          setGroupToDelete(group.id);
                          onDeleteModalOpen();
                        }}
                      >
                        Excluir
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredGroups.length === 0 && !error && (
        <p className="text-center py-4">Nenhum grupo encontrado.</p>
      )}
    </div>
  );
};

export default DataGrupo;