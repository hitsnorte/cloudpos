'use client';

import { useState, useEffect } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";
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
    const { isOpen: isDeleteUserModalOpen, onOpen: onOpenDeleteUserModal, onClose: onCloseDeleteUserModal } = useDisclosure();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState(''); // Added state for search input value
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteConfirmationEmail, setDeleteConfirmationEmail] = useState('');
    const [userToDelete, setUserToDelete] = useState(null);
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

    const totalPages = Math.ceil(profiles.length / itemsPerPage);

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

    // Handle input changes to add/edit profiles
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
        const selectedIDs = selectedOptions.map(option => option.value);
        const selectedTags = selectedOptions.map(option => option.tag);

        setNewProfile(prevProfile => ({
            ...prevProfile,
            propertyIDs: selectedIDs,
            propertyTags: selectedTags,
        }));
    };

    // Save profile (Add or Edit)
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

            fetchProfiles(); // Re-fetch profiles after adding/editing
        } catch (error) {
            console.error("Error with profile:", error);
        }
    };

    const openEditModal = (profile) => {
        setCurrentProfile(profile); // Store profile to be edited
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

    const openAddModal = () => {
        setNewProfile({
            firstName: '',
            secondName: '',
            email: '',
            password: '',
            propertyIDs: [],
            propertyTags: [],
        });
        onOpenAddProfileModal();
    };

    const filteredProfiles = profiles.filter((profile) => {
        const fullName = `${profile.firstName} ${profile.secondName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    const sortedProfiles = [...filteredProfiles].sort((a, b) => {
        const fullNameA = `${a.firstName} ${a.secondName}`.toLowerCase();
        const fullNameB = `${b.firstName} ${b.secondName}`.toLowerCase();
        return fullNameA.localeCompare(fullNameB);
    });

    const paginatedProfiles = sortedProfiles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        onOpenDeleteUserModal();
    };

    const handleDeleteConfirmation = async () => {
        if (deleteConfirmationEmail !== userToDelete.email) {
            alert("The email does not match. Please enter the correct email.");
            return;
        }

        try {
            const response = await fetch(`/api/user/${userToDelete.userID}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            alert('User deleted successfully');
            onCloseDeleteUserModal();
            fetchProfiles(); // Re-fetch profiles after deletion
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">All Profiles</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setSearchTerm(searchInput);
                            setCurrentPage(1);
                        }}
                        className="p-2 bg-[#FAFAFA] text-[#191919] rounded hover:bg-[#EDEBEB] transition"
                        aria-label="Search"
                    >
                        <FaSearch size={25} />
                    </button>

                    <Dropdown>
                        <DropdownTrigger>
                            <button
                                onClick={onOpenAddProfileModal}
                                className="bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded"
                            >
                                <Plus size={25} />
                            </button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Actions" className="bg-white shadow-lg rounded-md p-1">
                            <DropdownItem key="add" onPress={onOpenAddProfileModal}>Add Profile</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>

            {/* Search Section */}
            <div className="mb-6 flex flex-col items-start gap-2">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FC9D25]"
                />
            </div>

            {/* Modal for Adding Profile */}
            <Modal isOpen={isAddProfileModalOpen} onOpenChange={handleCloseAddProfileModal} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                                <div className="text-xl font-bold text-white">New Profile</div>
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

                                    {/* Property Selection */}
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

            {/* Modal for Deleting User */}
            <Modal isOpen={isDeleteUserModalOpen} onOpenChange={onCloseDeleteUserModal} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                        <div className="text-xl font-bold text-white">Confirm Delete User</div>
                        <button
                            type="button"
                            onClick={onCloseDeleteUserModal}
                            className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                        >
                            &times;
                        </button>
                    </ModalHeader>
                    <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                        <p className="text-[#191919]">To confirm the deletion of this user, please type their email:</p>
                        <input
                            type="email"
                            value={deleteConfirmationEmail}
                            onChange={(e) => setDeleteConfirmationEmail(e.target.value)}
                            placeholder="User email"
                            className="w-full p-2 bg-gray-200 rounded mt-2"
                        />
                    </ModalBody>
                    <ModalFooter className="border-t border-[#EDEBEB] bg-[#FAFAFA] pt-2 px-8">
                        <Button onPress={onCloseDeleteUserModal} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
                            Cancel
                        </Button>
                        <Button onPress={handleDeleteConfirmation} className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition">
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Table */}
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
                        paginatedProfiles.map((profile, index) => (
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
                                            <DropdownItem key="delete" onPress={() => openDeleteModal(profile)}>
                                                Delete
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
                            <td colSpan="5" className="text-center py-4 text-gray-500">
                                No profiles found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            <div className="flex fixed bottom-0 left-0 items-center gap-2 w-full px-4 py-3 bg-gray-200 justify-end">
                <span className="px-4 py-2">Items per page</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Reset para a primeira página
                    }}
                    className="border p-2 rounded px-4 py-2 w-20 bg-white"
                >
                    {[5, 10, 20, 50].map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>

                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-200 text-black cursor-not-allowed' : 'bg-white hover:bg-gray-300'}`}
                >
                    &lt;
                </button>

                <span className="px-4 py-2 rounded">{currentPage} / {totalPages}</span>

                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-200 text-black cursor-not-allowed' : 'bg-white hover:bg-gray-300'}`}
                >
                    &gt;
                </button>
            </div>

        </div>
    );
};

export default ProfilesTable;
