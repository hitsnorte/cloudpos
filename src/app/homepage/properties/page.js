"use client";

import { useState, useEffect } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
import Select from "react-select";
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
    DropdownItem,
    useDisclosure
} from "@nextui-org/react";
import CustomPagination from "@/src/components/table/page";

const PropertiesTable = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    const [properties, setProperties] = useState([]);
    const [chains, setChains] = useState([]); // Added for chain options
    const [selectedProperty, setSelectedProperty] = useState(null);

    const [newProperty, setNewProperty] = useState({
        propertyTag: "",
        propertyName: "",
        propertyServer: "",
        propertyPort: "",
        mpeHotel: "",
        propertyChain: "",
    });

    const [loading, setLoading] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        fetchProperties();
        fetchChains();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await fetch("/api/properties");
            if (!res.ok) throw new Error("Failed to fetch properties");
            const data = await res.json();
            const sortedProperties = data.sort((a, b) => a.propertyName.localeCompare(b.propertyName));
            setProperties(sortedProperties);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProperty((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedProperty((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddProperty = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formattedProperty = {
                ...newProperty,
                propertyChain: newProperty.propertyChain ? [newProperty.propertyChain] : [],
            };
            const res = await fetch("/api/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedProperty),
            });
            if (!res.ok) throw new Error("Failed to add property");
            await fetchProperties();
            setNewProperty({
                propertyTag: "",
                propertyName: "",
                propertyServer: "",
                propertyPort: "",
                mpeHotel: "",
                propertyChain: "",
            });
            onClose();
        } catch (error) {
            console.error("Error adding property:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProperty = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formattedProperty = {
                ...selectedProperty,
                propertyChain: selectedProperty.propertyChain ? [selectedProperty.propertyChain] : [],
            };
            const res = await fetch(`/api/properties/${selectedProperty.propertyID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedProperty),
            });
            if (!res.ok) throw new Error("Failed to update property");
            await fetchProperties();
            onEditClose();
        } catch (error) {
            console.error("Error updating property:", error);
        } finally {
            setLoading(false);
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

    const chainOptions = chains.map(chain => ({
        value: chain.chainTag,
        label: `${chain.chainName}(${chain.chainTag})`,
    }));

    const filteredProperties = properties.filter((property) => {
        const search = searchTerm.toLowerCase();
        return (
            (property.propertyID && String(property.propertyID).toLowerCase().includes(search)) ||
            (property.propertyTag && property.propertyTag.toLowerCase().includes(search)) ||
            (property.propertyName && property.propertyName.toLowerCase().includes(search))
        );
    });

    const paginatedProperties = filteredProperties.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

    const [editingProperty, setEditingProperty] = useState(null);

    return (
        <div className="p-4">
            {/* Header com + */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">All Properties</h2>
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
                    placeholder="Search by ID, Property Tag, or Property Name..."
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value);
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
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
                                    <div>
                                        <label htmlFor="propertyChain" className="block text-sm font-medium text-[#191919] mb-1">
                                            Select Property Chain
                                        </label>
                                        <Select
                                            id="propertyChain"
                                            name="propertyChain"
                                            options={chainOptions}
                                            value={chainOptions.find(option => option.value === newProperty.propertyChain) || null}
                                            onChange={(selectedOption) =>
                                                setNewProperty((prev) => ({
                                                    ...prev,
                                                    propertyChain: selectedOption ? selectedOption.value : "",
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

            {/* Tabela */}
            <div className="mt-5">
                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : paginatedProperties.length > 0 ? (
                    <table className="w-full text-left mb-5 min-w-full md:min-w-0 border-collapse">
                        <thead>
                        <tr className="bg-[#FC9D25] text-white h-12">
                            <td className="pl-2 pr-2 w-8 border-r border-[#e6e6e6]">
                                <FaGear size={18} color="white" />
                            </td>
                            <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6] uppercase">ID</td>
                            <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6] uppercase">Property Tag</td>
                            <td className="pl-2 pr-2 border-r border-[#e6e6e6] uppercase">Property Name</td>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedProperties.map((property, index) => (
                            <tr
                                key={property.propertyID || property.propertyTag || index}
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
                                                onPress={() => onEditOpen(property)}
                                            >
                                                Edit
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </td>
                                <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6]">{property.propertyID}</td>
                                <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6]">{property.propertyTag}</td>
                                <td className="pl-2 pr-2">{property.propertyName}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-textLabelColor">No properties available</p>
                )}
            </div>

            {/* Paginação */}
            <div className="bottom-0 w-full bg-white p-0 m-0 pagination-container">
                <CustomPagination
                    page={currentPage}
                    pages={totalPages}
                    rowsPerPage={itemsPerPage}
                    handleChangeRowsPerPage={(newSize) => {
                        setItemsPerPage(newSize);
                        setCurrentPage(1);
                    }}
                    items={paginatedProperties}
                    setPage={setCurrentPage}
                    dataCSVButton={paginatedProperties.map((item) => ({
                        ID: item.propertyID,
                        Tag: item.propertyTag,
                        Name: item.propertyName,
                    }))}
                />
            </div>
        </div>
    );
};

export default PropertiesTable;