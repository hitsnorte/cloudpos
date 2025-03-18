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
    const [newProperty, setNewProperty] = useState({ propertyTag: "", propertyName: ""  , propertyServer: "" , propertyPort:"" , mpeHotel: ""});

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
        fetchProperties();
    }, []);

    const handleInputChange = (e) => {
        setNewProperty({ ...newProperty, [e.target.name]: e.target.value });
    };

    const handleAddProperty = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProperty),
            });

            const createdProperty = await response.json();
            console.log("Created Property:", createdProperty); // Debugging

            if (!response.ok) throw new Error("Failed to add property");

            setNewProperty({ propertyTag: '', propertyName: '', propertyServer: '', propertyPort: '', mpeHotel: '' });
            onClose();

            // Use functional update
            setProperties((prevProperties) => [...prevProperties, createdProperty]);

            // Delay re-fetch to ensure data is stored
            setTimeout(async () => {
                const updatedPropertiesResponse = await fetch("/api/properties");
                const updatedProperties = await updatedPropertiesResponse.json();
                setProperties(updatedProperties);
            }, 500);

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
                            <ModalHeader className="rounded bg-[#FC9D25] flex justify-left items-left">
                                <div className="text-xl flex justify-left items-left font-bold text-white">New Property</div>
                            </ModalHeader>
                            <ModalBody className="py-5 px-6 bg-white">
                                <form id="addPropertyForm" onSubmit={handleAddProperty} className="space-y-6">
                                    {["propertyTag", "propertyName", "propertyServer", "propertyPort" , "mpeHotel"].map((field, index) => (
                                        <div key={index}>
                                            <label htmlFor={field} className="block text-sm font-medium text-[#191919] mb-1">
                                                {field.charAt(0).toUpperCase() + field.slice(1)}
                                            </label>
                                            <input
                                                id={field}
                                                type={field === "password" ? "password" : "text"}
                                                name={field}
                                                value={newProperty[field]}
                                                onChange={handleInputChange}
                                                className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                                required
                                            />
                                        </div>
                                    ))}
                                </form>
                            </ModalBody>
                            <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
                                <Button onPress={onClose} className="px-6 py-2 text-[#191919] rounded-md hover:bg-gray-100 transition duration-200">Cancel</Button>
                                <Button type="submit" form="addPropertyForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 font-medium transition duration-200">Save</Button>
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
                    {properties.map((property) => (
                        <tr key={property.id || property.propertyTag} className="hover:bg-gray-100">
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