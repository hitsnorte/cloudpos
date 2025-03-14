"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@heroui/react";
import { GoGear } from "react-icons/go";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";

// Static table data
const rows = [
    { key: "1", id: "1", nome: "Family A" },
    { key: "2", id: "2", nome: "Family B" },
    { key: "3", id: "3", nome: "Family C" },
    { key: "4", id: "4", nome: "Family D" },
];

export default function App() {
    const [openDropdown, setOpenDropdown] = useState(null);

    // Toggle dropdown for a specific row
    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".dropdown-container")) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative p-4">
            {/* Title and Add Button */}
            <div className="absolute top-0 left-0 flex justify-between w-full p-2">
                <span className="text-lg font-bold">All families</span>
                <button className=" bg-[#FC9D25] text-white p-2 shadow-md hover:bg-[#e68c20]">
                    <FiPlus size={20} />
                </button>
            </div>

            {/* Table */}
            <Table
                id="TableToPDF"
                isHeaderSticky="true"
                layout="fixed"
                isCompact="true"
                removeWrapper
                classNames={{
                    wrapper: "min-h-[222px]",
                }}
                className="h-full overflow-auto border border-gray-300 bg-white shadow-md mt-10"
            >
                <TableHeader>
                    <TableColumn className="bg-[#FC9D25] text-white font-bold w-[40px] uppercase px-4 py-2">
                        <GoGear size={25} />
                    </TableColumn>
                    <TableColumn className="bg-[#FC9D25] text-white font-bold w-[40px] uppercase px-4 py-2 text-center">
                        ID
                    </TableColumn>
                    <TableColumn className="bg-[#FC9D25] text-white font-bold uppercase px-6 py-2 text-left">
                        Name
                    </TableColumn>
                </TableHeader>

                <TableBody>
                    {rows.map((item) => (
                        <TableRow key={item.key} className="border-b border-gray-300">
                            {/* Gear Icon + Dropdown */}
                            <TableCell className="relative flex justify-center items-center px-4 py-2 border border-gray-300">
                                <div className="relative dropdown-container">
                                    <button
                                        className="bg-transparent text-[#191919] flex items-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleDropdown(item.id);
                                        }}
                                    >
                                        <BsThreeDotsVertical size={20} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {openDropdown === item.id && (
                                        <div className="absolute left-0 mt-2 w-32 bg-white border shadow-lg rounded-md z-50">
                                            <button
                                                onClick={() => {
                                                    alert(`Edit ${item.id}`);
                                                    setOpenDropdown(null);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    alert(`Delete ${item.id}`);
                                                    setOpenDropdown(null);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </TableCell>

                            {/* ID Column */}
                            <TableCell className="text-center px-4 py-2 border border-gray-300">
                                {item.id}
                            </TableCell>

                            {/* Name Column (Adjusted Alignment) */}
                            <TableCell className="px-6 py-2 border border-gray-300 text-left">
                                {item.nome}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
