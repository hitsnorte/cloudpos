'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect, useMemo } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { fetchFamily, createFamily, deleteFamily, updateFamily } from '@/src/lib/apifamily';
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

const DataFamily = () => {
  const [families, setFamilies] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newFamily, setNewFamily] = useState({ family_name: '' });
  const [editFamily, setEditFamily] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("");

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
    loadFamilies();
  }, []);

  const loadColumnVisibility = () => {
    const savedVisibility = localStorage.getItem('columnVisibility');
    if (savedVisibility) {
      return JSON.parse(savedVisibility);
    }
    return {
      codFam: true, // estado padrão
      description: true,
      createdIn: true,
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

  const filteredFamilies = families.filter((familia) =>
    Object.values(familia).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );


  // Agora você pode usar a loadColumnVisibility ao inicializar o state
  const [columnVisibility, setColumnVisibility] = useState(loadColumnVisibility());
  
  const columns = [
    { key: 'codFam', label: 'Cod Fam' },
    { key: 'description', label: 'Description' },
    { key: 'createdIn', label: 'Created In' },
    { key: 'codGrpFam', label: 'cod Grp' },
    { key: 'descGrp', label: 'Description Grp' },
  ];

  const [columnSearchTerm, setColumnSearchTerm] = useState('');

  const filteredColumns = columns.filter((col) =>
    col.label.toLowerCase().includes(columnSearchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredFamilies.length / itemsPerPage);

  const paginatedFamilies = filteredFamilies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

   const sortedFamilies = useMemo(() => {
      if (!paginatedFamilies || !Array.isArray(paginatedFamilies)) return [];
    
      const sorted = [...paginatedFamilies].sort((a, b) => {
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
    }, [paginatedFamilies, sortConfig]);

  const loadFamilies = async () => {
    try {
      const families = await fetchFamily();
      const groupMap = await fetchGroupMap();
  
      console.log("Group Map Data:", groupMap);

   // Mapeamos os produtos, adicionando a descrição da subfamília e da família correspondente
   const enrichedFamilies = families.map(family => ({
    ...family,
    VDescGroup: groupMap[family.VCodGrFam] || "N/A", // Se não houver correspondência, coloca "N/A"
  }));

  setFamilies(enrichedFamilies);
} catch (err) {
  setError(err.message);
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
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFamily((prev) => ({ ...prev, [name]: value }));
  };


  const handleAddFamily = async (e) => {
    await createFamily(familyData);
    await loadFamilies();
    e.preventDefault();
    
    if (!newFamily.family_name || !selectedGroup) {
      setError('Preencha o nome da família e selecione um grupo.');
      return;
    }
  
    const familyExists = families.some(
      (family) => family.family_name.toLowerCase() === newFamily.family_name.toLowerCase()
    );
  
    if (familyExists) {
      setError('Esta família já existe. Por favor, use um nome diferente.');
      return;
    }
  
    try {
      setIsLoading(true);
      
      const familyData = {
        family_name: newFamily.family_name,
        selectedGroup: selectedGroup, // Certifique-se de que a chave no backend espera esse nome
      };
  
      const createdFamily = await createFamily(familyData);
      setFamilies([...families, createdFamily]);
  
      // Limpa os campos após sucesso
      setNewFamily({ family_name: '' });
      setSelectedGroup('');
      setError(null);
  
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
        await deleteFamily(familyToDelete);
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
    await updateFamily();
    await loadFamilies();
    e.preventDefault();
    if (!editFamily || !editFamily.family_name) {
      setError('Preencha o nome da familia.');
      return;
    }

    try {
      console.log('Enviando para API:', { id: editFamily.id, family_name: editFamily.family_name });
      const updatedFamily = await updateFamily(editFamily.id, {
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

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="p-4 pb-10">

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

      {/* button */}
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
                  <div className="text-xl font-bold text-white">New Family</div>
                  <Button
                    onClick={onClose}
                    className="text-white bg-transparent border-0 text-2xl p-0"
                    aria-label="Close"
                  >
                    &times; {/* Unicode for "×" sign */}
                  </Button>
                </ModalHeader>
                <ModalBody className="py-5 px-6">
                  <form id="addFamilyForm" onSubmit={handleAddFamily} className="space-y-6">
                    <div>
                      <label
                          htmlFor="newFamilyName"
                          className="block text-sm font-medium text-gray-400 mb-1"
                      >
                        Name
                      </label>
                      <input
                          id="newFamilyName"
                          type="text"
                          name="family_name"
                          value={newFamily.family_name}
                          onChange={handleInputChange}
                          placeholder="Digite o nome da familia"
                          className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                          required
                      />
                      {error && (
                          <p className="text-red-500 text-sm mt-1">{error}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="selectGroup" className="block text-sm font-medium text-gray-400 mb-1">
                        Select a Group
                      </label>
                      <select
                        id="selectFamily"
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-[#FC9D25]"
                      >
                        <option value="">Select...</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.group_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                  </form>
                </ModalBody>
                <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
                  <Button
                      type="submit"
                      form="addFamilyForm"
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
          <h3 className="text-xl flex justify-left items-left font-bold text-white">Edit Family</h3>
          <Button
            onClick={onClose}
            className="text-white bg-transparent border-0 text-2xl p-0"
            aria-label="Close"
            >
              &times; {/* Unicode for "×" sign */}
          </Button>
        </ModalHeader>
        <ModalBody className="py-5 px-6">
          {editFamily && (
            <form id="updateFamilyForm" onSubmit={handleUpdateFamily} className="space-y-6">
              <div>
                <label htmlFor="familyName" className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <input
                  id="familyName"
                  type="text"
                  value={editFamily ? editFamily.VDesc : ''} // Garante que não seja undefined
                  onChange={(e) =>
                    setEditFamily({ ...editFamily, VDesc: e.target.value })
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
        <ModalFooter className="flex justify-end border-t border-gray-200 pt-4 px-8">
          <Button
            type="submit"
            form="updateFamilyForm"
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

      {/* Modal para excluir familia */}
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
                  <p className="text-center text-gray-700">Tem certeza que deseja excluir a familia?</p>
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
        <table className="w-394 bg-[#FAFAFA] border-collapse border border-[#EDEBEB] mx-auto">
          <thead>
            <tr>
              <th className="border-collapse border border-[#EDEBEB] w-10 px-1 sm:px-5 py-2 bg-[#FC9D25]">
                <div className=" flex items-center justify-center">
                  <FaGear size={20} color='white'/>
                </div>
              </th>
              {columnVisibility.codFam && (
              <th className="uppercase border-collapse border border-[#EDEBEB] w-10 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                <div className="flex items-left justify-left">Cod Fam</div>
              </th>
              )}
              {columnVisibility.description && (
              <th onClick={() => handleSort('VDesc')} className="uppercase border-collapse border border-[#EDEBEB] w-100 sm:px-4 py-4 bg-[#FC9D25] text-[#FAFAFA] text-sm">
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
              <th className="uppercase border-collapse border border-[#EDEBEB] w-10 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                <div className="flex items-left justify-left">Created In</div>
              </th>
              )}
              {columnVisibility.codGrpFam && (
              <th className="uppercase border-collapse border border-[#EDEBEB] w-10 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                <div className="flex items-left justify-left">Cod Grp Fam</div>
              </th>
              )}
               {columnVisibility.descGrp && (
              <th onClick={() => handleSort('VDescGroup')} className="uppercase border-collapse border border-[#EDEBEB] w-90 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                <div className="flex items-left justify-left">
                  Desc Grp
                  {sortConfig.key === 'VDescGroup' && (
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
          {sortedFamilies.map((family) => (
            <tr key={family.VCodFam} className="hover:bg-gray-200">
              {/* Ações */}
              <td className="border border-[#EDEBEB] px-1 py-1 text-center">
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="bordered">
                      <HiDotsVertical size={18} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Dynamic Actions" placement="bottom-end" className="bg-white shadow-lg rounded-md p-1">
                        <DropdownItem key="edit" onPress={() => handleEditFamily(family)}>
                              Edit
                            </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </td>
              {columnVisibility.codFam && (
                 <td className="border border-[#EDEBEB] px-3 py-2 text-right">{family.VCodFam}</td>
               )}
               {columnVisibility.description && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{family.VDesc}</td>
                )}
                {columnVisibility.createdIn && (
                  <td className="border border-[#EDEBEB] px-4 py-2 text-right">
                {new Date(family.DCriadoEm).toLocaleDateString('pt-BR')}
                  </td>
                )}
                {columnVisibility.codGrpFam && (
                 <td className="border border-[#EDEBEB] px-3 py-2 text-right">{family.VCodGrFam}</td>
               )}
               {columnVisibility.descGrp && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{family.VDescGroup}</td>
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

export default DataFamily;