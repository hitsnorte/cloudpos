'use client';

import { useState, useEffect, useMemo } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@nextui-org/react";
import CustomPagination from "@/src/components/table/page";
import { fetchClassepreco, createClassepreco } from "@/src/lib/apiclassepreco";

const DataClassepreco = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);

  const [classeprecos, setClasseprecos] = useState([]);
  const [selectedClassepreco, setSelectedClassepreco] = useState(null);

  const [newClassepreco, setNewClassepreco] = useState({ classepreco_name: "" });

  const [loading, setLoading] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchClasseprecos();
  }, []);

  const fetchClasseprecos = async () => {
    try {
      const data = await fetchClassepreco();
      const sortedClasseprecos = data.sort((a, b) => a.Vdesc.localeCompare(b.Vdesc));
      setClasseprecos(sortedClasseprecos);
    } catch (error) {
      console.error("Error fetching classeprecos:", error);
    }
  };

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const onEditOpen = (classepreco) => {
    setSelectedClassepreco(classepreco);
    setEditIsOpen(true);
  };

  const onEditClose = () => {
    setSelectedClassepreco(null);
    setEditIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClassepreco((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedClassepreco((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClassepreco = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const createdClassepreco = await createClassepreco(newClassepreco);
      await fetchClasseprecos();
      setNewClassepreco({ classepreco_name: "" });
      onClose();
    } catch (error) {
      console.error("Error adding classepreco:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClassepreco = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Assuming an updateClassepreco function exists
      await updateClassepreco(selectedClassepreco.Vcodi, { Vdesc: selectedClassepreco.Vdesc });
      await fetchClasseprecos();
      onEditClose();
    } catch (error) {
      console.error("Error updating classepreco:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasseprecos = classeprecos.filter((classepreco) => {
    const search = searchTerm.toLowerCase();
    return (
      (classepreco.Vcodi && String(classepreco.Vcodi).toLowerCase().includes(search)) ||
      (classepreco.abreviatura && classepreco.abreviatura.toLowerCase().includes(search)) ||
      (classepreco.Vdesc && classepreco.Vdesc.toLowerCase().includes(search))
    );
  });

  const sortedClasseprecos = useMemo(() => {
    if (!sortConfig.key) return filteredClasseprecos;

    const sorted = [...filteredClasseprecos].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      const isNumeric = typeof aValue === 'number' || !isNaN(Number(aValue));

      if (isNumeric) {
        return sortConfig.direction === 'asc'
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      } else {
        return sortConfig.direction === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });

    return sorted;
  }, [filteredClasseprecos, sortConfig]);

  const paginatedClasseprecos = sortedClasseprecos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const totalPages = Math.ceil(filteredClasseprecos.length / itemsPerPage);

  return (
    <div className="p-4">
      {/* Header with Search and Add */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Price Classes</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpen}
            className="bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded"
          >
            <Plus size={25} />
          </button>
        </div>
      </div>

      {/* SearchBar */}
      <div className="flex mb-4 items-center gap-2">
        <input
          type="text"
          placeholder="Search by ID, Abbreviation, and Description..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FC9D25]"
        />
      </div>

      {/* Modal for Adding Classepreco */}
      <Modal isOpen={isOpen} onOpenChange={onClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                <div className="text-xl font-bold text-white">New Price Class</div>
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                >
                  &times;
                </button>
              </ModalHeader>
              <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                <form id="addClasseprecoForm" onSubmit={handleAddClassepreco} className="space-y-6">
                  <div>
                    <label htmlFor="classepreco_name" className="block text-sm font-medium text-[#191919] mb-1">
                      Description
                    </label>
                    <input
                      id="classepreco_name"
                      type="text"
                      name="classepreco_name"
                      value={newClassepreco.classepreco_name}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                  </div>
                </form>
              </ModalBody>
              <ModalFooter className="border-t border-[#EDEBEB] bg-[#FAFAFA] pt-2 px-8">
                <Button onPress={onClose} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
                  Cancel
                </Button>
                <Button type="submit" form="addClasseprecoForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal for Editing Classepreco */}
      <Modal isOpen={editIsOpen} onOpenChange={onEditClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
        <ModalContent>
          {(onEditClose) => (
            <>
              <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                <div className="text-xl font-bold text-white">Edit Price Class</div>
                <button
                  type="button"
                  onClick={onEditClose}
                  className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                >
                  &times;
                </button>
              </ModalHeader>
              <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                {selectedClassepreco && (
                  <form id="editClasseprecoForm" onSubmit={handleEditClassepreco} className="space-y-6">
                    <div>
                      <label htmlFor="Vdesc" className="block text-sm font-medium text-[#191919] mb-1">
                        Description
                      </label>
                      <input
                        id="Vdesc"
                        type="text"
                        name="Vdesc"
                        value={selectedClassepreco.Vdesc}
                        onChange={handleEditInputChange}
                        className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                        required
                      />
                    </div>
                  </form>
                )}
              </ModalBody>
              <ModalFooter className="border-t border-[#EDEBEB] bg-[#FAFAFA] pt-2 px-8">
                <Button onPress={onEditClose} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
                  Cancel
                </Button>
                <Button type="submit" form="editClasseprecoForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Classepreco Table */}
      <div className="mt-5">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : paginatedClasseprecos.length > 0 ? (
          <table className="w-full text-left mb-5 min-w-full md:min-w-0 border-collapse">
            <thead>
              <tr className="bg-[#FC9D25] text-white h-12" >
                <th className="pl-2 pr-2 w-8 border-r border-[#e6e6e6]">
                  <FaGear size={18} color="white" />
                </th>
                <th
                  className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6] uppercase cursor-pointer select-none" style={{ fontWeight: 300 }}
                  onClick={() => handleSort('Vcodi')}
                >
                  ID {sortConfig.key === 'Vcodi' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  className="pl-2 pr-2 w-32 border-r border-[#e6e6e6] uppercase cursor-pointer select-none" style={{ fontWeight: 300 }}
                  onClick={() => handleSort('abreviatura')}
                >
                  Abbreviation {sortConfig.key === 'abreviatura' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  className="pl-2 pr-2 border-r border-[#e6e6e6] uppercase cursor-pointer select-none" style={{ fontWeight: 300 }}
                  onClick={() => handleSort('Vdesc')}
                >
                  Description {sortConfig.key === 'Vdesc' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedClasseprecos.map((classepreco, index) => (
                <tr
                  key={classepreco.Vcodi || classepreco.abreviatura || index}
                  className="h-10 border-b border-[#e8e6e6] text-textPrimaryColor text-left transition-colors duration-150 hover:bg-[#FC9D25]/20"
                >
                  <td className="pl-1 flex items-start border-r border-[#e6e6e6] relative z-10">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          variant="light"
                          className="flex justify-center items-center w-auto min-w-0 p-0 m-0 relative"
                        >
                          <HiDotsVertical size={20} className="text-textPrimaryColor" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Actions"
                        closeOnSelect={true}
                        className="min-w-[150px] bg-white rounded-lg shadow-xl py-2 px-1 border border-gray-100"
                      >
                        <DropdownItem
                          key="edit"
                          className="px-4 py-2 text-base text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded transition-colors cursor-pointer"
                          onPress={() => onEditOpen(classepreco)}
                        >
                          Edit
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </td>
                  <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6]">{classepreco.Vcodi}</td>
                  <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6]">{classepreco.abreviatura}</td>
                  <td className="pl-2 pr-2">{classepreco.Vdesc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-textLabelColor">No price classes available</p>
        )}
      </div>

      {/* Pagination */}
      <div className="bottom-0 w-full bg-white p-0 m-0 pagination-container">
        <CustomPagination
          page={currentPage}
          pages={totalPages}
          rowsPerPage={itemsPerPage}
          handleChangeRowsPerPage={(newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          }}
          items={paginatedClasseprecos}
          setPage={setCurrentPage}
          dataCSVButton={paginatedClasseprecos.map((item) => ({
            ID: item.Vcodi,
            Abbreviation: item.abreviatura,
            Description: item.Vdesc,
          }))}
        />
      </div>
    </div>
  );
};

export default DataClassepreco;