'use client'

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

const ChainsTable = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [editIsOpen, setEditIsOpen] = useState(false);

    const [chains, setChains] = useState([]);
    const [selectedChain, setSelectedChain] = useState(null);

    const [newChain, setNewChain] = useState({ chainTag: "", chainName: "" });

    const [loading, setLoading] = useState(false);

    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        fetchChains();
    }, []);

    const fetchChains = async () => {
        try {
            const res = await fetch("/api/chains");
            if (!res.ok) throw new Error("Failed to fetch chains");
            const data = await res.json();
            const sortedChains = data.sort((a, b) => a.chainName.localeCompare(b.chainName));
            setChains(sortedChains);
        } catch (error) {
            console.error("Error fetching chains:", error);
        }
    };

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const onEditOpen = (chain) => {
        setSelectedChain(chain);
        setEditIsOpen(true);
    };

    const onEditClose = () => {
        setSelectedChain(null);
        setEditIsOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewChain((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedChain((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddChain = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/chains", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newChain),
            });

            if (!res.ok) throw new Error("Failed to add chain");

            await fetchChains();
            setNewChain({ chainTag: "", chainName: "" });
            onClose();
        } catch (error) {
            console.error("Error adding chain:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditChain = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/chains/${selectedChain.chainID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chainName: selectedChain.chainName
                }),
            });

            if (!res.ok) throw new Error("Failed to update chain");

            await fetchChains();
            onEditClose();
        } catch (error) {
            console.error("Error updating chain:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setNewChain({ chainTag: "", chainName: "" });
        onClose();
    };

    // Update your filter logic to search all columns:
    const filteredChains = chains.filter((chain) => {
        const search = searchTerm.toLowerCase();
        return (
            (chain.chainID && String(chain.chainID).toLowerCase().includes(search)) ||
            (chain.chainTag && chain.chainTag.toLowerCase().includes(search)) ||
            (chain.chainName && chain.chainName.toLowerCase().includes(search))
        );
    });

    const paginatedChains = filteredChains.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredChains.length / itemsPerPage);

    return (
        <div className="p-4">
            {/* Header com Search e Add */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">All Chains</h2>
                <div className="flex items-center gap-2">
                    {/* Removed search button */}
                    <button
                        onClick={onOpen}
                        className="bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded"
                    >
                        <Plus size={25} />
                    </button>
                </div>
            </div>

            {/* SearchBar permanente */}
            <div className="flex mb-4 items-center gap-2">
                <input
                    type="text"
                    placeholder="Search by ID, Chain Tag and Chain Name..."
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value);
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FC9D25]"
                />
            </div>

            {/* Modal de adição de cadeias novas */}
            <Modal isOpen={isOpen} onOpenChange={onClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            {/* Header */}
                            <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                                <div className="text-xl font-bold text-white">New Chain</div>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                                >
                                    &times;
                                </button>
                            </ModalHeader>

                            {/* Body */}
                            <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                                <form id="addChainForm" onSubmit={handleAddChain} className="space-y-6">
                                    {['chainTag', 'chainName'].map((field, index) => (
                                        <div key={index}>
                                            <label htmlFor={field} className="block text-sm font-medium text-[#191919] mb-1">
                                                {field === "chainTag" ? "Chain Tag" : "Chain Name"}
                                            </label>
                                            <input
                                                id={field}
                                                type="text"
                                                name={field}
                                                value={newChain[field]}
                                                onChange={handleInputChange}
                                                className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                                required
                                            />
                                        </div>
                                    ))}
                                </form>
                            </ModalBody>

                            {/* Footer com os botões Cancel e Save  */}
                            <ModalFooter className="border-t border-[#EDEBEB] bg-[#FAFAFA] pt-2 px-8">
                                <Button onPress={handleCloseModal} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
                                    Cancel
                                </Button>
                                <Button type="submit" form="addChainForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition" disabled={loading}>
                                    {loading ? "Saving..." : "Save"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Modal de edição de cadeia */}
            <Modal isOpen={editIsOpen} onOpenChange={onEditClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    {(onEditClose) => (
                        <>
                            {/* Header */}
                            <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                                <div className="text-xl font-bold text-white">Edit Chain</div>
                                <button
                                    type="button"
                                    onClick={onEditClose}
                                    className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                                >
                                    &times;
                                </button>
                            </ModalHeader>

                            {/* Body */}
                            <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                                {selectedChain && (
                                    <form id="editChainForm" onSubmit={handleEditChain} className="space-y-6">
                                        {['chainName'].map((field, index) => (
                                            <div key={index}>
                                                <label htmlFor={field} className="block text-sm font-medium text-[#191919] mb-1">
                                                    {field === "chainName" ? "Chain Name" : null}
                                                </label>
                                                <input
                                                    id={field}
                                                    type="text"
                                                    name={field}
                                                    value={selectedChain[field]}
                                                    onChange={handleEditInputChange}
                                                    className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </form>
                                )}
                            </ModalBody>

                            {/* Footer com os botões Cancel e Save  */}
                            <ModalFooter className="border-t border-[#EDEBEB] bg-[#FAFAFA] pt-2 px-8">
                                <Button onPress={onEditClose} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
                                    Cancel
                                </Button>
                                <Button type="submit" form="editChainForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition" disabled={loading}>
                                    {loading ? "Saving..." : "Save"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <div className="mt-5">
                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : paginatedChains.length > 0 ? (
                    <table className="w-full text-left mb-5 min-w-full md:min-w-0 border-collapse">
                        <thead>
                        <tr className="bg-[#FC9D25] text-white h-12">
                            <td className="pl-2 pr-2 w-8 border-r border-[#e6e6e6]">
                                <FaGear size={18} color="white" />
                            </td>
                            <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6] uppercase">ID</td>
                            <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6] uppercase">Chain Tag</td>
                            <td className="pl-2 pr-2 border-r border-[#e6e6e6] uppercase">Chain Name</td>
                            {/* Add more columns here if needed */}
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedChains.map((chain, index) => (
                            <tr
                                key={chain.chainID || chain.chainTag || index}
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
                                                onPress={() => onEditOpen(chain)}
                                            >
                                                Edit
                                            </DropdownItem>
                                            {/* Add more dropdown actions here */}
                                        </DropdownMenu>
                                    </Dropdown>
                                </td>
                                <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6]">{chain.chainID}</td>
                                <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6]">{chain.chainTag}</td>
                                <td className="pl-2 pr-2">{chain.chainName}</td>
                                {/* Add more cells here if needed */}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-textLabelColor">No chains available</p>
                )}
            </div>

            {/* Fixed Pagination Section */}
            <div className="bottom-0 w-full bg-white p-0 m-0 pagination-container">
                <CustomPagination
                    page={currentPage}
                    pages={totalPages}
                    rowsPerPage={itemsPerPage}
                    handleChangeRowsPerPage={(newSize) => {
                        setItemsPerPage(newSize);
                        setCurrentPage(1);
                    }}
                    items={paginatedChains}
                    setPage={setCurrentPage}
                    dataCSVButton={paginatedChains.map((item) => ({
                        ID: item.chainID,
                        Tag: item.chainTag,
                        Name: item.chainName,
                    }))}
                />
            </div>
        </div>
    );
};

export default ChainsTable;