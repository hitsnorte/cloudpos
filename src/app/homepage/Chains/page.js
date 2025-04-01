'use client'

import { useState, useEffect } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";

const ChainsTable = () => {
    // Controla visibilidade do modal
    const [isOpen, setIsOpen] = useState(false);
    const [editIsOpen, setEditIsOpen] = useState(false);  // New state for edit modal

    // Guarda lista de cadeias
    const [chains, setChains] = useState([]);
    const [selectedChain, setSelectedChain] = useState(null);  // Store the chain being edited

    const [newChain, setNewChain] = useState({ chainTag: "", chainName: "" });

    // Indica o loading enquanto carrega cadeias
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchChains();
    }, []);

    // Função para buscar cadeias á API
    const fetchChains = async () => {
        try {
            const res = await fetch("/api/chains");
            if (!res.ok) throw new Error("Failed to fetch chains");
            const data = await res.json();
            setChains(data);
        } catch (error) {
            console.error("Error fetching chains:", error);
        }
    };

    // Função para abrir o modal de adicionar cadeia
    const onOpen = () => setIsOpen(true);

    // Função para fechar o modal de adicionar cadeia
    const onClose = () => setIsOpen(false);

    // Function to open the edit modal and set the selected chain
    const onEditOpen = (chain) => {
        setSelectedChain(chain);
        setEditIsOpen(true);
    };

    // Função para fechar o modal de edição
    const onEditClose = () => {
        setSelectedChain(null);
        setEditIsOpen(false);
    };

    // HandleInputChange para o form de criação de cadeias
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewChain((prev) => ({ ...prev, [name]: value }));
    };

    // Handle input change for editing chain name
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedChain((prev) => ({ ...prev, [name]: value }));
    };

    // adição de uma cadeia nova
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

            // Busca cadeias na API
            await fetchChains();

            // Fecha modal e faz reset ao Form depois de adicionar uma nova chain
            setNewChain({ chainTag: "", chainName: "" });
            onClose();
        } catch (error) {
            console.error("Error adding chain:", error);
        } finally {
            setLoading(false);
        }
    };

    //Função para atualizar o nome da cadeia
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

            // Faz refresh á lista de cadeias existentes
            await fetchChains();

            //Fecha o modal e dá reset ao nome da cadeia
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

    return (
        <div className="p-4">
            {/* Header c/ botão de adicionar */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">All Chains</h2>
                {/* Directly open the Add Chain modal when clicking the + button */}
                <button
                    className="bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded"
                    onClick={onOpen}
                >
                    <Plus size={25} />
                </button>
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
                    {chains.length > 0 ? (
                        chains.map((chain) => (
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
            </div>
        </div>
    );
};

export default ChainsTable;
