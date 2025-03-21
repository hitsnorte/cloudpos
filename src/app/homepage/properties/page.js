"use client";

import { useState, useEffect } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
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

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch("/api/properties");
                if (!response.ok) throw new Error("Failed to fetch properties");
                const data = await response.json();
                setProperties(data);
            } catch (error) {
                console.error("Error fetching properties:", error);
            }
        };

        //Busca todas as cadeias
        const fetchChains = async () => {
            try {
                const response = await fetch("/api/chains");
                if (!response.ok) throw new Error("Failed to fetch chains");
                const data = await response.json();
                setChains(data);
            } catch (error) {
                console.error("Error fetching chains:", error);
            }
        };

        fetchProperties();
        fetchChains();
    }, []);

    const handleInputChange = (event) => {
        const { name, value, options } = event.target;

        if (options) {
            // Se existirem opções são um elemento do select
            const selectedValues = Array.from(options)
                .filter(option => option.selected)
                .map(option => option.value);

            setNewProperty((prev) => ({
                ...prev,
                propertyChain: selectedValues, // garante que a chain é guardada como um array
            }));
        } else {

            setNewProperty((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    //adiciona propriedades
    const handleAddProperty = async (e) => {
        e.preventDefault();

        console.log("Sending new property data:", newProperty);

        if (!newProperty.propertyChain || newProperty.propertyChain.length === 0) {
            alert("Please select a chain before creating the property.");
            return;
        }

        const formattedProperty = {
            ...newProperty,
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
                propertyChain: '',
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


    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">All Properties</h2>
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

            <Modal isOpen={isOpen} onOpenChange={onClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="rounded bg-[#FC9D25] flex justify-start items-center">
                                <div className="text-xl font-bold text-white">New Property</div>
                            </ModalHeader>
                            <ModalBody className="py-5 px-6 bg-white">
                                <form id="addPropertyForm" onSubmit={handleAddProperty} className="space-y-6">
                                    {['propertyTag', 'propertyName', 'propertyServer', 'propertyPort', 'mpeHotel'].map((field, index) => (
                                        <div key={index}>
                                            <label htmlFor={field} className="block text-sm font-medium text-[#191919] mb-1">
                                                {field.charAt(0).toUpperCase() + field.slice(1)}
                                            </label>
                                            <input
                                                id={field}
                                                type="text"
                                                name={field}
                                                value={newProperty[field]}
                                                onChange={handleInputChange}
                                                className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                                required
                                            />
                                        </div>
                                    ))}

                                    {/* Seleção de cadeias */}
                                    <div>
                                        <label htmlFor="propertyChain" className="block text-sm font-medium text-[#191919] mb-1">
                                            Select Property Chain
                                        </label>
                                        <select
                                            id="propertyChain"
                                            name="propertyChain"
                                            multiple
                                            value={Array.isArray(newProperty.propertyChain) ? newProperty.propertyChain : []}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full p-2 border rounded"
                                        >
                                            {chains.map((chain, index) => (
                                                <option key={chain.chainTag || `chain-${index}`} value={chain.chainTag}>
                                                    {chain.chainName} ({chain.chainTag})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </form>
                            </ModalBody>
                            <ModalFooter className="border-t border-gray-200 pt-2 px-8">
                                <Button onPress={onClose} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">Cancel</Button>
                                <Button type="submit" form="addPropertyForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition">Save</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>


            <div className="overflow-x-auto sm:flex sm:flex-col bg-muted/40 mt-10">
                <table className="min-w-full bg-[#FAFAFA] border-collapse border border-[#EDEBEB] mx-auto">
                    <thead>
                    <tr>
                        <th className="border border-[#EDEBEB] px-5 py-4 bg-[#FC9D25] text-white"><FaGear size={20} /></th>
                        <th className="border border-[#EDEBEB] px-5 py-4 bg-[#FC9D25] text-white">ID</th>
                        <th className="border border-[#EDEBEB] px-5 py-4 bg-[#FC9D25] text-white">Property Tag</th>
                        <th className="border border-[#EDEBEB] px-5 py-4 bg-[#FC9D25] text-white">Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {properties.map((property, index) => (
                        <tr key={property.id ?? `property-${index}`} className="hover:bg-gray-100">
                            <td className="border border-[#EDEBEB] px-3 py-2 text-center">
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button variant="bordered">
                                            <HiDotsVertical size={18} />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Actions" className="bg-white shadow-lg rounded-md p-1">
                                        <DropdownItem key="edit">Edit</DropdownItem>
                                        <DropdownItem key="delete" className="text-danger">Delete</DropdownItem>
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
        </div>
    );
};

export default PropertiesTable;
