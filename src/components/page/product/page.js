'use client'; // Necessário para componentes client-side no App Router

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

const PAGE_SIZES = [25, 50, 150, 250];

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
  const [selectedSubfamily, setSelectedSubfamily] = useState(null);
  const [selectedIva, setSelectedIva] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [isChecked, setIsChecked] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: 'VDesc', direction: 'asc' });
  const [options, setOptions] = useState({});
  const [loading , setLoading] = useState(true);

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

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      setIsLoading(true);
      try {
        await deleteProduct(productToDelete);
        setProducts(products.filter((product) => product.id !== productToDelete));
        setProductToDelete(null);
        onDeleteModalClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loadColumnVisibility = () => {
    const savedVisibility = localStorage.getItem('columnVisibility');
    if (savedVisibility) {
      return JSON.parse(savedVisibility);
    }
    return {
      codProd: true, // estado padrão
      abbreviation: true,
      description: true,
      codIva: true,
      descIva: true,
      IDunit: true,
      descUnit: true,
      productOf: true,
      active: true,
      codSubfam: true,
      descSubFam: true,
      codFam: true,
      descFam: true,
      codGrpFam: true,
      descGrp: true,
    };
  };

  const saveColumnVisibility = () => {
    localStorage.setItem('columnVisibility', JSON.stringify(columnVisibility));
  };

  const toggleColumn = (column) => {
    setColumnVisibility((prev) => {
      const newVisibility = { ...prev, [column]: !prev[column] };
      localStorage.setItem('columnVisibility', JSON.stringify(newVisibility)); // Atualiza no localStorage
      return newVisibility;
    });
  };

  // Agora você pode usar a loadColumnVisibility ao inicializar o state
  const [columnVisibility, setColumnVisibility] = useState(loadColumnVisibility());

  const filteredProducts = products.filter((product) =>
    Object.values(product).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const columns = [
    { key: 'codProd', label: 'Cod Grp' },
    { key: 'abbreviation', label: 'Abbreviation' },
    { key: 'description', label: 'Description' },
    { key: 'codIva', label: 'Cod IVA' },
    { key: 'descIva', label: 'Desc IVA' },
    { key: 'IDunit', label: 'ID Unit' },
    { key: 'descUnit', label: 'Desc Unit' },
    { key: 'productOf', label: 'Product Of' },
    { key: 'active', label: 'Active' },
    { key: 'codSubfam', label: 'Cod SubFam' },
    { key: 'descSubFam', label: 'Desc SubFam' },
    { key: 'codFam', label: 'Cod Fam' },
    { key: 'descFam', label: 'Desc Fam' },
    { key: 'codGrpFam', label: 'Cod Grp' },
    { key: 'descGrp', label: 'Desc Grp' },
  ];

  const [columnSearchTerm, setColumnSearchTerm] = useState('');

  const filteredColumns = columns.filter((col) =>
    col.label.toLowerCase().includes(columnSearchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        dultaltem: editProduct.dUltAltEm,
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

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

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
          'X-Fam-ID':famID? famID.toString(): '',
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
        setFamilyName('Not found');
      }
    } catch (error) {
      console.error('Error fetching family:', error);
      setFamilyName('Error while loading');
    } finally {
      setLoadingFamily(false);
    }
  }

  // Simulação do carregamento da subfamília ao renderizar
  useEffect(() => {
    const loadSubfam = async () => {
      await fetchSubFamilia(editProduct.VSUBFAM);
    };

    loadSubfam();
  }, []);

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
        console.error('Error while loading price classes:', error);
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
        console.error("Error while loading periods:", error);
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
        console.error("Error while loading hours:", error);
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
        setGroup('Not found');
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      setGroup('Error while loading');
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

  //Ativa/Desativa as checkbox localmente , NENHUMA ALTERAÇÂO É FEITA NA BD
  const toggleIndisponivel = (id) => {
    setFilteredPrices((prevPrices) =>
        prevPrices.map((price) =>
            price.vCodigo === id
                ? { ...price, Indisponivel: !price.Indisponivel }
                : price
        )
    );
  };

  useEffect(() => {
    const fetchSubfamilias = async () => {
      try {
        const response = await fetch('/api/cloudproducts/subfamilia/lista', {
          headers: {
            'X-Property-ID': localStorage.getItem('selectedProperty'),
          }
        });

        const data = await response.json();
        if (Array.isArray(data.data)) {
          const formatted = data.data.map(sf => ({
            value: sf.VCodSubFam,
            label: sf.VDesc,
            familyID:sf.VCodFam,
            groupID: sf.VCodGrfam
          }));
          setOptions(formatted);
        }
      } catch (error) {
        console.error("Error while fetching subfamilies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubfamilias();
  }, []);

  useEffect(() => {
    if (!selectedSubfamily) {
      setFamilyName('');
      setGroup('');
      return;
    }

    if (selectedSubfamily.groupID) {
      fetchGroup(selectedSubfamily.groupID);
    } else {
      setGroup('Unknown');
    }

    if (selectedSubfamily.familyID) {
      fetchFamilia(selectedSubfamily.familyID);
    } else {
      setFamilyName('Unknown');
    }
  }, [selectedSubfamily]);


  return (
    <div className="p-4 pb-10">
      <div className="w-full">
        {/* Campo de pesquisa */}
        <div className="mb-4 relative">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full  pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>


      {/* button */}
      <Dropdown>
        <DropdownTrigger>
          <button
            onClick={onAddModalOpen}
            className="flex fixed absolute top-4 right-25 bg-[#FC9D25] w-14 text-white p-2 shadow-lg items-center justify-center rounded">
            < Plus size={25} />
          </button>
        </DropdownTrigger>
      </Dropdown>

      {/* button adjustments*/}
      <Dropdown>
        <DropdownTrigger>
          <button
            onClick={onSelectModalOpen}
            className="absolute top-4 right-10 bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded">
            <HiAdjustmentsHorizontal size={25} />
          </button>
        </DropdownTrigger>
      </Dropdown>

      {/* Modal para adjustments do grupo */}
      <Modal
        isOpen={isSelectModalOpen}
        onOpenChange={onSelectModalClose}
        size="sm"
        placement="center"
        className="w-100 bg-white shadow-xl rounded-lg"
        hideCloseButton={true}
      >

        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="rounded bg-[#FC9D25] flex justify-between items-center">
                <div className="text-xl font-bold text-white">Select Column</div>
                <Button
                  onClick={onClose}
                  className="text-white bg-transparent border-0 text-2xl p-0"
                  aria-label="Close"
                >
                  &times; {/* Unicode for "×" sign */}
                </Button>
              </ModalHeader>
              <ModalBody className="py-5 px-6">
                <div className="w-88">
                  {/* Campo de pesquisa  */}
                  <div className="mb-4 relative">
                    <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Pesquisar..."
                      value={columnSearchTerm}
                      onChange={(e) => setColumnSearchTerm(e.target.value)}
                      className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {filteredColumns.map((col) => (
                    <div key={col.key} className="flex items-center rounded border border-black p-1">
                      <input
                        type="checkbox"
                        checked={columnVisibility[col.key]}
                        onChange={() => toggleColumn(col.key)}
                        className="mr-2"
                      />
                      <label className="text-sm">{col.label}</label>
                    </div>
                  ))}
                </div>
              </ModalBody>

              <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
                <Button
                  type="submit"
                  form="selectGroupForm"
                  className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                  disabled={isLoading}
                  onClick={() => {
                    saveColumnVisibility(); // Salvar as configurações
                    window.location.reload(); // Recarregar a página
                  }}
                >
                  {isLoading ? <Spinner size="sm" color="white" /> : 'Save'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para adicionar produto */}
      <Modal
        isOpen={isAddModalOpen}
        onOpenChange={onAddModalClose}
        size="md"
        placement="center"
        className="w-100 bg-white shadow-xl rounded-lg"
        hideCloseButton={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="rounded bg-[#FC9D25] flex justify-between items-center">
                <div className="text-xl font-bold text-white">New product</div>
                <Button
                  onClick={onClose}
                  className="text-white bg-transparent border-0 text-2xl p-0"
                  aria-label="Close"
                >
                  &times; {/* Unicode for "×" sign */}
                </Button>
              </ModalHeader>
              <ModalBody className="py-5 px-6">
                <form id="addProductForm" onSubmit={handleAddProduct} className="space-y-6">
                  <div className="flex items-center space-x-3"> {/* Usando 'flex' para alinhar os itens na mesma linha */}
                    <div className="flex flex-col">
                      <label htmlFor="abreviatura" className="block text-sm font-medium text-gray-400 mb-1">
                        Abreviatura
                      </label>
                      <input
                        id="newAbreviatura"
                        type="text"
                        name="abreviatura"
                        placeholder="Digite a abreviatura"
                        className="w-65 p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                        required
                      />
                    </div>

                    {/* Checkbox estilizado */}
                    <div
                      onClick={toggleCheck}
                      className={`w-6 h-6 border rounded-md flex items-center justify-center cursor-pointer 
                      ${isChecked ? 'bg-[#FC9D25]' : 'bg-gray-200'} mt-6 `}
                    >
                      {isChecked && <span className="text-white text-xl">X</span>}
                    </div>

                    {/* Texto opcional ao lado da checkbox */}
                    <span className="text-sm h-0">{isChecked ? 'Ativo' : 'Inativo'}</span>
                  </div>

                  <div>
                    <label htmlFor="descricao" className="block text-sm font-medium text-gray-400 mb-1">
                      Descrição
                    </label>
                    <input
                      id="newDescricao"
                      type="text"
                      name="descricao"

                      placeholder="Digite a descricao"
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="CodProd" className="block text-sm font-medium text-gray-400 mb-1">
                      Codigo do produto
                    </label>
                    <input
                      id="newCodProd"
                      type="text"
                      name="codProd"
                      placeholder="Digite o Codigo do produto"
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="Conta" className="block text-sm font-medium text-gray-400 mb-1">
                      Conta CBL/ERP
                    </label>
                    <input
                      id="newConta"
                      type="text"
                      name="conta"
                      placeholder="Digite a conta CBL/ERP"
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="Artigo" className="block text-sm font-medium text-gray-400 mb-1">
                      Tipo de Artigo
                    </label>
                    <input
                      id="newArtigo"
                      type="text"
                      name="Artigo"
                      placeholder="Digite o Tipo de artigo"
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <select
                      className="w-full p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                      value={selectedIva}
                      onChange={(e) => setSelectedIva(e.target.value)}
                    >
                      <option value="">Iva</option>
                      {ivaList.map((iva) => (
                        <option key={iva.id} value={iva.taxa}>
                          {iva.taxa}% - {iva.descricao}
                        </option>
                      ))}
                    </select>

                  </div>
                  <div>
                    <select
                      className="w-full p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                      value={selectedTipo}
                      onChange={(e) => setSelectedTipo(e.target.value)}
                    >
                      <option value="">Produto de</option>
                      {tipoOperacaoList.map((tipo) => (
                        <option key={tipo.id} value={tipo.tipo}>
                          {tipo.descricao}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              </ModalBody>
              <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
                <Button
                  type="submit"
                  form="addProductForm"
                  className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                  disabled={isLoading}
                  onClick={() => window.location.reload()} // Recarrega a página ao clicar
                >
                  {isLoading ? <Spinner size="sm" color="white" /> : 'Adicionar'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para editar produtos */}
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
                              className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 text-[#191919]"
                              required
                          />
                        </div>

                        {/* Detalhes do tipo de produto */}
                        <div className="w-1/2 flex gap-2 items-end">
                          {/* Tipo de produto */}
                          <div className="flex flex-col w-1/3">
                            <label className="text-sm font-medium text-[#191919] mb-1">Prod. Type</label>
                            <div className="bg-gray-200 p-1 rounded text-sm text-[#191919]">
                              {editProduct?.vtipprod || '—'}
                            </div>
                          </div>

                          {/* Tipo de produto */}
                          <div className="flex flex-col w-1/3">
                            <label className="text-sm font-medium text-[#191919] mb-1">Type</label>
                            <div className="bg-gray-200 p-1 rounded text-sm text-[#191919]">
                              {editProduct?.ProductType || '—'}
                            </div>
                          </div>

                          {/* Status*/}
                          <div className="flex flex-col w-1/3 items-center">
                            <label className="text-sm font-medium text-[#191919] mb-1">Status</label>
                            <label className="flex items-center gap-1 text-sm text-[#191919]">
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
                            className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 text-[#191919]"
                        />
                      </div>

                      {/* Sub-Família, Family, Group */}
                      <div className="flex justify-between gap-4 mb-4">
                        {/* Sub-Família */}
                        <div className="w-1/3">
                          <label htmlFor="subFamilia" className="text-sm font-medium text-[#191919] mb-1 block ">
                            Subfamily
                          </label>
                          <Select
                          inputId="subFamilia"
                          name="subFamilia"
                          options={options}
                          value={ selectedSubfamily || null}
                          onChange={selected => setSelectedSubfamily(selected || '')}
                          isSearchable
                          isLoading={loading}
                          placeholder="Selecione uma Subfamília"
                          className="w-full p-1"
                          classNamePrefix="select"
                          />
                        </div>

                        {/* Familia */}
                        <div className="w-1/3">
                          <label htmlFor="family" className="text-sm font-medium text-[#191919] mb-1 block">
                            Family
                          </label>
                          <div
                              id="family"
                              className="flex items-center h-[40px] px-3 p-1 bg-gray-200 rounded text-sm text-[#191919]"
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
                              className="flex items-center w-full h-[40px] px-3 p-1 bg-gray-200 rounded text-sm text-[#191919]"
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
                        <div className="w-full">
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
                        <table className="min-w-full text-sm text-left text-[#191919]">
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
                                        className="border border-gray-300 rounded px-2 py-1 block w-full"
                                    />

                                  </td>
                                  <td className="px-4 py-2">0.00€</td>
                                  <td className="px-4 py-2">
                                    <select
                                        value={price.VCodIva ?? ''}
                                        onChange={(e) => handleVatChange(index, Number(e.target.value))}
                                        className="border border-gray-300 rounded px-2 py-1 w-1/2"
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
                                    <input type="checkbox" checked={!price.Indisponivel}
                                            onChange={() => toggleIndisponivel(price.vCodigo)}/>
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
                          <div className="w-full h-[30px] px-3 bg-gray-200 rounded text-sm text-[#191919] flex items-center">
                            {editProduct?.vcriadopor || '—'}
                          </div>
                        </div>

                        {/* Criado em: */}
                        <div className="w-1/4">
                          <label className="block text-sm font-medium text-[#191919] mb-1">
                            Created on:
                          </label>
                          <div className="w-full h-[30px] px-3 bg-gray-200 rounded text-sm text-[#191919] flex items-center">
                            {formatDateOnly(editProduct?.dcriadoem)}
                          </div>
                        </div>

                        {/* ultima vez alterado por:*/}
                        <div className="w-1/4">
                          <label htmlFor="vUltalpor" className="block text-sm font-medium text-[#191919] mb-1">
                            Last changed by:
                          </label>
                          <div className="w-full h-[30px] px-3 bg-gray-200 rounded text-sm text-[#191919] flex items-center">
                            {editProduct?.vultaltpor || '—'}
                          </div>
                        </div>

                        {/* ultima vez alterado em: */}
                        <div className="w-1/4">
                          <label htmlFor="dAlteradoem" className="block text-sm font-medium text-[#191919] mb-1">
                            Changed on:
                          </label>
                          <div className="w-full h-[30px] px-3 bg-gray-200 rounded text-sm text-[#191919] flex items-center">
                            {formatDateOnly(editProduct?.dultaltem)}
                          </div>
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

      {/* Modal para excluir produto */}
      <Modal
        isOpen={isDeleteModalOpen}
        onOpenChange={onDeleteModalClose}
        size="md"
        placement="center"
        className="bg-white shadow-xl rounded-lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-center items-center border-b border-gray-200 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              </ModalHeader>
              <ModalBody className="py-6 px-8">
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <Spinner size="lg" />
                    <span className="ml-2">Deletion...</span>
                  </div>
                ) : (
                  <p className="text-center text-gray-700">Are you sure you want to delete the product?</p>
                )}
              </ModalBody>
              <ModalFooter className="flex justify-end border-t border-gray-200 pt-4 px-8">
                <Button
                  onPress={onClose}
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onPress={() => {
                    handleDeleteProduct(productToDelete);
                    onClose();
                  }}
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium ml-3"
                >
                  Exclude
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/*---------------------------------------------------------------------------------------------------------------------------------- */}
      <div className="overflow-x-auto sm:flex sm:flex-col bg-muted/40">
        <table className="w-800 bg-[#FAFAFA] border-collapse border border-[#EDEBEB] mx-auto">

          <thead>
            <tr>
              <th className="border-collapse border border-[#EDEBEB] !w-[1px] px-1 sm:px-5 py-2 bg-[#FC9D25]">
                <div className=" flex items-center justify-center">
                  <FaGear size={20} color='white' />
                </div>
              </th>
              {columnVisibility.codProd && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-10 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Cod Prod</div>
                </th>
              )}
              {columnVisibility.abbreviation && (
                <th onClick={() => handleSort('Abreviatura')} className="uppercase border-collapse border border-[#EDEBEB] w-200 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">
                    Abbreviation
                    {sortConfig.key === 'Abreviatura' && (
                      <span className="ml-auto">
                        {sortConfig.direction === 'asc' ? (
                          <ArrowUpIcon className="inline-block w-4 h-4 text-white" />
                        ) : (
                          <ArrowDownIcon className="inline-block w-4 h-4 text-white" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              )}

              {columnVisibility.description && (
                <th onClick={() => handleSort('VDESC1')} className="uppercase border-collapse border border-[#EDEBEB] w-200 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">
                    Description
                    {sortConfig.key === 'VDesc' && (
                      <span className="ml-auto">
                        {sortConfig.direction === 'asc' ? (
                          <ArrowUpIcon className="inline-block w-4 h-4 text-white" />
                        ) : (
                          <ArrowDownIcon className="inline-block w-4 h-4 text-white" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              )}
              {columnVisibility.codIva && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-20 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Cod IVA</div>
                </th>
              )}
              {columnVisibility.descIva && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-200 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Desc IVA</div>
                </th>
              )}
              {columnVisibility.IDunit && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-10 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">ID Unit</div>
                </th>
              )}
              {columnVisibility.descUnit && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-200 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Desc Unit</div>
                </th>
              )}
              {columnVisibility.productOf && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-10 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Prod Of</div>
                </th>
              )}
              {columnVisibility.active && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-10 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Active</div>
                </th>
              )}
              {columnVisibility.codSubfam && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-10 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Cod SubFam</div>
                </th>
              )}
              {columnVisibility.descSubFam && (
                <th onClick={() => handleSort('VDescSubfamily')} className="uppercase border-collapse border border-[#EDEBEB] w-200 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">
                    Desc SubFam
                    {sortConfig.key === 'VDesc' && (
                      <span className="ml-auto">
                        {sortConfig.direction === 'asc' ? (
                          <ArrowUpIcon className="inline-block w-4 h-4 text-white" />
                        ) : (
                          <ArrowDownIcon className="inline-block w-4 h-4 text-white" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              )}
              {columnVisibility.codFam && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-10 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Cod Fam</div>
                </th>
              )}
              {columnVisibility.descFam && (
                <th onClick={() => handleSort('VDescFamily')} className="uppercase border-collapse border border-[#EDEBEB] w-200 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">
                    Desc Fam
                    {sortConfig.key === 'VDesc' && (
                      <span className="ml-auto">
                        {sortConfig.direction === 'asc' ? (
                          <ArrowUpIcon className="inline-block w-4 h-4 text-white" />
                        ) : (
                          <ArrowDownIcon className="inline-block w-4 h-4 text-white" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              )}
              {columnVisibility.codGrpFam && (
                <th className="uppercase border-collapse border border-[#EDEBEB] w-10 px-1 sm:px-5 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">Cod Grp</div>
                </th>
              )}
              {columnVisibility.descFam && (
                <th onClick={() => handleSort('VDescGroup')} className="uppercase border-collapse border border-[#EDEBEB] w-200 sm:px-4 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                  <div className="flex items-left justify-left">
                    Desc Grp
                    {sortConfig.key === 'VDesc' && (
                      <span className="ml-auto">
                        {sortConfig.direction === 'asc' ? (
                          <ArrowUpIcon className="inline-block w-4 h-4 text-white" />
                        ) : (
                          <ArrowDownIcon className="inline-block w-4 h-4 text-white" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {sortedProducts.map((product) => (
              <tr key={product.VPRODUTO} className="hover:bg-gray-200">

                {/* Ações */}
                <td className="border border-[#EDEBEB] px-1 py-1 text-center">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered">
                        <HiDotsVertical size={18} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Dynamic Actions" placement="bottom-end" className="bg-white shadow-lg rounded-md p-1">
                      <DropdownItem key="edit" onPress={() => handleEditProduct(product)}>
                        Edit
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </td>

                {/* Dados do Produto */}
                {columnVisibility.codProd && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-right">{product.VPRODUTO}</td>
                )}
                {columnVisibility.abbreviation && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{product.Abreviatura}</td>
                )}
                {columnVisibility.description && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{product.VDESC1}</td>
                )}
                {columnVisibility.codIva && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{product.VCodIva}</td>
                )}
                {columnVisibility.descIva && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{product.VDescIva}</td>
                )}
                {columnVisibility.IDunit && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{product.DefinicaoProduto}</td>
                )}
                {columnVisibility.descUnit && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{product.VDescUnit}</td>
                )}
                {columnVisibility.productOf && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{product.ProductType}</td>
                )}
                {columnVisibility.active && (
                  <td className=" px-4 py-2 flex items-center justify-center">
                    {product.activo ? (
                      <FaCheckCircle size={20} color="#4CAF50" />  // Aqui você pode ajustar o tamanho e a cor do ícone
                    ) : (
                      ""
                    )}
                  </td>
                )}
                {columnVisibility.codSubfam && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-right">{product.VSUBFAM}</td>
                )}
                {columnVisibility.descSubFam && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{product.VDescSubfamily}</td>
                )}
                {columnVisibility.codFam && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-right">{product.VCodFam}</td>
                )}
                {columnVisibility.descFam && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{product.VDescFamily}</td>
                )}
                {columnVisibility.codGrpFam && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-right">{product.VCodGrfam}</td>
                )}
                {columnVisibility.descGrp && (
                  <td className="border border-[#EDEBEB] px-3 py-2 text-left">{product.VDescGroup}</td>
                )}
              </tr>
            ))}
          </tbody>

        </table>

        <div className="flex fixed bottom-0 left-0 items-center gap-2 w-full px-4 py-3 bg-gray-200 justify-end">
          <span className="px-2 py-1">Items per page</span>

          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border p-2 rounded px-2 py-1 w-16"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>

          {/* Agrupamento do controle de paginação */}
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
    </div>
  );
}

  export default DataProduct;