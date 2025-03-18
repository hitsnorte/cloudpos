"use client";

import { useState } from "react";
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

const properties = [
    { id: 1, propertyTag: "PROP-001", name: "Ocean View Villa" },
    { id: 2, propertyTag: "PROP-002", name: "Mountain Retreat" },
    { id: 3, propertyTag: "PROP-003", name: "City Apartment" },
];

const PropertiesTable = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [newProperty, setNewProperty] = useState({ propertyTag: "", name: "" });

    const handleInputChange = (e) => {
        setNewProperty({ ...newProperty, [e.target.name]: e.target.value });
    };

    const handleAddProperty = (e) => {
        e.preventDefault();
        console.log("New property added:", newProperty);
        setNewProperty({ propertyTag: "", name: "" });
        onClose();
    };

    return (
        <div className="p-4">
            {/* Header */}
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
                        <DropdownItem key="add" onPress={onOpen}>
                            Add Property
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            {/* Form de adicionar properties */}
            <Modal isOpen={isOpen} onOpenChange={onClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="rounded bg-[#FC9D25] flex justify-left items-left">
                                <div className="text-xl flex justify-left items-left font-bold text-white">
                                    New Property
                                </div>
                            </ModalHeader>
                            <ModalBody className="py-5 px-6 bg-white">
                                <form id="addPropertyForm" onSubmit={handleAddProperty} className="space-y-6">
                                    <div>
                                        <label htmlFor="propertyTag" className="block text-sm font-medium text-gray-400 mb-1">
                                            Property Tag
                                        </label>
                                        <input
                                            id="propertyTag"
                                            type="text"
                                            name="propertyTag"
                                            value={newProperty.propertyTag}
                                            onChange={handleInputChange}
                                            className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="propertyName" className="block text-sm font-medium text-gray-400 mb-1">
                                            Name
                                        </label>
                                        <input
                                            id="propertyName"
                                            type="text"
                                            name="name"
                                            value={newProperty.name}
                                            onChange={handleInputChange}
                                            className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                            required
                                        />
                                    </div>
                                </form>
                            </ModalBody>
                            <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
                                <Button onPress={onClose} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition duration-200">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    form="addPropertyForm"
                                    className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 font-medium transition duration-200"
                                >
                                    Save
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Tabela */}
            <div className="overflow-x-auto sm:flex sm:flex-col bg-muted/40 mt-10">
                <table className="min-w-full bg-[#FAFAFA] border-collapse border border-[#EDEBEB] mx-auto">
                    <thead>
                    <tr>
                        <th className="border border-[#EDEBEB] px-5 py-4 bg-[#FC9D25] text-white">
                            <FaGear size={20} />
                        </th>
                        <th className="border border-[#EDEBEB] px-5 py-4 bg-[#FC9D25] text-white">ID</th>
                        <th className="border border-[#EDEBEB] px-5 py-4 bg-[#FC9D25] text-white">Property Tag</th>
                        <th className="border border-[#EDEBEB] px-5 py-4 bg-[#FC9D25] text-white">Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {properties.map((property) => (
                        <tr key={property.id} className="hover:bg-gray-100">
                            <td className="border border-[#EDEBEB] px-3 py-2 text-center">
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button variant="bordered">
                                            <HiDotsVertical size={18} />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Actions" className="bg-white shadow-lg rounded-md p-1">
                                        <DropdownItem key="edit">Edit</DropdownItem>
                                        <DropdownItem key="delete" className="text-danger">
                                            Delete
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </td>
                            <td className="border border-[#EDEBEB] px-4 py-2 text-right">{property.id}</td>
                            <td className="border border-[#EDEBEB] px-4 py-2 text-left">{property.propertyTag}</td>
                            <td className="border border-[#EDEBEB] px-4 py-2 text-left">{property.name}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PropertiesTable;
