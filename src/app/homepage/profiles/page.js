'use client';

import { useState, useEffect } from "react";
import { HiDotsVertical } from "react-icons/hi";
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

const ProfilesTable = () => {
    const { isOpen: isAddProfileModalOpen, onOpen: onOpenAddProfileModal, onClose: onCloseAddProfileModal } = useDisclosure();
    const { isOpen: isEditProfileModalOpen, onOpen: onOpenEditProfileModal, onClose: onCloseEditProfileModal } = useDisclosure();
    const { isOpen: isDeleteUserModalOpen, onOpen: onOpenDeleteUserModal, onClose: onCloseDeleteUserModal } = useDisclosure();

    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [currentProfile, setCurrentProfile] = useState(null); // Added for edit modal
    const [newProfile, setNewProfile] = useState({
        firstName: "",
        secondName: "",
        email: "",
        password: "",
        propertyIDs: [],
        propertyTags: [],
    });
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [deleteConfirmationEmail, setDeleteConfirmationEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState(''); // Added for password fields
    const [newPassword, setNewPassword] = useState(''); // Added for password fields
    const [confirmPassword, setConfirmPassword] = useState(''); // Added for password fields
    const [passwordError, setPasswordError] = useState(''); // Added for password error
    const [userToDelete, setUserToDelete] = useState(null); // Added for delete modal

    useEffect(() => {
        fetchProfiles();
        fetchProperties();
    }, []);

    const fetchProfiles = async () => {
        try {
            const res = await fetch("/api/user");
            if (!res.ok) throw new Error("Failed to fetch profiles");
            const data = await res.json();
            setProfiles(data.users || []);
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

    const openEditModal = (profile) => {
        setCurrentProfile(profile);
        setNewProfile({
            firstName: profile.firstName,
            secondName: profile.secondName,
            email: profile.email,
            password: '',
            propertyIDs: profile.propertyIDs || [],
            propertyTags: profile.propertyTags || [],
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        onOpenEditProfileModal();
    };

    const openDeleteModal = (profile) => {
        setUserToDelete(profile);
        setDeleteConfirmationEmail('');
        onOpenDeleteUserModal();
    };

    const propertyOptions = properties.map(property => ({
        value: property.propertyID,
        label: `${property.propertyName} (${property.propertyTag})`,
        tag: property.propertyTag
    }));

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProfile),
            });
            if (!res.ok) throw new Error("Failed to add profile");
            await fetchProfiles();
            setNewProfile({ firstName: "", secondName: "", email: "", password: "", propertyIDs: [], propertyTags: [] });
            onCloseAddProfileModal();
        } catch (error) {
            console.error("Error adding profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        if (showPasswordFields && newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        const updatedProfile = {
            firstName: newProfile.firstName,
            secondName: newProfile.secondName,
            email: newProfile.email,
            password: showPasswordFields ? newPassword : undefined,
            currentPassword: showPasswordFields ? currentPassword : undefined,
            propertyIDs: newProfile.propertyIDs,
            propertyTags: newProfile.propertyTags,
        };
        try {
            if (currentProfile) {
                const response = await fetch(`/api/user/${currentProfile.userID}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedProfile),
                });
                if (!response.ok) throw new Error("Failed to edit profile");
                onCloseEditProfileModal();
            } else {
                const response = await fetch('/api/user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedProfile),
                });
                if (!response.ok) throw new Error("Failed to add profile");
                onCloseAddProfileModal();
            }
            fetchProfiles();
        } catch (error) {
            console.error("Error with profile:", error);
            alert(error.message);
        }
    };

    const handlePropertyChange = (selectedOptions) => {
        const selectedIDs = selectedOptions.map(option => option.value);
        const selectedTags = selectedOptions.map(option => option.tag);
        setNewProfile(prevProfile => ({
            ...prevProfile,
            propertyIDs: selectedIDs,
            propertyTags: selectedTags,
        }));
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
            if (!response.ok) throw new Error('Failed to delete user');
            alert('User deleted successfully');
            onCloseDeleteUserModal();
            fetchProfiles();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const filteredProfiles = profiles.filter((profile) => {
        const search = searchTerm.toLowerCase();
        return (
            (profile.userID && String(profile.userID).toLowerCase().includes(search)) ||
            (profile.firstName && profile.firstName.toLowerCase().includes(search)) ||
            (profile.secondName && profile.secondName.toLowerCase().includes(search)) ||
            (profile.email && profile.email.toLowerCase().includes(search))
        );
    });

    const paginatedProfiles = filteredProfiles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);

    return (
        <div className="p-4">
            {/* Header with Search and Add */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">All Profiles</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenAddProfileModal} // Fixed to use useDisclosure
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
                    placeholder="Search by ID, First Name, Last Name, or Email..."
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value);
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FC9D25]"
                />
            </div>

            {/* Profiles Table */}
            <div className="mt-5">
                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : paginatedProfiles.length > 0 ? (
                    <table className="w-full text-left mb-5 min-w-full md:min-w-0 border-collapse">
                        <thead>
                        <tr className="bg-[#FC9D25] text-white h-12">
                            <td className="pl-2 pr-2 w-8 border-r border-[#e6e6e6]">
                                <FaGear size={18} color="white" />
                            </td>
                            <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6] uppercase">ID</td>
                            <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6] uppercase">First Name</td>
                            <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6] uppercase">Last Name</td>
                            <td className="pl-2 pr-2 border-r border-[#e6e6e6] uppercase">Email</td>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedProfiles.map((profile, index) => (
                            <tr
                                key={profile.userID || index}
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
                                                onPress={() => openEditModal(profile)} // Fixed to use openEditModal
                                            >
                                                Edit
                                            </DropdownItem>
                                            <DropdownItem
                                                key="delete"
                                                className="px-4 py-2 text-base text-red-600 hover:bg-gray-200 hover:text-red-800 rounded transition-colors cursor-pointer"
                                                onPress={() => openDeleteModal(profile)} // Added delete trigger
                                            >
                                                Delete
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </td>
                                <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6]">{profile.userID}</td>
                                <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6]">{profile.firstName}</td>
                                <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6]">{profile.secondName}</td>
                                <td className="pl-2 pr-2">{profile.email}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-textLabelColor">No profiles available</p>
                )}
            </div>

            {/* Pagination */}
            <div className="bottom-0 w-full bg-white p-0 m-0 pagination-container">
                <CustomPagination
                    page={currentPage}
                    pages={totalPages}
                    rowsPerPage={itemsPerPage}
                    handleChangeRowsPerPage={(newSize) => {
                        setItemsPerPage(newSize);
                        setCurrentPage(1);
                    }}
                    items={paginatedProfiles}
                    setPage={setCurrentPage}
                    dataCSVButton={paginatedProfiles.map((item) => ({
                        ID: item.userID,
                        FirstName: item.firstName,
                        LastName: item.secondName,
                        Email: item.email,
                    }))}
                />
            </div>

            {/* Add Profile Modal */}
            <Modal isOpen={isAddProfileModalOpen} onOpenChange={onCloseAddProfileModal} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                                <div className="text-xl font-bold text-white">New Profile</div>
                                <button
                                    type="button"
                                    onClick={onCloseAddProfileModal}
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
                                <Button onPress={onCloseAddProfileModal} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
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

            {/* Edit Profile Modal */}
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

            {/* Delete User Modal */}
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
        </div>
    );
};

export default ProfilesTable;