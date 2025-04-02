'use client';

import { useState, useEffect } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
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
} from '@nextui-org/react';

const ProfilesTable = () => {
    const { isOpen: isAddProfileModalOpen, onOpen: onOpenAddProfileModal, onClose: onCloseAddProfileModal } = useDisclosure();
    const { isOpen: isEditProfileModalOpen, onOpen: onOpenEditProfileModal, onClose: onCloseEditProfileModal } = useDisclosure();

    const [profiles, setProfiles] = useState([]);
    const [properties, setProperties] = useState([]);
    const [currentProfile, setCurrentProfile] = useState(null); // Holds the profile to edit
    const [newProfile, setNewProfile] = useState({
        firstName: '',
        secondName: '',
        email: '',
        password: '',
        propertyIDs: [],
        propertyTags: [],
    });

    // Busca todos os perfis
    const fetchProfiles = async () => {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            setProfiles(data.users || data);
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    };

    // Busca todas as propriedades
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

    // Handle Input change para adicionar e editar perfis
    const handleInputChange = (e) => {
        setNewProfile({
            ...newProfile,
            [e.target.name]: e.target.value
        });
    };


    const propertyOptions = properties.map(property => ({
        value: property.propertyID,
        label: `${property.propertyName} (${property.propertyTag})`,
        tag: property.propertyTag
    }));

    const handlePropertyChange = (selectedOptions) => {
        // Extrair os IDs e tags das opções selecionadas
        const selectedIDs = selectedOptions.map(option => option.value);
        const selectedTags = selectedOptions.map(option => option.tag);


        setNewProfile(prevProfile => ({
            ...prevProfile,
            propertyIDs: selectedIDs,
            propertyTags: selectedTags,
        }));
    };


    // Guardar perfil
    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        try {
            if (currentProfile) {

                const response = await fetch(`/api/user/${currentProfile.userID}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProfile),
                });

                if (!response.ok) throw new Error("Failed to edit profile");

                onCloseEditProfileModal();
            } else {

                const response = await fetch('/api/user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProfile),
                });

                if (!response.ok) throw new Error("Failed to add profile");
                onCloseAddProfileModal();
            }



            fetchProfiles(); // Busca perfis depois de adicionar/editar perfis
        } catch (error) {
            console.error("Error with profile:", error);
        }
    };


    // Abre o modal e insere os dados do perfil escolhido
    const openEditModal = (profile) => {
        setCurrentProfile(profile); // Guarda o perfil a ser editado
        setNewProfile({
            firstName: profile.firstName,
            secondName: profile.secondName,
            email: profile.email,
            password: '',
            propertyIDs: profile.propertyIDs || [],
            propertyTags: profile.propertyTags || [],
        });
        onOpenEditProfileModal();
    };



    const handleCloseAddProfileModal = () => {
        setNewProfile({
            firstName: '',
            secondName: '',
            email: '',
            password: '',
            propertyIDs: [],
            propertyTags: [],
        });
        onCloseAddProfileModal();
    };


    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">All Profiles</h2>
                <Button
                    onClick={onOpenAddProfileModal}
                    className="bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded"
                >
                    <Plus size={25} />
                </Button>
            </div>


            {/* Modal de adição de perfil */}
            <Modal isOpen={isAddProfileModalOpen} onOpenChange={handleCloseAddProfileModal} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                                <div className="text-xl font-bold text-white">New Property</div>
                                <button
                                    type="button"
                                    onClick={handleCloseAddProfileModal}
                                    className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                                >
                                    &times;
                                </button>
                            </ModalHeader>
                            <ModalBody className="py-5 px-6 bg-white">
                                <form id="addProfileForm" onSubmit={handleSubmitProfile} className="space-y-6">
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
                                        <Select
                                            id="propertyIDs"
                                            name="propertyIDs"
                                            options={propertyOptions}
                                            value={propertyOptions.filter(option => newProfile.propertyIDs.includes(option.value))}
                                            onChange={handlePropertyChange}
                                            isMulti
                                            isSearchable
                                        />
                                    </div>
                                </form>
                            </ModalBody>
                            <ModalFooter className="border-t border-gray-200 pt-2 px-8 bg-[#FAFAFA]">
                                <Button onPress={handleCloseAddProfileModal} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
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

            {/* Modal de edição de perfil */}
            <Modal isOpen={isEditProfileModalOpen} onOpenChange={onCloseEditProfileModal} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                                <div className="text-xl font-bold text-white">Edit Profile</div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                                >
                                    &times;
                                </button>
                            </ModalHeader>
                            <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                                <form id="editProfileForm" onSubmit={handleSubmitProfile} className="space-y-6">
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
                                            />
                                        </div>
                                    ))}

                                    {/* Seleção de propriedades*/}
                                    <div>
                                        <label htmlFor="propertyIDs" className="block text-sm font-medium text-[#191919] mb-1">
                                            Select Properties
                                        </label>
                                        <Select
                                            id="propertyIDs"
                                            name="propertyIDs"
                                            options={propertyOptions}
                                            value={propertyOptions.filter(option => newProfile.propertyIDs.includes(option.value))}
                                            onChange={handlePropertyChange}
                                            isMulti
                                            isSearchable
                                        />
                                    </div>
                                </form>
                            </ModalBody>
                            <ModalFooter className="border-t border-[#EDEBEB] bg-[#FAFAFA] pt-2 px-8">
                                <Button onPress={onClose} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
                                    Cancel
                                </Button>
                                <Button type="submit" form="editProfileForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition">
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
                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">ID</th>
                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">First Name</th>
                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">Last Name</th>
                        <th className="border border-[#EDEBEB] px-4 py-2 text-left">Email</th>
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
                                            <DropdownItem key="edit" onPress={() => openEditModal(profile)}>
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
