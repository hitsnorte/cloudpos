"use client";

import { useState, useEffect } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { Plus } from "lucide-react";
import Select from "react-select";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@nextui-org/react";

const PropertiesTable = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    const [deleteConfirmationName, setDeleteConfirmationName] = useState('');
    const [propertyToDelete, setPropertyToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput , setSearchInput] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [currentPage , setCurrentPage] = useState(1);
    const [properties, setProperties] = useState([]);
    const [chains, setChains] = useState([]);
    const [newProperty, setNewProperty] = useState({
        propertyTag: "",
        propertyName: "",
        propertyServer: "",
        propertyPort: "",
        mpeHotel: "",
        propertyChain: "",
    });

    const totalPages = Math.ceil(properties.length / itemsPerPage);

    const [editingProperty, setEditingProperty] = useState(null);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch("/api/properties");
                if (!response.ok) throw new Error("Failed to fetch properties");
                setProperties(await response.json());
            } catch (error) {
                console.error("Error fetching properties:", error);
            }
        };

        const fetchChains = async () => {
            try {
                const response = await fetch("/api/chains");
                if (!response.ok) throw new Error("Failed to fetch chains");
                setChains(await response.json());
            } catch (error) {
                console.error("Error fetching chains:", error);
            }
        };

        fetchProperties();
        fetchChains();
    }, []);



    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewProperty((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const chainOptions = chains.map (chain => ({
        value:chain.chainTag,
        label: `${chain.chainName}(${chain.chainTag})`,
    }));

    //adiciona propriedades
    const handleAddProperty = async (e) => {
        e.preventDefault();

        console.log("Sending new property data:", newProperty);

        if (!newProperty.propertyChain || newProperty.propertyChain.length === 0) {
            alert("Please select a chain before creating the property.");
            return;
        }

        // Garante que propertyChain é sempre um array , mesmo que só uma chain possa ser escolhida
        const formattedProperty = {
            ...newProperty,
            propertyChain: Array.isArray(newProperty.propertyChain) ? newProperty.propertyChain : [newProperty.propertyChain],
        };



        try {
            const response = await fetch("/api/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedProperty),
            });

            if (!response.ok) throw new Error("Failed to add property");

            const createdProperty = await response.json();
            console.log("Created Property:", createdProperty);

            setNewProperty({
                propertyTag: '',
                propertyName: '',
                propertyServer: '',
                propertyPort: '',
                mpeHotel: '',
                propertyChain: "",
            });

            onClose();

            // Busca imediatamente a lista atualizada
            const updatedPropertiesResponse = await fetch("/api/properties");
            const updatedProperties = await updatedPropertiesResponse.json();
            setProperties(updatedProperties);

        } catch (error) {
            console.error("Error adding property:", error);
        }
    };

    const handleEditClick = (property) => {
        // Encontra o objeto correto da chain correspondente ao propertyChain
        const chain = chains.find(chain => chain.chainTag === property.propertyChain?.[0]);

        console.log("Selected property:", property);
        console.log("Associated chain:", chain);

        setEditingProperty({
            ...property,
            chainID: chain ? chain.chainID : "",  // Set the chainID if found, otherwise an empty string
        });

        // Define a propriedade e o chainID para editar
        console.log("Editing property set:", {
            ...property,
            chainID: chain ? chain.chainID : "",
        });

        // Abre o modal
        onEditOpen();
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;

        setEditingProperty((prev) => ({
            ...prev,
            [name]: name === "chainID" ? parseInt(value, 10) : value,
        }));
    };

    const handleUpdateProperty = async (e) => {
        e.preventDefault();

        const formattedProperty = {
            ...editingProperty,
            propertyChain: editingProperty.propertyChain ? [editingProperty.propertyChain] : [],
        };

        console.log("Updating property with:", formattedProperty);

        try {
            const response = await fetch(`/api/properties/${editingProperty.propertyID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedProperty),
            });

            if (!response.ok) throw new Error("Failed to update property");

            const updatedPropertiesResponse = await fetch("/api/properties");
            setProperties(await updatedPropertiesResponse.json());
            onEditClose();
        } catch (error) {
            console.error("Error updating property:", error);
        }
    };

    const handleCloseModal = () => {
        setNewProperty({
            propertyTag: "",
            propertyName: "",
            propertyServer: "",
            propertyPort: "",
            mpeHotel: "",
            propertyChain: "",
        });
        onClose();
    };

    const filteredProperties = properties.filter((property) =>
        property.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedProperties = filteredProperties.sort((a, b) =>
        a.propertyName.localeCompare(b.propertyName)
    );


    const paginatedProperties = sortedProperties.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const handleDeleteClick = (property) => {
        setPropertyToDelete(property);
        onDeleteOpen(); // Abre o modal para confirmação do delete da propriedade
    };

    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    const handleDeleteConfirmation = async () => {
        if (deleteConfirmationName !== propertyToDelete.propertyName) {
            alert("The property name doesn't match!");
            return;
        }

        try {
            const response = await fetch(`/api/properties/${propertyToDelete.propertyID}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete property');

            // Remove deleted property from the state
            setProperties(properties.filter((property) => property.propertyID !== propertyToDelete.propertyID));

            // Close the modal
            onDeleteClose();
        } catch (error) {
            console.error('Error deleting property:', error);
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">All properties</h2>

                <div className="flex items-center gap-2">
                    <button
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
                            <DropdownItem key="add" onPress={onOpen}>Add Property</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>

            <div className="flex mb-4 items-center gap-2">
                <input
                    type="text"
                    placeholder="Search by property name..."
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

            {/* Modal de adição de propriedades*/}
            <Modal isOpen={isOpen} onOpenChange={onClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                                <div className="text-xl font-bold text-white">New Property</div>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                                >
                                    &times;
                                </button>
                            </ModalHeader>
                            <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                                <form id="addPropertyForm" onSubmit={handleAddProperty} className="space-y-6">
                                    {['propertyTag', 'propertyName', 'propertyServer', 'propertyPort', 'mpeHotel'].map((field, index) => (
                                        <div key={index}>
                                            <label htmlFor={field} className="block text-sm font-medium text-[#191919] mb-1">
                                                {field.charAt(0).toUpperCase() + field.slice(1)}
                                            </label>

                                            {field === 'propertyTag' ? (
                                                <textarea
                                                    id={field}
                                                    name={field}
                                                    value={newProperty[field]}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 resize-none"
                                                />
                                            ) : (
                                                <input
                                                    id={field}
                                                    type="text"
                                                    name={field}
                                                    value={newProperty[field]}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                                    required
                                                />
                                            )}
                                        </div>
                                    ))}


                                    {/* Seleção de cadeias */}
                                    <div>
                                        <label htmlFor="propertyChain" className="block text-sm font-medium text-[#191919] mb-1">
                                            Select Property Chain
                                        </label>
                                        <Select
                                            id="propertyChain"
                                            name="propertyChain"
                                            options={chainOptions}
                                            value={chainOptions.find(option => option.value === newProperty.propertyChain) || ""}
                                            onChange={(selectedOption) =>
                                                setNewProperty((prev) => ({
                                                    ...prev,
                                                    propertyChain: selectedOption ? selectedOption.value : "", //guarda apenas 1 valor
                                                }))
                                            }
                                            isSearchable
                                            className="w-full"
                                            classNamePrefix="select"
                                        />
                                    </div>
                                </form>
                            </ModalBody>
                            <ModalFooter className="border-t border-[#EDEBEB] bg-[#FAFAFA] pt-2 px-8">
                                <Button onPress={handleCloseModal} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">Cancel</Button>
                                <Button type="submit" form="addPropertyForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition">Save</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Modal de delete */}
            <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                        <div className="text-xl font-bold text-white">Confirm Delete</div>
                        <button
                            type="button"
                            onClick={onDeleteClose}
                            className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                        >
                            &times;
                        </button>
                    </ModalHeader>
                    <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                        <p className="text-[#191919]">To confirm the deletion of this property, please type its name:</p>
                        <input
                            type="text"
                            value={deleteConfirmationName}
                            onChange={(e) => setDeleteConfirmationName(e.target.value)}
                            placeholder="Property name"
                            className="w-full p-2 bg-gray-200 rounded mt-2"
                        />
                    </ModalBody>
                    <ModalFooter className="border-t border-[#EDEBEB] bg-[#FAFAFA] pt-2 px-8">
                        <Button onPress={onDeleteClose} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">Cancel</Button>
                        <Button onPress={handleDeleteConfirmation} className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition">Delete</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>


            {/* Tabela */}
            <div className="overflow-x-auto sm:flex sm:flex-col bg-muted/40 mt-10">
                <table className="min-w-full bg-[#FAFAFA] border-collapse border border-[#EDEBEB] mx-auto">
                    <thead>
                    <tr>
                        <th className="border border-[#EDEBEB] w-[50px] px-5 py-4 bg-[#FC9D25] text-white"><FaGear size={20} /></th>
                        <th className="border border-[#EDEBEB] px-5 py-4 bg-[#FC9D25] text-white text-left">ID</th>
                        <th className="border border-[#EDEBEB] px-5 py-4 bg-[#FC9D25] text-white text-left">Property Tag</th>
                        <th className="border border-[#EDEBEB] px-5 py-4 bg-[#FC9D25] text-white text-left">Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedProperties.map((property, index) => (
                        <tr key={property.id ?? `property-${index}`} className="hover:bg-gray-100">
                            <td className="border border-[#EDEBEB] px-3 py-2 text-center">
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button variant="bordered">
                                            <HiDotsVertical size={18} />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Actions" className="bg-white shadow-lg rounded-md p-1">
                                        <DropdownItem key="edit" onPress={() => handleEditClick(property)}>Edit</DropdownItem>
                                        <DropdownItem key="delete" className="text-danger" onClick={()=> handleDeleteClick(property)}>Delete</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </td>
                            <td className="border border-[#EDEBEB] px-4 py-2 text-right">{property.propertyID}</td>
                            <td className="border border-[#EDEBEB] px-4 py-2 text-left">{property.propertyTag}</td>
                            <td className="border border-[#EDEBEB] px-4 py-2 text-left">{property.propertyName}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

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
            </div>

            {/* Modal de edição de propriedade */}
            <Modal isOpen={isEditOpen} onOpenChange={onEditClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    {(onEditClose) => (
                        <>
                            <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                                <div className="text-xl font-bold text-white">Edit Property</div>
                                <button
                                    type="button"
                                    onClick={onEditClose}
                                    className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                                >
                                    &times;
                                </button>
                            </ModalHeader>

                            <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                                {editingProperty && (
                                    <form id="editPropertyForm" onSubmit={handleUpdateProperty} className="space-y-6">
                                        {['propertyName', 'propertyServer', 'propertyPort', 'mpeHotel'].map((field, index) => (
                                            <div key={index}>
                                                <label htmlFor={field} className="block text-sm font-medium text-[#191919] mb-1">
                                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                                </label>
                                                <input
                                                    id={field}
                                                    type="text"
                                                    name={field}
                                                    value={editingProperty[field] || ""}
                                                    onChange={handleEditChange}
                                                    className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                                    required
                                                />
                                            </div>
                                        ))}

                                        <div>
                                            <label htmlFor="chainID" className="block text-sm font-medium text-[#191919] mb-1">
                                                Select Property Chain
                                            </label>
                                            <Select
                                                id="chainID"
                                                name="chainID"
                                                options={chains.map((chain) => ({
                                                    value: chain.chainID,
                                                    label: chain.chainName, // Adjust this if necessary
                                                }))}
                                                // Ensure the selected value matches the chainID in editingProperty
                                                value={chains.find(chain => chain.chainID === editingProperty.chainID) || null}
                                                onChange={(selectedOption) =>
                                                    setEditingProperty((prev) => ({
                                                        ...prev,
                                                        chainID: selectedOption ? selectedOption.value : "",
                                                    }))
                                                }
                                                isSearchable
                                                className="w-full"
                                                classNamePrefix="select"
                                            />
                                        </div>
                                    </form>
                                )}
                            </ModalBody>

                            <ModalFooter className="border-t border-[#EDEBEB] bg-[#FAFAFA] pt-2 px-8">
                                <Button onPress={onEditClose} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">Cancel</Button>
                                <Button type="submit" form="editPropertyForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition">Update</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default PropertiesTable;
