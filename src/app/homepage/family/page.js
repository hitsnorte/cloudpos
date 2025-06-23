'use client';

import { useState, useEffect, useMemo } from 'react';
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
  DropdownItem,
} from "@nextui-org/react";
import CustomPagination from "@/src/components/table/page";
import { fetchFamily, createFamily, deleteFamily, updateFamily } from '@/src/lib/apifamily';
import { fetchGrup } from '@/src/lib/apigroup';

const DataFamily = () => {
  const [families, setFamilies] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newFamily, setNewFamily] = useState({ family_name: '' });
  const [editFamily, setEditFamily] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("");

  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    loadFamilies();
  }, []);

  const handleChangeRowsPerPage = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setItemsPerPage(newSize);
    setCurrentPage(1); // Reset to the first page
  };

  const loadFamilies = async () => {
    try {
      const families = await fetchFamily();
      const groupMap = await fetchGroupMap();

      const enrichedFamilies = families.map(family => ({
        ...family,
        VDescGroup: groupMap[family.VCodGrFam] || "N/A",
      }));

      setFamilies(enrichedFamilies);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchGroupMap = async () => {
    try {
      const groups = await fetchGrup();
      return groups.reduce((map, group) => {
        map[group.VCodGrFam] = group.VDesc;
        return map;
      }, {});
    } catch (err) {
      setError(err.message);
      return {};
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFamily((prev) => ({ ...prev, [name]: value }));
  };


  const handleAddFamily = async (e) => {
    e.preventDefault();
    if (!newFamily.family_name || !selectedGroup) {
      setError('Preencha o nome da família e selecione um grupo.');
      return;
    }

    try {
      setIsLoading(true);
      const familyData = {
        family_name: newFamily.family_name,
        selectedGroup,
      };

      await createFamily(familyData);
      await loadFamilies();
      setNewFamily({ family_name: '' });
      setSelectedGroup('');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFamily = (family) => {
    setEditFamily({ ...family });
  };

  const handleUpdateFamily = async (e) => {
    e.preventDefault();
    if (!editFamily || !editFamily.family_name) {
      setError('Preencha o nome da família.');
      return;
    }

    try {
      setIsLoading(true);
      await updateFamily(editFamily.id, { family_name: editFamily.family_name });
      await loadFamilies();
      setEditFamily(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFamily = async () => {
    if (familyToDelete) {
      setIsLoading(true);
      try {
        await deleteFamily(familyToDelete);
        setFamilies(families.filter((family) => family.id !== familyToDelete));
        setFamilyToDelete(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredFamilies = families.filter((family) =>
    Object.values(family).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedFamilies = useMemo(() => {
    if (!sortConfig.key) return filteredFamilies;

    const sorted = [...filteredFamilies].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      const isNumeric = typeof aValue === 'number' || !isNaN(Number(aValue));

      if (isNumeric) {
        return sortConfig.direction === 'asc'
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      } else {
        return sortConfig.direction === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });

    return sorted;
  }, [filteredFamilies, sortConfig]);

  const paginatedFamilies = sortedFamilies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const totalPages = Math.ceil(filteredFamilies.length / itemsPerPage);

  return (
    <div className="p-4">
      {/* Header with Search and Add */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">All Families</h2>
        <button
          onClick={() => setNewFamily({ family_name: '' })}
          className="bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded"
        >
          <Plus size={25} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex mb-4 items-center gap-2">
        <input
          type="text"
          placeholder="Search by any field..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FC9D25]"
        />
      </div>

      {/* Table */}
      <div className="mt-5">
        {paginatedFamilies.length > 0 ? (
          <table className="w-full text-left mb-5 border-collapse mb-13">
            <thead>
              <tr className="bg-[#FC9D25] text-white h-12">
                <th className="pl-2 pr-2 w-8 border-r border-[#e6e6e6] ">
                  <FaGear size={18} color="white" />
                </th>
                {[
                  { label: 'Cod Fam', key: 'VCodFam', align: 'text-left ', width: 'w-16' },
                  { label: 'Description', key: 'VDesc', align: 'text-left', width: 'w-32' },
                  { label: 'Created In', key: 'DCriadoEm', align: 'text-left' },
                  { label: 'Cod Grp Fam', key: 'VCodGrFam', align: 'text-left' },
                  { label: 'Desc Grp', key: 'VDescGroup', align: 'text-left' },
                ].map(({ label, key, align, width }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    style={{ fontWeight: 300 }}
                    className={`pl-2 pr-2 ${width || ''} border-r border-[#e6e6e6] uppercase cursor-pointer select-none ${align}`}
                  >
                    {label}
                    {sortConfig.key === key && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedFamilies.map((family, index) => (
                <tr
                  key={family.VCodFam || index}
                  className="h-10 border-b border-[#e8e6e6] text-left transition-colors duration-150 hover:bg-[#FC9D25]/20"
                >
                  <td className="pl-1 flex items-start border-r border-[#e6e6e6]">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          variant="light"
                          className="flex justify-center items-center w-auto min-w-0 p-0 m-0"
                        >
                          <HiDotsVertical size={20} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Actions" className="min-w-[150px] bg-white rounded-lg shadow-xl py-2 px-1">
                        <DropdownItem onPress={() => handleEditFamily(family)}>Edit</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </td>
                  <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6]">{family.VCodFam}</td>
                  <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6]">{family.VDesc}</td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">
                    {new Date(family.DCriadoEm).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{family.VCodGrFam}</td>
                  <td className="pl-2 pr-2">{family.VDescGroup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No families available</p>
        )}
      </div>

      {/* Pagination */}
      <div className="bottom-0 w-full bg-white p-0 m-0 pagination-container">
        <CustomPagination
          page={currentPage}
          pages={totalPages}
          rowsPerPage={itemsPerPage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          setPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default DataFamily;