'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { Plus } from "lucide-react";
import { FaGear } from "react-icons/fa6";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { Select,  SelectItem} from "@heroui/select";
import { fetchSubfamily, createSubfamily, deleteSubfamily, updateSubfamily } from '@/src/lib/apisubfamily';
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

const DataSubfamilia = () => {
  const [subfamilias, setSubfamilias] = useState([]);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSubfamilia, setNewSubfamilia] = useState({ nome: '' });
  const [editSubfamilia, setEditSubfamilia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subfamiliaToDelete, setSubfamiliaToDelete] = useState(null);

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
    loadSubfamilias();
  }, []);

  const loadSubfamilias = async () => {
    try {
      const subfamilias = await fetchSubfamily();
      setSubfamilias(subfamilias);
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
    const sortedSubfamilias = [...subfamilias].sort((a, b) => {
      if (field === 'id') {
        return sortOrder === 'asc' ? a[field] - b[field] : b[field] - a[field];
      }
      return sortOrder === 'asc'
        ? a[field].localeCompare(b[field])
        : b[field].localeCompare(a[field]);
    });
    setSubfamilias(sortedSubfamilias);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 ml-1" />
    );
  };

  const filteredSubfamilias = subfamilias.filter((subfamilia) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      subfamilia.id.toString().includes(searchLower) ||
      subfamilia.nome.toString().toLowerCase().includes(searchLower)
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubfamilia((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubfamilia = async (e) => {
    e.preventDefault();
    if (!newSubfamilia.nome) {
      setError('Preencha o nome da sub familia.');
      return;
    }

    const subfamiliaExists = subfamilias.some(
      (subfamilia) => subfamilia.nome.toLowerCase() === newSubfamilia.nome.toLowerCase()
    );
    if (subfamiliaExists) {
      setError('Esta sub familia já existe. Por favor, use um nome diferente.');
      return;
    }

    try {
      setIsLoading(true);
      const subfamiliaData = { nome: newSubfamilia.nome };
      const createdSubfamilia = await createSubfamily(subfamiliaData);
      setSubfamilias([...subfamilias, createdSubfamilia]);
      setNewSubfamilia({ nome: '' });
      setError(null); // Limpa o erro após sucesso
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

 {/*  useEffect(() => {
    fetch("/api/subfamily") // Substitua pela URL da sua API
      .then((response) => response.json())
      .then((data) => setSubfamilias(data))
      .catch((error) => console.error("Erro ao procurar subfamilias:", error));
  }, []); */}

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

          className="bg-white shadow-lg rounded-md p-1"

             >
              <DropdownItem
                type="text"
                placeholder="Digite o nome"
                key="add"
                onPress={onAddModalOpen}
              > Add        
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Modal para adicionar subfamilia */}
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
                <h3 className="text-xl flex justify-left items-left font-bold text-white">New Sub Family</h3>
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
                  <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                  <Select required 
                          className="max-w-m" 
                          label="Select a family" >
                       {subfamilias.map((subfamilia) => (
                       <SelectItem key={subfamilia.key}>{subfamilia.label}</SelectItem>
                      ))}
                   </Select>
                   </div>
                </form>
              </ModalBody>
              <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
                <Button
                  type="submit"
                  form="addSubfamiliaForm"
                  className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                  disabled={isLoading}
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
          <h3 className="text-xl flex justify-left items-left font-bold text-white">Editar sub familia</h3>
        </ModalHeader>
        <ModalBody className="py-5 px-6">
          {editSubfamilia && (
            <form id="updateSubfamiliaForm" onSubmit={handleUpdateSubfamilia} className="space-y-6">
              <div>
                <label htmlFor="subfamiliaName" className="block text-sm font-medium text-gray-400 mb-1">
                  Name
                </label>
                <input
                  id="subfamiliaName"
                  type="text"
                  value={editSubfamilia.nome || ''} // Garante que não seja undefined
                  onChange={(e) =>
                    setEditSubfamilia({ ...editSubfamilia, nome: e.target.value })
                  }
                  placeholder="Digite o nome da sub familia"
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
        <table className="min-w-full bg-[#FAFAFA] border-collapse border border-[#EDEBEB] mx-auto">
          <thead>
            <tr>
              <th className="border-collapse border border-[#EDEBEB] !w-[2px] px-1 sm:px-5 py-4 bg-[#FC9D25]">
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
            {filteredSubfamilias.map((subfamilia) => (
              <tr key={subfamilia.id} className="hover:bg-gray-100">
                <td className="border-collapse border border-[#EDEBEB] w-1 py-1 whitespace-nowrap text-sm text-[#191919] text-center">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered">
                        <HiDotsVertical size={18} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Dynamic Actions"
                      placement="bottom-up"
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
                          handleEditSubfamilia(subfamilia);
                          onEditModalOpen();
                        }}
                        className="hover:bg-gray-100"
                      >
                        Editar
                      </DropdownItem>
                      {/* <DropdownItem
                        key="delete"
                        className="text-danger hover:bg-red-50"
                        color="danger"
                        onPress={() => {
                          setSubfamiliaToDelete(subfamilia.id);
                          onDeleteModalOpen();
                        }}
                      >
                        Excluir
                      </DropdownItem> */}
                    </DropdownMenu>
                  </Dropdown>
                </td>
                
                <td className="border-collapse border border-[#EDEBEB] px-3 py-2 whitespace-nowrap text-sm text-[#191919] text-right">

                  {subfamilia.id}
                </td>
                <td className="border-collapse border border-[#EDEBEB] px-4 py-2 whitespace-nowrap text-sm text-[#191919] text-left">
                  {subfamilia.nome}
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredSubfamilias.length === 0 && !error && (
        <p className="text-center py-4">Nenhuma Sub familia encontrada.</p>
      )}
    </div>
  );
};

export default DataSubfamilia;