'use client'

import { useState, useEffect } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
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

const ChainsTable = () => {
    const [isOpen, setIsOpen] = useState(false);
<<<<<<< HEAD
    const [editIsOpen, setEditIsOpen] = useState(false);  // Novo estado para modal de edição
=======
    const [editIsOpen, setEditIsOpen] = useState(false);
>>>>>>> 55c68949a6555cbd2d29a073de0dbad28cf7a935

    const [chains, setChains] = useState([]);
<<<<<<< HEAD
    const [selectedChain, setSelectedChain] = useState(null);  // Guarda a chaina ser editada
=======
    const [selectedChain, setSelectedChain] = useState(null);
>>>>>>> 55c68949a6555cbd2d29a073de0dbad28cf7a935

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
<<<<<<< HEAD
            // Sort chains alphabetically by chainName
=======
>>>>>>> 55c68949a6555cbd2d29a073de0dbad28cf7a935
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

<<<<<<< HEAD
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [currentPage , setCurrentPage] = useState(1);
    const [searchTerm , setSearchTerm] = useState('')
    const [showSearchBar, setShowSearchBar] = useState(false);

    // Filtra as chains com base na pesquisa
=======
>>>>>>> 55c68949a6555cbd2d29a073de0dbad28cf7a935
    const filteredChains = chains.filter((chain) =>
        chain.chainName.toLowerCase().includes(searchTerm.toLowerCase())
    );

<<<<<<< HEAD
    // Paginação aplicada sobre o array filtrado
=======
>>>>>>> 55c68949a6555cbd2d29a073de0dbad28cf7a935
    const paginatedChains = filteredChains.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredChains.length / itemsPerPage);

<<<<<<< HEAD



=======
>>>>>>> 55c68949a6555cbd2d29a073de0dbad28cf7a935
    return (
        <div className="p-4">
            {/* Header com Search e Add */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">All Chains</h2>
                <div className="flex items-center gap-2">
                    <button
<<<<<<< HEAD
                        onClick={() => setShowSearchBar(prev => !prev)}
                        className="p-2 rounded hover:bg-gray-200 transition"
                        aria-label="Toggle Search"
                    >
                        <FaSearch size ={25} />
                    </button>
                    <button
                        className="bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded"
                        onClick={onOpen}
                    >
                        <Plus size={25} />
                    </button>
                </div>
=======
                        onClick={() => {
                            setSearchTerm(searchInput);
                            setCurrentPage(1);
                        }}
                        className="p-2 rounded hover:bg-gray-200 transition"
                        aria-label="Search"
                    >
                        <FaSearch size={18} />
                    </button>

                    <Dropdown>
                        <DropdownTrigger>
                            <button
                                onClick={onOpen}
                                className="bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded"
                            >
                                <Plus size={25} />
                            </button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Actions" className="bg-white shadow-lg rounded-md p-1">
                            <DropdownItem key="add" onPress={onOpen}>Add Chain</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>

            {/* SearchBar permanente */}
            <div className="flex mb-4 items-center gap-2">
                <input
                    type="text"
                    placeholder="Search by chain name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setSearchTerm(searchInput);
                            setCurrentPage(1);
                        }
                    }}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FC9D25]"
                />
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto bg-muted/40">
                <table className="min-w-full bg-[#FAFAFA] border-collapse border border-[#EDEBEB] mx-auto">
                    <thead>
                    <tr className="bg-[#FC9D25] text-white">
                        <th className="border border-[#EDEBEB] w-[50px] px-2 py-2 text-center">
                            <FaGear size={20} />
                        </th>
                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">ID</th>
                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">Chain Tag</th>
                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">Chain Name</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                    {paginatedChains.length > 0 ? (
                        paginatedChains.map((chain) => (
                            <tr key={chain.id || chain.chainTag} className="hover:bg-gray-100">
                                <td className="border border-[#EDEBEB] w-[50px] px-2 py-2 text-center">
                                    <HiDotsVertical size={18} onClick={() => onEditOpen(chain)} />
                                </td>
                                <td className="border border-[#EDEBEB] px-4 py-2">{chain.chainID}</td>
                                <td className="border border-[#EDEBEB] px-4 py-2">{chain.chainTag}</td>
                                <td className="border border-[#EDEBEB] px-4 py-2">{chain.chainName}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="border border-[#EDEBEB] px-4 py-4 text-center text-gray-500">
                                No chains available
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
>>>>>>> 55c68949a6555cbd2d29a073de0dbad28cf7a935
            </div>

            {/* Barra de pesquisa, visível se showSearchBar for true */}
            {showSearchBar && (
                <input
                    type="text"
                    placeholder="Search by chain name..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // reset página ao pesquisar
                    }}
                    className="mb-4 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FC9D25]"
                />
            )}


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

<<<<<<< HEAD
            {/* Tabela */}
            <div className="overflow-x-auto bg-muted/40">
                <table className="min-w-full bg-[#FAFAFA] border-collapse border border-[#EDEBEB] mx-auto">
                    <thead>
                    <tr className="bg-[#FC9D25] text-white">
                        <th className="border border-[#EDEBEB] w-[50px] px-2 py-2 text-center">
                            <FaGear size={20} />
                        </th>
                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">ID</th>
                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">Chain Tag</th>
                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">Chain Name</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                    {paginatedChains.length > 0 ? (
                        paginatedChains.map((chain) => (
                            <tr key={chain.id || chain.chainTag} className="hover:bg-gray-100">
                                <td className="border border-[#EDEBEB] w-[50px] px-2 py-2 text-center">
                                    <HiDotsVertical size={18} onClick={() => onEditOpen(chain)} />
                                </td>
                                <td className="border border-[#EDEBEB] px-4 py-2">{chain.chainID}</td>
                                <td className="border border-[#EDEBEB] px-4 py-2">{chain.chainTag}</td>
                                <td className="border border-[#EDEBEB] px-4 py-2">{chain.chainName}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="border border-[#EDEBEB] px-4 py-4 text-center text-gray-500">
                                No chains available
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
=======

            {/* Paginação*/}
            <div className="flex fixed bottom-0 left-0 items-center gap-2 w-full px-4 py-3 bg-[#EDEBEB] justify-end">
                <span className="px-2 py-1">Items per page</span>

                <select
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="border p-2 rounded px-2 py-1 w-16"
                >
                    {[5, 10, 20, 50].map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>

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
>>>>>>> 55c68949a6555cbd2d29a073de0dbad28cf7a935
            </div>

            <div className="flex fixed bottom-0 left-0 items-center gap-2 w-full px-4 py-3 bg-gray-200 justify-end p-0 z-10 border-t">
                <span className="px-4 py-2">Items per page</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); // volta para a primeira página quando mudar
                    }}
                    className="border p-2 rounded px-4 py-2 w-20"
                >
                    {[5, 10, 15, 20, 50].map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>

                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded ${currentPage === 1 ? 'text-black cursor-not-allowed' : 'hover:bg-gray-300'}`}
                >
                    &lt;
                </button>

                <span className="px-4 py-2">{currentPage} / {totalPages || 1}</span>

                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded ${currentPage === totalPages ? 'text-black cursor-not-allowed' : 'hover:bg-gray-300'}`}
                >
                    &gt;
                </button>
            </div>

        </div>
    );
};

export default ChainsTable;
