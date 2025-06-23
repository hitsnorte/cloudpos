'use client';

import { useState, useEffect } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
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
  DropdownItem
} from "@nextui-org/react";
import CustomPagination from "@/src/components/table/page";

const DataGrupo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [newGroup, setNewGroup] = useState({ group_name: "" });

  const [loading, setLoading] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');


  const [sortConfig, setSortConfig] = useState({ key: 'group_name', direction: 'asc' });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/get_groups");
      if (!res.ok) throw new Error("Failed to fetch groups");
      const data = await res.json();
      const sortedGroups = data.sort((a, b) => a.group_name.localeCompare(b.group_name));
      setGroups(sortedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const onEditOpen = (group) => {
    setSelectedGroup(group);
    setEditIsOpen(true);
  };

  const onEditClose = () => {
    setSelectedGroup(null);
    setEditIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGroup((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedGroup((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/get_groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_name_api: newGroup.group_name }), // Use group_name_api
      });

      if (!res.ok) throw new Error("Failed to add group");

      await fetchGroups();
      setNewGroup({ group_name: "" });
      onClose();
    } catch (error) {
      console.error("Error adding group:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/get_groups/${selectedGroup.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_name: selectedGroup.group_name
        }),
      });

      if (!res.ok) throw new Error("Failed to update group");

      await fetchGroups();
      onEditClose();
    } catch (error) {
      console.error("Error updating group:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setNewGroup({ group_name: "" });
    onClose();
  };

  const filteredGroups = groups.filter((group) => {
    const search = searchTerm.toLowerCase();
    return (
      (group.id && String(group.id).toLowerCase().includes(search)) ||
      (group.group_name && group.group_name.toLowerCase().includes(search))
    );
  });

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    const { key, direction } = sortConfig;

    let aVal = a[key];
    let bVal = b[key];

    // Tenta converter para número se ambos forem numéricos
    const isNumeric = !isNaN(aVal) && !isNaN(bVal);
    if (isNumeric) {
      aVal = Number(aVal);
      bVal = Number(bVal);
    } else {
      aVal = aVal?.toString().toLowerCase();
      bVal = bVal?.toString().toLowerCase();
    }

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });


  const paginatedGroups = sortedGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);

  return (
    <div className="p-4">
      {/* Header with Search and Add */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">All Groups</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpen}
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
          placeholder="Search by ID or Group Name..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FC9D25]"
        />
      </div>

      {/* Add Group Modal */}
      <Modal isOpen={isOpen} onOpenChange={onClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                <div className="text-xl font-bold text-white">New Group</div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                >
                  &times;
                </button>
              </ModalHeader>
              <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                <form id="addGroupForm" onSubmit={handleAddGroup} className="space-y-6">
                  <div>
                    <label htmlFor="group_name" className="block text-sm font-medium text-[#191919] mb-1">
                      Group Name
                    </label>
                    <input
                      id="group_name"
                      type="text"
                      name="group_name"
                      value={newGroup.group_name}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                  </div>
                </form>
              </ModalBody>
              <ModalFooter className="border-t border-[#EDEBEB] bg-[#FAFAFA] pt-2 px-8">
                <Button onPress={handleCloseModal} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
                  Cancel
                </Button>
                <Button type="submit" form="addGroupForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Group Modal */}
      <Modal isOpen={editIsOpen} onOpenChange={onEditClose} size="md" placement="center" className="w-100 shadow-xl rounded-lg">
        <ModalContent>
          {(onEditClose) => (
            <>
              <ModalHeader className="relative rounded bg-[#FC9D25] flex justify-between items-center px-6 py-3">
                <div className="text-xl font-bold text-white">Edit Group</div>
                <button
                  type="button"
                  onClick={onEditClose}
                  className="absolute right-4 top-3 text-white text-2xl font-bold hover:text-gray-200"
                >
                  &times;
                </button>
              </ModalHeader>
              <ModalBody className="py-5 px-6 bg-[#FAFAFA]">
                {selectedGroup && (
                  <form id="editGroupForm" onSubmit={handleEditGroup} className="space-y-6">
                    <div>
                      <label htmlFor="group_name" className="block text-sm font-medium text-[#191919] mb-1">
                        Group Name
                      </label>
                      <input
                        id="group_name"
                        type="text"
                        name="group_name"
                        value={selectedGroup.group_name}
                        onChange={handleEditInputChange}
                        className="w-full p-2 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                        required
                      />
                    </div>
                  </form>
                )}
              </ModalBody>
              <ModalFooter className="border-t border-[#EDEBEB] bg-[#FAFAFA] pt-2 px-8">
                <Button onPress={onEditClose} className="px-6 py-2 text-gray-500 rounded-md hover:bg-gray-100 transition">
                  Cancel
                </Button>
                <Button type="submit" form="editGroupForm" className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray-600 transition" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Groups Table */}
      <div className="mt-5">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : paginatedGroups.length > 0 ? (
          <table className="w-full text-left mb-5 min-w-full md:min-w-0 border-collapse">
            <thead>
              <tr className="bg-[#FC9D25] text-white h-12">
                <td className="pl-2 pr-2 w-8 border-r border-[#e6e6e6]">
                  <FaGear size={18} color="white" />
                </td>
                <td
                  className="pl-2 pr-2 w-16 text-left border-r border-[#e6e6e6] uppercase cursor-pointer"
                  onClick={() =>
                    setSortConfig((prev) => ({
                      key: 'id',
                      direction: prev.key === 'id' && prev.direction === 'asc' ? 'desc' : 'asc',
                    }))
                  }
                >
                  ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </td>
                <td
                  className="pl-2 pr-2 border-r border-[#e6e6e6] uppercase cursor-pointer"
                  onClick={() =>
                    setSortConfig((prev) => ({
                      key: 'group_name',
                      direction: prev.key === 'group_name' && prev.direction === 'asc' ? 'desc' : 'asc',
                    }))
                  }
                >
                  Group Name {sortConfig.key === 'group_name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </td>
              </tr>
            </thead>
            <tbody>
              {paginatedGroups.map((group, index) => (
                <tr
                  key={group.id || index}
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
                          onPress={() => onEditOpen(group)}
                        >
                          Edit
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </td>
                  <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6]">{group.id}</td>
                  <td className="pl-2 pr-2">{group.group_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-textLabelColor">No groups available</p>
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
          items={paginatedGroups}
          setPage={setCurrentPage}
          dataCSVButton={paginatedGroups.map((item) => ({
            ID: item.id,
            Name: item.group_name,
          }))}
        />
      </div>
    </div>
  );
};

export default DataGrupo;