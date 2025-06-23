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
import { fetchPeriod, createPeriod } from "@/src/lib/apiseason";
import { fetchClassepreco } from "@/src/lib/apiclassepreco";
import { fetchClacexp } from "@/src/lib/apiclacexp";

const DataSeason = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);

  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const [newPeriod, setNewPeriod] = useState({ period_name: "" });

  const [loading, setLoading] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const [periodosData, classeprecosData, clacexpData] = await Promise.all([
        fetchPeriod(),
        fetchClassepreco(),
        fetchClacexp(),
      ]);

      const dadosComRelacionamento = relacionarDados({
        periodos: periodosData,
        clacexp: clacexpData,
        classes: classeprecosData,
      });

      setPeriods(dadosComRelacionamento);
    } catch (error) {
      console.error("Error fetching periods:", error);
    }
  };

  const relacionarDados = ({ periodos, clacexp, classes }) => {
    return periodos.map((periodo) => {
      const relacao = clacexp.find((c) => c.icodi === periodo.icodClasCexp);
      const classePreco = classes.find((cls) => cls.Vcodi === relacao?.icodiClasse);

      return {
        ...periodo,
        classePrecoDesc: classePreco?.Vdesc || "Sem descrição",
      };
    });
  };

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const onEditOpen = (period) => {
    setSelectedPeriod(period);
    setEditIsOpen(true);
  };

  const onEditClose = () => {
    setSelectedPeriod(null);
    setEditIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPeriod((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedPeriod((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPeriod = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const createdPeriod = await createPeriod(newPeriod);
      setPeriods([...periods, createdPeriod]);
      setNewPeriod({ period_name: "" });
      onClose();
    } catch (error) {
      console.error("Error adding period:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPeriod = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedPeriods = periods.map((period) =>
        period.vcodi === selectedPeriod.vcodi
          ? { ...period, Vdesc: selectedPeriod.Vdesc }
          : period
      );
      setPeriods(updatedPeriods);
      onEditClose();
    } catch (error) {
      console.error("Error updating period:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPeriods = periods.filter((period) => {
    const search = searchTerm.toLowerCase();
    return (
      (period.vcodi && String(period.vcodi).toLowerCase().includes(search)) ||
      (period.Vdesc && period.Vdesc.toLowerCase().includes(search)) ||
      (period.classePrecoDesc && period.classePrecoDesc.toLowerCase().includes(search))
    );
  });

  const sortedPeriods = useMemo(() => {
    if (!sortConfig.key) return filteredPeriods;

    const sorted = [...filteredPeriods].sort((a, b) => {
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
  }, [filteredPeriods, sortConfig]);

  const paginatedPeriods = sortedPeriods.slice(
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

  const totalPages = Math.ceil(filteredPeriods.length / itemsPerPage);

  return (
    <div className="p-4">
      {/* Header with Search and Add */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Seasons</h2>
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
          placeholder="Search by ID, Description, and Classe Preco..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FC9D25]"
        />
      </div>

      {/* Modal for Adding Period */}
      <Modal isOpen={isOpen} onOpenChange={onClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                <div className="text-xl font-bold text-white">New Period</div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white text-2xl font-bold hover:text-gray-200"
                >
                  &times;
                </button>
              </ModalHeader>
              <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                <form id="addPeriodForm" onSubmit={handleAddPeriod} className="space-y-6">
                  <div>
                    <label htmlFor="period_name" className="block text-sm font-medium text-[#191919] mb-1">
                      Period Name
                    </label>
                    <input
                      id="period_name"
                      type="text"
                      name="period_name"
                      value={newPeriod.period_name}
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
                <Button type="submit" form="addPeriodForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal for Editing Period */}
      <Modal isOpen={editIsOpen} onOpenChange={onEditClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
        <ModalContent>
          {(onEditClose) => (
            <>
              <ModalHeader className="rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                <div className="text-xl font-bold text-white">Edit Period</div>
                <button
                  type="button"
                  onClick={onEditClose}
                  className="text-white text-2xl font-bold hover:text-gray-200"
                >
                  &times;
                </button>
              </ModalHeader>
              <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                {selectedPeriod && (
                  <form id="editPeriodForm" onSubmit={handleEditPeriod} className="space-y-6">
                    <div>
                      <label htmlFor="Vdesc" className="block text-sm font-medium text-[#191919] mb-1">
                        Description
                      </label>
                      <input
                        id="Vdesc"
                        type="text"
                        name="Vdesc"
                        value={selectedPeriod.Vdesc}
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
                <Button type="submit" form="editPeriodForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Table */}
      <div className="mt-5">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : paginatedPeriods.length > 0 ? (
          <table className="w-full text-left mb-5 min-w-full md:min-w-0 border-collapse">
            <thead>
              <tr className="bg-[#FC9D25] text-white h-12">
                <th className="pl-2 pr-2 w-8 border-r border-[#e6e6e6]">
                  <FaGear size={18} color="white" />
                </th>
                <th
                  className="pl-2 pr-2 w-16 text-left border-r border-[#e6e6e6] uppercase select-none"
                  style={{ fontWeight: 300 }}
                  onClick={() => handleSort('vcodi')}
                >
                  ID {sortConfig.key === 'vcodi' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  className="pl-2 pr-2 w-32 border-r border-[#e6e6e6] uppercase select-none"
                  style={{ fontWeight: 300 }}
                  onClick={() => handleSort('Vdesc')}
                >
                  Description {sortConfig.key === 'Vdesc' && (sortConfig.direction === 'asc' ? '▲' : '▼')}

                </th>
                <th
                  className="pl-2 pr-2 border-r border-[#e6e6e6] uppercase select-none"
                  style={{ fontWeight: 300 }}
                  onClick={() => handleSort('classePrecoDesc')}
                >
                  Classe Preco {sortConfig.key === 'classePrecoDesc' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPeriods.map((period, index) => (
                <tr
                  key={period.vcodi || index}
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
                          onPress={() => onEditOpen(period)}
                        >
                          Edit
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </td>
                  <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6]">{period.vcodi}</td>
                  <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6]">{period.Vdesc}</td>
                  <td className="pl-2 pr-2">{period.classePrecoDesc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-textLabelColor">No periods available</p>
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
          items={paginatedPeriods}
          setPage={setCurrentPage}
          dataCSVButton={paginatedPeriods.map((item) => ({
            ID: item.vcodi,
            Description: item.Vdesc,
            ClassePreco: item.classePrecoDesc,
          }))}
        />
      </div>
    </div>
  );
};

export default DataSeason;