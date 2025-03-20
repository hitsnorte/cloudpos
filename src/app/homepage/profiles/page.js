'use client';

import { useState, useEffect } from 'react';
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
} from '@nextui-org/react';

const ProfilesTable = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [profiles, setProfiles] = useState([]);
    const [properties, setProperties] = useState([]);
    const [newProfile, setNewProfile] = useState({
        firstName: '',
        secondName: '',
        email: '',
        password: '',
        propertyIDs: [],
        propertyTags: [],
    });

    // Fetch all profiles
    const fetchProfiles = async () => {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            setProfiles(data.users || data);
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    };

    // Fetch all properties
    const fetchProperties = async () => {
        try {
            const response = await fetch('/api/properties');

            const data = await response.json();
            setProperties(data || []);
        } catch (error) {
            console.error("Error fetching properties:", error);
        }
    };

    useEffect(() => {
        fetchProfiles();
        fetchProperties();
    }, []);

    const handleInputChange = (e) => {
        setNewProfile({
            ...newProfile,
            [e.target.name]: e.target.value
        });
    };

    const handlePropertyChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions);
        const selectedIDs = selectedOptions.map(option => option.value);
        const selectedTags = selectedOptions.map(option => option.dataset.tag);

        setNewProfile(prevProfile => ({
            ...prevProfile,
            propertyIDs: [...new Set([...prevProfile.propertyIDs, ...selectedIDs])], // Avoid duplicates
            propertyTags: [...new Set([...prevProfile.propertyTags, ...selectedTags])],
        }));
    };


    const handleAddProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProfile),
            });

            if (!response.ok) throw new Error("Failed to add profile");

            setNewProfile({ firstName: '', secondName: '', email: '', password: '', propertyIDs: [], propertyTags: [] });

            fetchProfiles();
            onClose();
        } catch (error) {
            console.error("Error adding profile:", error);
        }
    };

    useEffect(()=> {
        console.log("Property IDs:" , newProfile.propertyIDs);
    }, [newProfile.propertyIDs]);

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">All Profiles</h2>
                <Dropdown>
                    <DropdownTrigger>
                        <button className="bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded">
                            <Plus size={25} />
                        </button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Actions" className="bg-white shadow-lg rounded-md p-1">
                        <DropdownItem key="add" onPress={onOpen}>Add Profile</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            {/* Modal de adição de perfil */}
            <Modal isOpen={isOpen} onOpenChange={onClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="rounded bg-[#FC9D25] flex justify-start items-center">
                                <div className="text-xl font-bold text-white">New Profile</div>
                            </ModalHeader>
                            <ModalBody className="py-5 px-6 bg-white">
                                <form id="addProfileForm" onSubmit={handleAddProfile} className="space-y-6">
                                    {["firstName", "secondName", "email", "password"].map((field, index) => (
                                        <div key={index}>
                                            <label htmlFor={field} className="block text-sm font-medium text-[#191919] mb-1">
                                                {field.charAt(0).toUpperCase() + field.slice(1)}
                                            </label>
                                            <input
                                                id={field}
                                                type={field === "password" ? "password" : "text"}
                                                name={field}
                                                value={newProfile[field]}
                                                onChange={handleInputChange}
                                                className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                                required
                                            />
                                        </div>
                                    ))}

                                    {/* Seleção de propriedades*/}
                                    <div>
                                        <label htmlFor="propertyIDs" className="block text-sm font-medium text-[#191919] mb-1">
                                            Select Properties
                                        </label>
                                        <select
                                            id="propertyIDs"
                                            name="propertyIDs"
                                            multiple
                                            value={newProfile.propertyIDs}
                                            onChange={handlePropertyChange}
                                            required
                                            className="w-full p-2 border rounded"
                                        >
                                            {properties.map((property, index) => (
                                                <option
                                                    key={property.propertyID || `property-${index}`}
                                                    value={property.propertyID}
                                                    data-tag={property.propertyTag}
                                                >
                                                    {property.propertyName} ({property.propertyTag})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </form>
                            </ModalBody>
                            <ModalFooter className="border-t border-gray-200 pt-2 px-8">
                                <Button onPress={onClose} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
                                    Cancel
                                </Button>
                                <Button type="submit" form="addProfileForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition">
                                    Save
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
                        <th className="border border-[#EDEBEB] px-4 py-2">ID</th>
                        <th className="border border-[#EDEBEB] px-4 py-2">First Name</th>
                        <th className="border border-[#EDEBEB] px-4 py-2">Last Name</th>
                        <th className="border border-[#EDEBEB] px-4 py-2">Email</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                    {profiles.length > 0 ? (
                        profiles.map((profile, index) => (
                            <tr key={profile.id || `profile-${index}`} className="hover:bg-gray-100">
                                <td className="border border-[#EDEBEB] w-[50px] px-2 py-2 text-center">
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button variant="bordered" className="p-1">
                                                <HiDotsVertical size={18} />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu aria-label="Actions" className="bg-white shadow-lg rounded-md p-1">
                                            <DropdownItem key="edit" onPress={() => console.log("Edit profile:", profile)}>
                                                Edit
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </td>
                                <td className="border border-[#EDEBEB] px-4 py-2">{profile.userID}</td>
                                <td className="border border-[#EDEBEB] px-4 py-2">{profile.firstName}</td>
                                <td className="border border-[#EDEBEB] px-4 py-2">{profile.secondName}</td>
                                <td className="border border-[#EDEBEB] px-4 py-2">{profile.email}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-4 text-gray-500">No profiles found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProfilesTable;
