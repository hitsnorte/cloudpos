'use client';

import { useState, useEffect } from "react";
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
import { fetchUnit } from '@/src/lib/apiunit';

const DataUnit = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [editIsOpen, setEditIsOpen] = useState(false);

    const [units, setUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(null);

    const [newUnit, setNewUnit] = useState({ abreviatura: "", descricao: "", codProd: "" });

    const [loading, setLoading] = useState(false);

    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            const res = await fetchUnit();
            const sortedUnits = res.sort((a, b) => a.Descricao.localeCompare(b.Descricao));
            setUnits(sortedUnits);
        } catch (error) {
            console.error("Error fetching units:", error);
        }
    };

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const onEditOpen = (unit) => {
        setSelectedUnit(unit);
        setEditIsOpen(true);
    };

    const onEditClose = () => {
        setSelectedUnit(null);
        setEditIsOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUnit((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedUnit((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddUnit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Add logic to create a new unit
            await fetchUnits();
            setNewUnit({ abreviatura: "", descricao: "", codProd: "" });
            onClose();
        } catch (error) {
            console.error("Error adding unit:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUnit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Add logic to update the selected unit
            await fetchUnits();
            onEditClose();
        } catch (error) {
            console.error("Error updating unit:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUnits = units.filter((unit) => {
        const search = searchTerm.toLowerCase();
        return (
            (unit.Id_interno && String(unit.Id_interno).toLowerCase().includes(search)) ||
            (unit.TipoProduto && unit.TipoProduto.toLowerCase().includes(search)) ||
            (unit.Descricao && unit.Descricao.toLowerCase().includes(search))
        );
    });

    const paginatedUnits = filteredUnits.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);

    return (
        <div className="p-4">
            {/* Header with Search and Add */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">All Units</h2>
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
                    placeholder="Search by ID, Type, and Description..."
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value);
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FC9D25]"
                />
            </div>

            {/* Modal for Adding Units */}
            <Modal isOpen={isOpen} onOpenChange={onClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                                <div className="text-xl font-bold text-white">New Unit</div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                                >
                                    &times;
                                </button>
                            </ModalHeader>
                            <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                                <form id="addUnitForm" onSubmit={handleAddUnit} className="space-y-6">
                                    {['abreviatura', 'descricao', 'codProd'].map((field, index) => (
                                        <div key={index}>
                                            <label htmlFor={field} className="block text-sm font-medium text-[#191919] mb-1">
                                                {field === "abreviatura" ? "Abbreviation" : field === "descricao" ? "Description" : "Product Code"}
                                            </label>
                                            <input
                                                id={field}
                                                type="text"
                                                name={field}
                                                value={newUnit[field]}
                                                onChange={handleInputChange}
                                                className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                                required
                                            />
                                        </div>
                                    ))}
                                </form>
                            </ModalBody>
                            <ModalFooter className="border-t border-[#EDEBEB] bg-[#FAFAFA] pt-2 px-8">
                                <Button onPress={onClose} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
                                    Cancel
                                </Button>
                                <Button type="submit" form="addUnitForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition" disabled={loading}>
                                    {loading ? "Saving..." : "Save"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Modal for Editing Units */}
            <Modal isOpen={editIsOpen} onOpenChange={onEditClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    {(onEditClose) => (
                        <>
                            <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                                <div className="text-xl font-bold text-white">Edit Unit</div>
                                <button
                                    type="button"
                                    onClick={onEditClose}
                                    className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                                >
                                    &times;
                                </button>
                            </ModalHeader>
                            <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                                {selectedUnit && (
                                    <form id="editUnitForm" onSubmit={handleEditUnit} className="space-y-6">
                                        {['abreviatura', 'descricao', 'codProd'].map((field, index) => (
                                            <div key={index}>
                                                <label htmlFor={field} className="block text-sm font-medium text-[#191919] mb-1">
                                                    {field === "abreviatura" ? "Abbreviation" : field === "descricao" ? "Description" : "Product Code"}
                                                </label>
                                                <input
                                                    id={field}
                                                    type="text"
                                                    name={field}
                                                    value={selectedUnit[field]}
                                                    onChange={handleEditInputChange}
                                                    className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </form>
                                )}
                            </ModalBody>
                            <ModalFooter className="border-t border-[#EDEBEB] bg-[#FAFAFA] pt-2 px-8">
                                <Button onPress={onEditClose} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
                                    Cancel
                                </Button>
                                <Button type="submit" form="editUnitForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition" disabled={loading}>
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
                ) : paginatedUnits.length > 0 ? (
                    <table className="w-full text-left mb-5 min-w-full md:min-w-0 border-collapse">
                        <thead>
                            <tr className="bg-[#FC9D25] text-white h-12">
                                <td className="pl-2 pr-2 w-8 border-r border-[#e6e6e6]">
                                    <FaGear size={18} color="white" />
                                </td>
                                <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6] uppercase">ID</td>
                                <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6] uppercase">Type</td>
                                <td className="pl-2 pr-2 border-r border-[#e6e6e6] uppercase">Description</td>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUnits.map((unit, index) => (
                                <tr
                                    key={unit.Id_interno || index}
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
                                                    onPress={() => onEditOpen(unit)}
                                                >
                                                    Edit
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </td>
                                    <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6]">{unit.Id_interno}</td>
                                    <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6]">{unit.TipoProduto}</td>
                                    <td className="pl-2 pr-2">{unit.Descricao}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-textLabelColor">No units available</p>
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
                    items={paginatedUnits}
                    setPage={setCurrentPage}
                    dataCSVButton={paginatedUnits.map((item) => ({
                        ID: item.Id_interno,
                        Type: item.TipoProduto,
                        Description: item.Descricao,
                    }))}
                />
            </div>
        </div>
    );
};

export default DataUnit;