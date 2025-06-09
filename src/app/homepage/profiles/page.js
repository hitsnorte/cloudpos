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
    const [searchInput, setSearchInput] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteConfirmationEmail, setDeleteConfirmationEmail] = useState('');
    const [userToDelete, setUserToDelete] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [properties, setProperties] = useState([]);
    const [currentProfile, setCurrentProfile] = useState(null);
    const [newProfile, setNewProfile] = useState({
        firstName: '',
        secondName: '',
        email: '',
        password: '',
        propertyIDs: [],
        propertyTags: [],
    });

    // Password management state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPasswordFields, setShowPasswordFields] = useState(false);


    const totalPages = Math.ceil(profiles.length / itemsPerPage);

    // Fetch profiles and properties as before
    const fetchProfiles = async () => {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();

            const users = Array.isArray(data) ? data : data.users;
            setProfiles(users || []);
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    };

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

    // Handle profile submit (add or edit)
    const handleSubmitProfile = async (e) => {
        e.preventDefault();

        // 1. Confirma password & modo (criar / editar)
        const isCreating = !currentProfile;

        if (isCreating && !newProfile.password) {
            alert("Define uma palavra-passe para o novo utilizador.");
            return;
        }

        if (!isCreating && showPasswordFields && newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        // 2. Garante arrays válidos
        const ids = Array.isArray(newProfile.propertyIDs) ? newProfile.propertyIDs : [];
        const tags = Array.isArray(newProfile.propertyTags) ? newProfile.propertyTags : [];

        if (ids.length === 0 || tags.length === 0 || ids.length !== tags.length) {
            alert("É obrigatório indicar pelo menos uma propriedade e respectiva tag.");
            return;
        }

        // 3. Monta o payload
        const updatedProfile = {
            firstName: newProfile.firstName?.trim(),
            secondName: newProfile.secondName?.trim(),
            email: newProfile.email?.trim(),
            password: isCreating
                ? newProfile.password
                : (showPasswordFields ? newPassword : undefined),
            currentPassword: isCreating ? undefined : currentPassword,
            propertyIDs: ids,
            propertyTags: tags,
        };

        // 4. Mostra no console p/ debug
        // console.log("Enviado para API:", updatedProfile);

        try {
            const response = await fetch(
                isCreating ? "/api/user" : `/api/user/${currentProfile.userID}`,
                {
                    method: isCreating ? "POST" : "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedProfile),
                }
            );

            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error || "Erro no servidor");
            }

            await fetchProfiles(); // Atualiza a lista no frontend

            setTimeout(() => {
                isCreating ? onCloseAddProfileModal() : onCloseEditProfileModal();
            }, 200);
        } catch (error) {
            console.error("Error with profile:", error);
            alert(error.message);
        }
    };



    const openEditModal = (profile) => {
        setCurrentProfile(profile); // Set profile to edit
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

    // New password validation and toggle function
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        // Validate password change logic
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        if (newPassword === '') {
            setPasswordError("New password cannot be empty.");
            return;
        }

        // Password update logic (you'd typically call an API to update the password here)
        try {
            const response = await fetch(`/api/user/${currentProfile.userID}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (!response.ok) throw new Error("Failed to update password");

            alert('Password changed successfully');
            setShowPasswordFields(false);
            setPasswordError('');
            onCloseEditProfileModal();
        } catch (error) {
            console.error("Error changing password:", error);
            setPasswordError("Failed to change password.");
        }
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
            fetchProfiles(); // Refresh á tabela depois de pagar perfil
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

            {/* SearchBar */}
            <div className="mb-6 flex flex-col items-start gap-2">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FC9D25]"
                />
            </div>

            {/* Modal de adição */}
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

                                    {/* Select de propriedades */}
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

            {/* Modal de edição */}
            <Modal isOpen={isEditProfileModalOpen} onOpenChange={onCloseEditProfileModal} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                        <div className="text-xl font-bold text-white">Edit Profile</div>
                        <button
                            type="button"
                            onClick={onCloseEditProfileModal}
                            className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                        >
                            &times;
                        </button>
                    </ModalHeader>
                    <ModalBody className="py-5 px-6 bg-white">
                        <form id="editProfileForm" onSubmit={handleSubmitProfile} className="space-y-6">
                            {["firstName", "secondName", "email"].map((field, index) => (
                                <div key={index}>
                                    <label htmlFor={`edit-${field}`} className="block text-sm font-medium text-[#191919] mb-1">
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                    </label>
                                    <input
                                        id={`edit-${field}`}
                                        type={field === "password" ? "password" : "text"}
                                        name={field}
                                        value={newProfile[field]}
                                        onChange={handleInputChange}
                                        className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                    />
                                </div>
                            ))}

                            {/* Toggle Change Password */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                                    className="w-full p-2 bg-[#FC9D25] text-white rounded-md text-center"
                                >
                                    {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
                                </button>
                            </div>

                            {showPasswordFields && (
                                <div>
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-[#191919] mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            id="currentPassword"
                                            type="password"
                                            name="currentPassword"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-[#191919] mb-1">
                                            New Password
                                        </label>
                                        <input
                                            id="newPassword"
                                            type="password"
                                            name="newPassword"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#191919] mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            name="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                                            required
                                        />
                                    </div>
                                    {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                                </div>
                            )}

                            <div>
                                <label htmlFor="edit-propertyIDs" className="block text-sm font-medium text-[#191919] mb-1">
                                    Select Properties
                                </label>
                                <Select
                                    id="edit-propertyIDs"
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
                        <Button onPress={onCloseEditProfileModal} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
                            Cancel
                        </Button>
                        <Button type="submit" form="editProfileForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition">
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/*Modal de apagar users*/}
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
        </div>
    );
};

export default ProfilesTable;