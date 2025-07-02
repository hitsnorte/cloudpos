'use client';

import { useState, useEffect, useMemo } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { Plus } from "lucide-react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import CustomPagination from "@/src/components/table/page";
import { fetchSubfamily, createSubfamily, deleteSubfamily, updateSubfamily } from '@/src/lib/apisubfamily';
import { fetchFamily } from '@/src/lib/apifamily';
import { fetchGrup } from '@/src/lib/apigroup';

const DataSubfamilia = () => {
  const [subfamilias, setSubfamilias] = useState([]);
  const [families, setFamilies] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSubfamilia, setNewSubfamilia] = useState({ nome: '' });
  const [editSubfamilia, setEditSubfamilia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subfamiliaToDelete, setSubfamiliaToDelete] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState("");

  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    loadSubfamilias();
    loadFamilies();
  }, []);

  const handleChangeRowsPerPage = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setItemsPerPage(newSize);
    setCurrentPage(1); // Reset to the first page
  };

  const loadSubfamilias = async () => {
    try {
      const subfamilias = await fetchSubfamily();
      const familyMap = await fetchFamilyMap();
      const groupMap = await fetchGroupMap();

      const enrichedSubfamilias = subfamilias.map(subfamilia => ({
        ...subfamilia,
        VDescFamily: familyMap[subfamilia.VCodFam] || "N/A",
        VDescGroup: groupMap[subfamilia.VCodGrfam] || "N/A",
      }));

      setSubfamilias(enrichedSubfamilias);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchFamilyMap = async () => {
    try {
      const families = await fetchFamily();
      return families.reduce((map, family) => {
        map[family.VCodFam] = family.VDesc;
        return map;
      }, {});
    } catch (err) {
      setError(err.message);
      return {};
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

  const loadFamilies = async () => {
    try {
      const families = await fetchFamily();
      setFamilies(families);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubfamilia((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubfamilia = async (e) => {
    e.preventDefault();
    if (!newSubfamilia.nome || !selectedFamily) {
      setError('Preencha o nome da Sub família e selecione uma família.');
      return;
    }

    try {
      setIsLoading(true);
      const subfamiliaData = {
        nome: newSubfamilia.nome,
        selectedFamily,
      };

      await createSubfamily(subfamiliaData);
      await loadSubfamilias();
      setNewSubfamilia({ nome: '' });
      setSelectedFamily('');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubfamilia = (subfamilia) => {
    setEditSubfamilia({ ...subfamilia });
  };

  const handleUpdateSubfamilia = async (e) => {
    e.preventDefault();
    if (!editSubfamilia || !editSubfamilia.nome) {
      setError('Preencha o nome da Sub família.');
      return;
    }

    try {
      setIsLoading(true);
      await updateSubfamily(editSubfamilia.id, { nome: editSubfamilia.nome });
      await loadSubfamilias();
      setEditSubfamilia(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubfamilia = async () => {
    if (subfamiliaToDelete) {
      setIsLoading(true);
      try {
        await deleteSubfamily(subfamiliaToDelete);
        setSubfamilias(subfamilias.filter((subfamilia) => subfamilia.id !== subfamiliaToDelete));
        setSubfamiliaToDelete(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredSubfamilias = subfamilias.filter((subfamilia) =>
    Object.values(subfamilia).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedSubfamilias = useMemo(() => {
    if (!sortConfig.key) return filteredSubfamilias;

   const sorted = [...filteredSubfamilias].sort((a, b) => {
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
  }, [filteredSubfamilias, sortConfig]);

  const paginatedSubfamilias = sortedSubfamilias.slice(
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

  const totalPages = Math.ceil(filteredSubfamilias.length / itemsPerPage);

  return (
    <div className="p-4">
      {/* Header with Search and Add */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">All Sub Families</h2>
        <button
          onClick={() => setNewSubfamilia({ nome: '' })}
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
        {paginatedSubfamilias.length > 0 ? (
          <table className="w-full text-left mb-5 border-collapse">
            <thead>
              <tr className="bg-[#FC9D25] text-white h-12">
                <th className="pl-2 pr-2 w-8 border-r border-[#e6e6e6]">
                  <FaGear size={18} color="white" />
                </th>
                {[
                  { label: 'Cod SubFam', key: 'VCodSubFam', align: 'text-right', width: 'w-16' },
                  { label: 'Description', key: 'VDesc', align: 'text-left', width: 'w-32' },
                  { label: 'Created in', key: 'dcriadoem', align: 'text-left' },
                  { label: 'Cod fam', key: 'VCodFam', align: 'text-left' },
                  { label: 'Desc fam', key: 'VDescFamily', align: 'text-left' },
                  { label: 'Cod grp fam', key: 'VCodGrfam', align: 'text-left' },
                  { label: 'Desc grp', key: 'VDescGroup', align: 'text-left' },
                ].map(({ label, key, align, width }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`pl-2 pr-2 ${width || ''} border-r border-[#e6e6e6] uppercase cursor-pointer select-none font-light ${align}`}
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
              {paginatedSubfamilias.map((subfamilia, index) => (
                <tr
                  key={subfamilia.VCodSubFam || index}
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
                        <DropdownItem onPress={() => handleEditSubfamilia(subfamilia)}>Edit</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </td>
                  <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6]">{subfamilia.VCodSubFam}</td>
                  <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6]">{subfamilia.VDesc}</td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">
                    {new Date(subfamilia.dcriadoem).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{subfamilia.VCodFam}</td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{subfamilia.VDescFamily}</td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{subfamilia.VCodGrfam}</td>
                  <td className="pl-2 pr-2">{subfamilia.VDescGroup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No subfamilias available</p>
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

export default DataSubfamilia;