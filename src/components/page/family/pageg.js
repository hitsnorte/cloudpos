'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { fetchGrup, createGrup, deleteGrup, updateGrupt } from '@/src/lib/apifamily';
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

const DataFamily = () => {
  const [families, setFamilies] = useState([]);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newFamily, setNewFamily] = useState({ family_name: '' });
  const [editFamily, setEditFamily] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState(null);

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
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      const families = await fetchGrup();
      setFamilies(families);
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
    const sortedFamilies = [...families].sort((a, b) => {
      if (field === 'id') {
        return sortOrder === 'asc' ? a[field] - b[field] : b[field] - a[field];
      }
      return sortOrder === 'asc'
        ? a[field].localeCompare(b[field])
        : b[field].localeCompare(a[field]);
    });
    setFamilies(sortedFamilies);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 ml-1" />
    );
  };

  const filteredFamilies = families.filter((family) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      family.id.toString().includes(searchLower) ||
      family.family_name.toString().toLowerCase().includes(searchLower)
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFamily((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFamily = async (e) => {
    e.preventDefault();
    if (!newFamily.family_name) {
      setError('Preencha o nome da familia.');
      return;
    }

    const familyExists = families.some(
      (family) => family.family_name.toLowerCase() === newFamily.family_name.toLowerCase()
    );
    if (familyExists) {
      setError('Esta familia já existe. Por favor, use um nome diferente.');
      return;
    }

    try {
      setIsLoading(true);
      const familyData = { family_name: newFamily.family_name };
      const createdFamily = await createGrup(familyData);
      setFamilies([...families, createdFamily]);
      setNewFamily({ family_name: '' });
      setError(null); // Limpa o erro após sucesso
      onAddModalClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFamily = async () => {
    if (familyToDelete) {
      setIsLoading(true);
      try {
        await deleteGrup(familyToDelete);
        setFamilies(families.filter((family) => family.id !== familyToDelete));
        setFamilyToDelete(null);
        onDeleteModalClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditFamily = (family) => {
    setEditFamily({ ...family });
    onEditModalOpen();
  };

  const handleUpdateFamily = async (e) => {
    e.preventDefault();
    if (!editFamily || !editFamily.family_name) {
      setError('Preencha o nome da familia.');
      return;
    }
  
    try {
      console.log('Enviando para API:', { id: editFamily.id, family_name: editFamily.family_name });
      const updatedFamily = await updateGrupt(editFamily.id, {
        family_name: editFamily.family_name,
      });
      console.log('Resposta da API:', updatedFamily);
      setFamilies(families.map((family) => (family.id === updatedFamily.id ? updatedFamily : family)));
      setEditFamily(null);
      setError(null); // Limpa o erro após sucesso
      onEditModalClose();
    } catch (err) {
      console.error('Erro ao atualizar a familia:', err.message);
      setError(err.message); // Define o erro para exibição no modal
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Campo de pesquisa 
      <div className="mb-4 flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por ID ou Nome do Grupo..."
          className="w-full max-w-md p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>*/}

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
                <form id="addFamilyForm" onSubmit={handleAddFamily} className="space-y-6">
                  <div>
                    <label
                      htmlFor="newFamilyName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nome da familia
                    </label>
                    <input
                      id="newFamilyName"
                      type="text"
                      name="family_name"
                      value={newFamily.family_name}
                      onChange={handleInputChange}
                      placeholder="Digite o nome da familia"
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
                  form="addFamilyForm"
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
          <h3 className="text-lg font-semibold text-gray-900">Editar familia</h3>
        </ModalHeader>
        <ModalBody className="py-6 px-8">
          {editFamily && (
            <form id="updateFamilyForm" onSubmit={handleUpdateFamily} className="space-y-6">
              <div>
                <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da familia
                </label>
                <input
                  id="familyName"
                  type="text"
                  value={editFamily.family_name || ''} // Garante que não seja undefined
                  onChange={(e) =>
                    setEditFamily({ ...editFamily, family_name: e.target.value })
                  }
                  placeholder="Digite o nome da familia"
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
            form="updateFamilyForm"
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
                    handleDeleteFamily(familyToDelete);
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {filteredFamilies.map((family) => (
              <tr key={family.id} className="hover:bg-gray-100">
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
 
                  {family.id}
                </td>
                <td className="border-collapse border border-[#EDEBEB] px-4 py-2 whitespace-nowrap text-sm text-[#191919] text-left">
                  {family.family_name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredFamilies.length === 0 && !error && (
        <p className="text-center py-4">Nenhuma familia encontrada.</p>
      )}
    </div>
  );
};

export default DataFamily;