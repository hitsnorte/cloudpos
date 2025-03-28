'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { Plus } from "lucide-react";
import { FaGear } from "react-icons/fa6";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { fetchSubfamily, createSubfamily, deleteSubfamily, updateSubfamily } from '@/src/lib/apisubfamily';
import { fetchFamily } from '@/src/lib/apifamily';
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
  const [families, setFamilies] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSubfamilia, setNewSubfamilia] = useState({ nome: '' });
  const [editSubfamilia, setEditSubfamilia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subfamiliaToDelete, setSubfamiliaToDelete] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState("");

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
    loadFamilies();
  }, []);


  const loadSubfamilias = async () => {
    try {
      const subfamilias = await fetchSubfamily();
      setSubfamilias(subfamilias);
    } catch (err) {
      setError(err.message);
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

    const filteredSubfamilias = (subfamilias || []).filter((subfamilia) => {
      if (!subfamilia || !subfamilia.nome) return false; // Verifica se `subfamilia` e `subfamilia.nome` existem
      const searchLower = searchTerm.toLowerCase();
      return (
        (subfamilia.id && subfamilia.id.toString().includes(searchLower)) || 
        (subfamilia.nome && subfamilia.nome.toLowerCase().includes(searchLower))
      );
    });

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

  

  return (
    <div className="p-4">
      {/* button */}
      <Dropdown>
      <DropdownTrigger>
      <button 
          onClick={onAddModalOpen}
          className="absolute top-4 right-14 bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded">
          < Plus size={25}  />     
      </button>
      </DropdownTrigger>
       
      </Dropdown>

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
>
  <ModalContent>
    {(onClose) => (
      <>
        <ModalHeader className="rounded bg-[#FC9D25] flex justify-left items-left">
          <h3 className="text-xl flex justify-left items-left font-bold text-white">Edit Subfamily</h3>
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
        <table className="min-w-full bg-[#FAFAFA] border-collapse border border-[#EDEBEB] mx-auto">
          <thead>
            <tr>
              <th className="border-collapse border border-[#EDEBEB] !w-[2px] px-1 sm:px-5 py-2 bg-[#FC9D25]">
                <div className=" flex items-center justify-center">
                  <FaGear size={20} color='white'/>
                </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-25 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                <div className=" flex items-center justify-center"> 
                  Cod Grp Fam
                </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-5 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                <div className=" flex items-center justify-center"> 
                  Cod Fam
                </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-25 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                <div className=" flex items-center justify-center"> 
                  Cod Sub Fam
                </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-120 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                <div className=" flex items-center justify-center"> 
                  Descrição
                </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-90 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className="flex items-center justify-center "> 
                  Criado em
              </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-5 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className="flex items-center justify-center "> 
                  Criado por
              </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-15 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className="flex items-center justify-center "> 
                  ID Grp Conta
              </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-300">
          {subfamilias.map((subfamilia) => (
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
                    <DropdownItem key="edit" onPress={() => alert(`Editando ${subfamilia.VDesc}`)}>Editar</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </td>
              
              {/* Dados do Produto */}
              <td className="border border-[#EDEBEB] px-3 py-2 text-right">{subfamilia.VCodGrfam}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-right">{subfamilia.VCodFam}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-right">{subfamilia.VCodSubFam}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-left">{subfamilia.VDesc}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-right">
                {new Date(subfamilia.dcriadoem).toLocaleDateString('pt-BR')}
              </td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-left">{subfamilia.vcriadopor}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-right">
                  {subfamilia.ID_GrupoConta === -1 ? "" : subfamilia.ID_GrupoConta}
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