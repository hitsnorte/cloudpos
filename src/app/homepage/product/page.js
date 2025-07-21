'use client';

import { useState, useEffect, useMemo } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { Plus } from "lucide-react";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { FaMagnifyingGlass } from "react-icons/fa6";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { fetchProduct, createProduct, deleteProduct, updateProduct } from '@/src/lib/apiproduct';
import { fetchSubfamily } from '@/src/lib/apisubfamily';
import { fetchFamily } from '@/src/lib/apifamily';
import { fetchGrup } from '@/src/lib/apigroup';
import { fetchIva } from '@/src/lib/apiiva';
import { fetchUnit } from '@/src/lib/apiunit';
import { fetchClassepreco } from "@/src/lib/apiclassepreco";
import { fetchPreco } from "@/src/lib/apipreco";
import { IoInformationSharp } from "react-icons/io5";
import { fetchPeriod } from "@/src/lib/apiseason";
import { fetchHour } from "@/src/lib/apihour";
import Select from "react-select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from '@nextui-org/react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import CustomPagination from "@/src/components/table/page";

const DataProduct = () => {
  const [products, setProducts] = useState([]);
  const [subfamilies, setSubfamilies] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({ product_name: '', quantity: '' });
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [quantityError, setQuantityError] = useState('');
  const [selectedSubfamily, setSelectedSubfamily] = useState("");
  const [selectedIva, setSelectedIva] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [isChecked, setIsChecked] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: 'VDesc', direction: 'asc' });

  const PAGE_SIZES = [25, 50, 150, 250];

  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const {
    isOpen: isSelectModalOpen,
    onOpen: onSelectModalOpen,
    onClose: onSelectModalClose,
  } = useDisclosure();

  useEffect(() => {
    loadProducts();
    loadSubfamilies();
  }, []);

  const toggleCheck = () => {
    setIsChecked(!isChecked); // Alterna o estado da checkbox
  };

  const handleEditModalClose = () => {

    setFamilyName('');
    setSubFam('');
    setLoadingFamily(false);
    setLoadingSubFam(true);
    setGroup(false);
    setLoadingGroup(false);


    onEditModalClose();
  };

  const loadProducts = async () => {
    try {
      const products = await fetchProduct();
      const subfamilyMap = await fetchSubfamilyMap(); // Criamos um mapa de subfamílias
      const familyMap = await fetchFamilyMap(); // Criamos um mapa de famílias
      const groupMap = await fetchGroupMap();
      const ivaMap = await fetchIvaMap();
      const unitMap = await fetchUnitMap();

      // Mapeamos os produtos, adicionando a descrição da subfamília e da família correspondente
      const enrichedProducts = products.map(product => ({
        ...product,
        VDescSubfamily: subfamilyMap[product.VSUBFAM] || "N/A", // Se não houver correspondência, coloca "N/A"
        VDescFamily: familyMap[product.VCodFam] || "N/A", // Se não houver correspondência, coloca "N/A"
        VDescGroup: groupMap[product.VCodGrfam] || "N/A", // Se não houver correspondência, coloca "N/A"
        VDescIva: ivaMap[product.VCodIva] || "N/A", // Se não houver correspondência, coloca "N/A"
        VDescUnit: unitMap[product.DefinicaoProduto] || "N/A" // Se não houver correspondência, coloca "N/A"
      }));

      setProducts(enrichedProducts);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchSubfamilyMap = async () => {
    try {
      const subfamilies = await fetchSubfamily();
      return subfamilies.reduce((map, subfamily) => {
        map[subfamily.VCodSubFam] = subfamily.VDesc;
        return map;
      }, {});
    } catch (err) {
      setError(err.message);
      return {};
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

  const fetchIvaMap = async () => {
    try {
      const ivas = await fetchIva();
      return ivas.reduce((map, iva) => {
        map[iva.VCODI] = iva.VDESC;
        return map;
      }, {});
    } catch (err) {
      setError(err.message);
      return {};
    }
  };

  const fetchUnitMap = async () => {
    try {
      const units = await fetchUnit();
      return units.reduce((map, unit) => {
        map[unit.Id_interno] = unit.Descricao;
        return map;
      }, {});
    } catch (err) {
      setError(err.message);
      return {};
    }
  };

  const loadSubfamilies = async () => {
    try {
      const subfamilies = await fetchSubfamily();
      setSubfamilies(subfamilies);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredProducts = products.filter((product) =>
    Object.values(product).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.product_name || !newProduct.quantity || !selectedSubfamily) {
      setError('Preencha o nome do produto e selecione uma Subfamilia.');
      return;
    }

    const productExists = products.some(
      (product) => product.product_name.toLowerCase() === newProduct.product_name.toLowerCase()

    );

    if (productExists) {
      setError('Este produto ja existe. Por favor, use um nome diferente.');
      return;
    }

    try {
      setIsLoading(true);

      const productData = {
        product_name: newProduct.product_name,
        quantity: newProduct.quantity,
        selectedSubfamily: selectedSubfamily, // Certifique-se de que a chave no backend espera esse nome
      };

      const createdProduct = await createProduct(productData);
      setProducts([...products, createdProduct]);

      // Limpa os campos após sucesso
      setNewProduct({ product_name: '' });
      setSelectedSubfamily('');
      setError(null);

      onAddModalClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const paginatedProducts = filteredProducts.slice(
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



  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const sortedProducts = useMemo(() => {
    if (!paginatedProducts || !Array.isArray(paginatedProducts)) return [];

    const sorted = [...paginatedProducts].sort((a, b) => {
      if (!sortConfig.key) return 0;

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'DCriadoEm') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = aValue?.toString().toLowerCase();
        bValue = bValue?.toString().toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [paginatedProducts, sortConfig]);



  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    // Verificar se os dados essenciais estão preenchidos
    if (!editProduct || !editProduct.product_name) {
      setError('Preencha o nome do produto.');
      return;
    }

    try {
      // Preparar o objeto com todos os campos que devem ser atualizados
      const updatedProductData = {
        id: editProduct.id,
        product_name: editProduct.product_name,
        quantity: editProduct.quantity,
        Abreviatura: editProduct.Abreviatura,
        VCodGrfam: editProduct.VCodGrfam,
        ProductType: editProduct.ProductType,
        VDESC1: editProduct.VDESC1,
        VREFERENCIA: editProduct.VREFERENCIA,
        activo: editProduct.activo,
        IVA: selectedIva,
        vultaltpor: editProduct.vultaltpor,
        dultaltem: editProduct.dUltAltEm
      };

      console.log('Enviando para API:', updatedProductData);

      // Enviar os dados para a API
      const updatedProduct = await updateProduct(editProduct.id, updatedProductData);

      console.log('Resposta da API:', updatedProduct);

      // Atualizar o estado local com o produto atualizado
      setProducts(products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)));

      // Limpar os campos de edição e o erro após o sucesso
      setEditProduct(null);
      setError(null);

      // Fechar o modal
      onEditModalClose();
    } catch (err) {
      console.error('Erro ao atualizar produto:', err.message);
      setError(err.message); // Exibir erro no modal
    }
  };

  const tipoOperacaoList = [
    { id: 1, tipo: "venda", descricao: "Venda" },
    { id: 2, tipo: "compra", descricao: "Compra" },
  ];

  const [subfam, setSubFam] = useState('');
  const [fam, setFam] = useState('');
  const [loadingsubfam, setLoadingSubFam] = useState(true);

  const fetchSubFamilia = async (subFamiliaId) => {
    try {
      const response = await fetch('/api/cloudproducts/subfamilia', {
        headers: {
          'X-Property-ID': localStorage.getItem('selectedProperty'),
          'X-Subfam-ID': subFamiliaId.toString(),
        }
      });

      const contentType = response.headers.get("content-type");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!contentType || !contentType.includes('application/json')) {
        console.error('Unexpected response (not JSON):', data);
        setSubFam('Erro no formato da resposta');
        return;
      }

      if (data?.data?.VDesc) {
        setSubFam(data.data.VDesc);
      } else {
        setSubFam('Não encontrado');
      }

      return data.data;
    } catch (error) {
      console.error('Erro ao buscar sub-família:', error);
      setSubFam('Erro ao carregar');
    } finally {
      setLoadingSubFam(false);
    }
  };

  // useEffect para carregar a sub-família quando o produto for editado
  useEffect(() => {
    if (editProduct?.VSUBFAM) {
      fetchSubFamilia(editProduct.VSUBFAM);
    }
  }, [editProduct?.VSUBFAM]);

  const [classePrecos, setClassePrecos] = useState([]);
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const loadPrices = async () => {
      const data = await fetchPreco();
      setPrices(data);
    };

    if (isEditModalOpen) {
      loadPrices();
    }
  }, [isEditModalOpen]);


  const [FamilyName, setFamilyName] = useState('');
  const [loadingFamily, setLoadingFamily] = useState(false);

  const fetchFamilia = async (famID) => {
    try {
      setLoadingFamily(true);
      const response = await fetch('/api/cloudproducts/familia', {
        headers: {
          'X-Property-ID': localStorage.getItem('selectedProperty'),
          'X-Fam-ID': famID.toString(),
        }
      });

      const contentType = response.headers.get("content-type");
      const data = await response.json();

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Unexpected response (not JSON):', data);
        setFamilyName('Error in the response format');
        return;
      }
      if (data?.data?.VDesc) {
        setFamilyName(data?.data?.VDesc);
      }
      else {
        setFamilyName('Não Encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar familia:', error);
      setFamilyName('Erro ao carregar');
    } finally {
      setLoadingFamily(false);
    }
  }

  // Simulação do carregamento da subfamília ao renderizar

  const [selectedProduct, setSelectedProduct] = useState('');

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditProduct(product);
    onEditModalOpen();
  };

  const [filteredPrices, setFilteredPrices] = useState([]);

  useEffect(() => {

    if (selectedProduct && prices.length > 0) {
      const filtered = prices.filter(
        (price) => String(price.VCodprod) === String(selectedProduct.VPRODUTO)
      );

      setFilteredPrices(filtered);
    }
  }, [selectedProduct, prices]);

  //Mostrar nomes das classes na tabela
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await fetchClassepreco();
        setClasses(data);
      } catch (error) {
        console.error('Erro ao carregar classes de preço:', error);
      }
    };

    loadClasses();
  }, []);

  const getClassName = (vcodClas) => {
    const match = classes.find(cls => cls.Vcodi === vcodClas);
    return match?.Vdesc || vcodClas || '—';
  };

  //Mostrar descrições dos periodos na tabela

  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    const loadPeriods = async () => {
      try {
        const fetchedPeriods = await fetchPeriod();
        setPeriods(fetchedPeriods);
      } catch (error) {
        console.error("Erro ao carregar períodos:", error);
      }
    };

    loadPeriods();
  }, []);

  const getPeriodDescription = (code) => {
    const period = periods.find(p => p.vcodi === code);
    if (!period) return code || '—';

    // Mostra só a data
    return period.DDataFim.split('T')[0] || period.DDataFim.split(' ')[0];
  };


  //Mostrar descrição das horas na tabela
  const [hours, setHours] = useState([]);

  useEffect(() => {
    const loadHours = async () => {
      try {
        const fetchedHours = await fetchHour();
        setHours(fetchedHours);
      } catch (error) {
        console.error("Erro ao carregar horas:", error);
      }
    };

    loadHours();
  }, []);

  const getHourDescription = (code) => {
    const hour = hours.find(h => h.Vcodi === code);
    if (!hour) return code || '—';


    return hour.VHoraFim.slice(0, 5);
  };


  //Carrega os IVA para o dropdown
  const [ivaOptions, setIvaOptions] = useState([]);

  useEffect(() => {
    const loadVat = async () => {
      try {
        const data = await fetchIva();
        setIvaOptions(data);
      } catch (err) {
        console.error('Failed to load VAT options:', err);
      }
    };

    loadVat();
  }, []);

  const handleVatChange = (index, newVatCode) => {

    const updatedPrices = [...filteredPrices];
    updatedPrices[index].VCodIva = newVatCode;
    setPrices(updatedPrices);
  };


  //useEffect para o fetchFamilia , antes era usado num handleButtonClick para a tooltip
  useEffect(() => {
    const familyId = editProduct?.VCodFam;
    if (familyId) {
      fetchFamilia(familyId);
    }
  }, [editProduct?.VCodFam]);

  const [group, setGroup] = useState('');
  const [loadingGroup, setLoadingGroup] = useState(true);

  const fetchGroup = async (groupId) => {

    setLoadingGroup(true);
    try {
      const allGroups = await fetchGrup();

      const found = allGroups.find(g => String(g.VCodGrFam) === String(groupId));

      if (found?.VDesc) {
        setGroup(found.VDesc);
      } else {
        setGroup('Não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      setGroup('Erro ao carregar');
    } finally {
      setLoadingGroup(false);
    }
  };


  useEffect(() => {
    if (isEditModalOpen && editProduct?.VCodGrfam) {
      fetchGroup(editProduct.VCodGrfam);
    }
  }, [isEditModalOpen, editProduct]);

  const formatDateOnly = (dateString) => {
    if (!dateString) return '—';
    return dateString.split('T')[0] || dateString.split(' ')[0];
  };

  const formatToInputDate = (dateString) => {
    if (!dateString) return '';
    return dateString.slice(0, 10);  //muda o formato da data
  };
  console.log('editProduct.dUltAltEm:', editProduct?.dUltAltEm);
  console.log('Formatted date:', formatToInputDate(editProduct?.dUltAltEm));


  return (

    <div className="p-4">
      {/* Header with Search and Add */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">All Products</h2>
        <button
          onClick={() => setNewProduct({ product_name: '', quantity: '' })}
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

      <Modal
        isOpen={isEditModalOpen}
        onOpenChange={handleEditModalClose}
        size="3xl"
        placement="center" // Centraliza o modal
        className="w-[95vw] max-w-[1000px] min-w-[800px] bg-white shadow-xl rounded-lg"
        hideCloseButton={true}
        product={selectedProduct}
        prices={prices}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="rounded bg-[#FC9D25] flex justify-between items-center">
                <div className="text-xl font-bold text-white">Edit product</div>
                <Button
                  onClick={onEditModalClose}
                  className="text-white bg-transparent border-0 text-2xl p-0"
                  aria-label="Close"
                >
                  &times; {/* Unicode for "×" sign */}
                </Button>
              </ModalHeader>

              <ModalBody className="py-5 px-6">
                {editProduct && (
                  <form id="updateProductForm" onSubmit={handleUpdateProduct} className="space-y-6">
                    {/* Abreviatura e tipo de produto */}
                    <div className="flex gap-4">
                      {/* Abreviatura*/}
                      <div className="w-1/2">
                        <label htmlFor="productAbbreviation" className="block text-sm font-medium text-[#191919] mb-1">
                          Abbreviation
                        </label>
                        <input
                          id="productAbreviatura"
                          type="text"
                          value={editProduct?.Abreviatura || ''}
                          onChange={(e) => setEditProduct({ ...editProduct, Abreviatura: e.target.value })}
                          placeholder="Digite a Abbreviation do produto"
                          className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                          required
                        />
                      </div>

                      {/* Detalhes do tipo de produto */}
                      <div className="w-1/2 flex gap-2 items-end">
                        {/* Tipo de produto */}
                        <div className="flex flex-col w-1/3">
                          <label className="text-sm font-medium text-[#191919] mb-1">Prod. Type</label>
                          <div className="bg-gray-200 p-1 rounded text-sm text-gray-700">
                            {editProduct?.vtipprod || '—'}
                          </div>
                        </div>

                        {/* Tipo de produto */}
                        <div className="flex flex-col w-1/3">
                          <label className="text-sm font-medium text-[#191919] mb-1">Type</label>
                          <div className="bg-gray-200 p-1 rounded text-sm text-gray-700">
                            {editProduct?.ProductType || '—'}
                          </div>
                        </div>

                        {/* Status*/}
                        <div className="flex flex-col w-1/3 items-center">
                          <label className="text-sm font-medium text-[#191919] mb-1">Status</label>
                          <label className="flex items-center gap-1 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={editProduct?.activo || false}
                              onChange={(e) => setEditProduct({ ...editProduct, activo: e.target.checked })}
                            />
                            {editProduct?.activo ? 'Active' : 'Inactive'}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Descrição */}
                    <div className="w-full">
                      <label htmlFor="productDescription" className="block text-sm font-medium text-[#191919] mb-1">
                        Description
                      </label>
                      <textarea
                        id="productDescription"
                        value={editProduct?.VDESC1 || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, VDESC1: e.target.value })}
                        placeholder="Insert product description"
                        className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 "
                      />
                    </div>

                    {/* Sub-Família, Family, Group */}
                    <div className="flex justify-between gap-4 mb-4">
                      {/* Sub-Família */}
                      <div className="w-1/3">
                        <label htmlFor="subFamilia" className="text-sm font-medium text-[#191919] mb-1 block ">
                          Sub-Family
                        </label>
                        <div
                          id="subFamilia"
                          className="w-full p-1 bg-gray-200 rounded text-sm text-gray-700"
                        >
                          {loadingsubfam ? 'Loading...' : subfam || 'Not associated'}
                        </div>
                      </div>

                      {/* Familia */}
                      <div className="w-1/3">
                        <label htmlFor="family" className="text-sm font-medium text-[#191919] mb-1 block">
                          Family
                        </label>
                        <div
                          id="family"
                          className="w-full p-1 bg-gray-200 rounded text-sm text-gray-700"
                        >
                          {loadingFamily ? 'Loading...' : FamilyName || 'Unknown'}
                        </div>
                      </div>

                      {/* Grupo */}
                      <div className="w-1/3">
                        <label htmlFor="group" className="text-sm font-medium text-[#191919] mb-1 block">
                          Grupo
                        </label>
                        <div
                          id="group"
                          className="w-full p-1 bg-gray-200 rounded text-sm text-gray-700"
                        >
                          {loadingGroup ? 'Loading...' : group || 'Group is not associated'}
                        </div>
                      </div>
                    </div>

                    {/* Referência e IVA */}
                    <div className="flex justify-between gap-4">
                      {/* Referência */}
                      <div className="w-1/2 flex flex-col justify-end">
                        <label htmlFor="referencia" className="block text-sm font-medium text-[#191919] mb-1">
                          Reference
                        </label>
                        <input
                          id="referencia"
                          type="text"
                          value={editProduct?.VREFERENCIA || ''}
                          onChange={(e) => setEditProduct({ ...editProduct, VREFERENCIA: e.target.value })}
                          placeholder="Insert reference"
                          className="w-full h-[40px] px-3 relative -top-[2px] bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                      </div>

                      {/* IVA */}
                      <div className="w-1/2">
                        <label htmlFor="iva" className="block text-sm font-medium text-[#191919] mb-1">
                          VAT
                        </label>
                        <Select
                          inputId="iva"
                          name="iva"
                          options={ivaOptions.map(vat => ({
                            value: vat.VCODI,
                            label: vat.VDESC,
                          }))}
                          value={
                            ivaOptions
                              .map(vat => ({ value: vat.VCODI, label: vat.VDESC }))
                              .find(option => option.value === selectedIva) || null
                          }
                          onChange={(selectedOption) => {
                            setSelectedIva(selectedOption ? selectedOption.value : "");
                          }}
                          isSearchable
                          className="w-full p-1"
                          classNamePrefix="select"
                          placeholder="Select VAT"
                        />
                      </div>
                    </div>


                    {/* Tabela */}
                    <div className="overflow-x-auto border border-gray-300 rounded">
                      <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="bg-[#FC9D25] text-white">
                          <tr>
                            <th className="px-4 py-2">Class</th>
                            <th className="px-4 py-2">Property</th>
                            <th className="px-4 py-2">Period</th>
                            <th className="px-4 py-2">Hours</th>
                            <th className="px-4 py-2">PVP</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2">VAT</th>
                            <th className="px-4 py-2 text-center">✓</th>
                            <th className="px-4 py-2 text-center">
                              <HiDotsVertical size={18} />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPrices.map((price, index) => {

                            const handlePvpChange = (e) => {
                              const newValue = parseFloat(e.target.value);
                              if (!isNaN(newValue)) {
                                // atualiza o valor do PVP em filteredPrices
                                const updatedPrices = [...filteredPrices];
                                updatedPrices[index] = { ...updatedPrices[index], nValUnit: newValue };
                                // atualiza o estado com o novo valor
                                setFilteredPrices(updatedPrices);
                              }
                            };

                            return (
                              <tr key={index} className="bg-gray-100">
                                <td className="px-4 py-2">{getClassName(price.VCodClas)}</td>
                                <td className="px-4 py-2">{price.cexpName || '-'}</td>
                                <td className="px-4 py-2 min-w-[8rem]">{getPeriodDescription(price.VCodPeri)}</td>
                                <td className="px-4 py-2">{getHourDescription(price.VCodInthoras)}</td>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    value={price.nValUnit?.toFixed(2) || ''}
                                    onChange={handlePvpChange}
                                    className="border rounded px-2 py-1 block w-full"
                                  />

                                </td>
                                <td className="px-4 py-2">0.00€</td>
                                <td className="px-4 py-2">
                                  <select
                                    value={price.VCodIva ?? ''}
                                    onChange={(e) => handleVatChange(index, Number(e.target.value))}
                                    className="border rounded px-2 py-1 w-1/2"
                                  >
                                    <option value="">—</option>
                                    {ivaOptions.map((vat) => (
                                      <option key={vat.VCODI} value={vat.VCODI}>
                                        {vat.VDESC}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={!price.Indisponivel}
                                    onChange={(e) =>
                                      setPrices((prev) =>
                                        prev.map((p) =>
                                          p.id === price.id ? { ...p, Indisponivel: !e.target.checked } : p
                                        )
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <HiDotsVertical size={18} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/*Criado por , em: , Ultima vez alterado por: , Em:*/}
                    <div className="flex justify-end gap-4">
                      {/* Criado por: */}
                      <div className="w-1/4">
                        <label className="block text-sm font-medium text-[#191919] mb-1">
                          Created by:
                        </label>
                        <div className="w-full h-[30px] px-3 bg-gray-100 rounded text-sm text-gray-700 flex items-center">
                          {editProduct?.vcriadopor || '—'}
                        </div>
                      </div>

                      {/* Criado em: */}
                      <div className="w-1/4">
                        <label className="block text-sm font-medium text-[#191919] mb-1">
                          Created on:
                        </label>
                        <div className="w-full h-[30px] px-3 bg-gray-100 rounded text-sm text-gray-700 flex items-center">
                          {formatDateOnly(editProduct?.dcriadoem)}
                        </div>
                      </div>

                      {/* ultima vez alterado por:*/}
                      <div className="w-1/4">
                        <label htmlFor="vUltalpor" className="block text-sm font-medium text-[#191919] mb-1">
                          Last changed by:
                        </label>
                        <input
                          id="vUltalpor"
                          type="text"
                          value={editProduct?.vultaltpor || ''}
                          onChange={(e) => setEditProduct({ ...editProduct, vultaltpor: e.target.value })}
                          placeholder="Last changed by"
                          className="w-full h-[30px] px-3 bg-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                      </div>

                      {/* ultima vez alterado em: */}
                      <div className="w-1/4">
                        <label htmlFor="dAlteradoem" className="block text-sm font-medium text-[#191919] mb-1">
                          Changed on:
                        </label>
                        <input
                          id="dAlteradoem"
                          type="date"
                          value={formatToInputDate(editProduct?.dUltAltEm)}
                          onChange={(e) => setEditProduct({ ...editProduct, dultaltem: e.target.value })}
                          className="w-full h-[30px] px-3 bg-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                      </div>
                    </div>
                  </form>
                )}
              </ModalBody>


              <ModalFooter className="w-full border-t border-gray-200 pt-4 px-6 flex justify-end gap-4">
                <Button
                  onClick={onEditModalClose}
                  className="px-6 py-2 bg-[#EDEBEB] text-[#191919] rounded-md hover:bg-gray-300 font-medium transition duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="updateProductForm"
                  className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                  onClick={() => window.location.reload()}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Table */}
      <div className="mt-5">
        {paginatedProducts.length > 0 ? (
          <table className="w-full text-left mb-5 border-collapse">
            <thead>
              <tr className="bg-[#FC9D25] text-white h-12">
                <th className="pl-2 pr-2 w-8 border-r border-[#e6e6e6]">
                  <FaGear size={18} color="white" />
                </th>
                {[
                  { label: 'Cod prod', key: 'VPRODUTO', align: 'text-right', width: 'w-16' },
                  { label: 'Description', key: 'VDESC1', align: 'text-left', width: 'w-50' },
                  { label: 'Cod subfam', key: 'VSUBFAM', align: 'text-left', width: 'w-16' },
                  { label: 'Desc subfam', key: 'VDescSubfamily', align: 'text-left', width: 'w-50' },
                  { label: 'Cod fam', key: 'VCodFam', align: 'text-left', width: 'w-16' },
                  { label: 'Desc fam', key: 'VDescFamily', align: 'text-left', width: 'w-50' },
                  { label: 'Cod grp', key: 'VCodGrfam', align: 'text-left', width: 'w-16' },
                  { label: 'Desc grp', key: 'VDescGroup', align: 'text-left', width: 'w-50' },
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
              {sortedProducts.map((product, index) => (
                <tr
                  key={product.VPRODUTO || index}
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
                      <DropdownMenu aria-label="Dynamic Actions" placement="bottom-end" className="bg-white shadow-lg rounded-md p-1">
                        <DropdownItem key="edit" onPress={() => handleEditProduct(product)}>
                          Edit
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </td>
                  <td className="pl-2 pr-2 w-16 text-right border-r border-[#e6e6e6]">{product.VPRODUTO}</td>
                  <td className="pl-2 pr-2 w-32 border-r border-[#e6e6e6]">{product.VDESC1
                    .toLowerCase()
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                  </td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{product.VSUBFAM}</td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{product.VDescSubfamily
                    .toLowerCase()
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                  </td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{product.VCodFam}</td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{product.VDescFamily
                    .toLowerCase()
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                  </td>
                  <td className="pl-2 pr-2 border-r border-[#e6e6e6]">{product.VCodGrfam}</td>
                  <td className="pl-2 pr-2">{product.VDescGroup
                    .toLowerCase()
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No products available</p>
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
          items={paginatedProducts}
          setPage={setCurrentPage}
          dataCSVButton={paginatedProducts.map((item) => ({
            Codprod: item.Codprod,
            Description: item.descricao,
          }))}
        />
      </div>
    </div>
  );
};


export default DataProduct;