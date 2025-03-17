"use client";

import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";

const properties = [
    { id: 1, propertyTag: "PROP-001", name: "Ocean View Villa" },
    { id: 2, propertyTag: "PROP-002", name: "Mountain Retreat" },
    { id: 3, propertyTag: "PROP-003", name: "City Apartment" },
];

const PropertiesTable = () => {
    return (
        <div className="p-4">
            <Dropdown>
                <DropdownTrigger>
                    <button className="absolute top-4 right-10 bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded">
                        <Plus size={25} />
                    </button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Actions" className="bg-white shadow-lg rounded-md p-1" style={{ marginLeft: '80px' }}>
                    <DropdownItem key="add">Adicionar</DropdownItem>
                </DropdownMenu>
            </Dropdown>

            <div className="overflow-x-auto sm:flex sm:flex-col bg-muted/40">
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
                                        <DropdownItem key="edit">Editar</DropdownItem>
                                        <DropdownItem key="delete" className="text-danger">Excluir</DropdownItem>
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
