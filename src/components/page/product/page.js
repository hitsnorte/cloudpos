'use client'; // Necessário para componentes client-side no App Router

import { useState, useEffect } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { Plus } from "lucide-react";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { fetchProduct, createProduct, deleteProduct, updateProduct } from '@/src/lib/apiproduct';
import { fetchSubfamily } from '@/src/lib/apisubfamily';
import { fetchFamily } from '@/src/lib/apifamily';
import { fetchGrup } from '@/src/lib/apigroup';
import { fetchIva } from '@/src/lib/apiiva';
import { fetchUnit } from '@/src/lib/apiunit';

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
  const [selectedSubfamily, setSelectedSubfamily] = useState("");
  const [selectedIva, setSelectedIva] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [isActive, setIsActive] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const [isChecked, setIsChecked] = useState(false);

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

  useEffect(() => {
    loadProducts();
    loadSubfamilies();
  }, []);

  const toggleCheck = () => {
    setIsChecked(!isChecked); // Alterna o estado da checkbox
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

  const filteredProducts = products.filter((product) => {
    if (!product || !product.id || !product.product_name) {
      return false; 
    }
    const searchLower = searchTerm.toLowerCase();
    return (
      product.id.toString().includes(searchLower) ||
      product.product_name.toString().toLowerCase().includes(searchLower)
    );
  });
  

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

  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditProduct = (product) => {
    setEditProduct({ ...product });
    onEditModalOpen();
  };

  const handleUpdateProduct = async (e) => {
      e.preventDefault();
      if (!editProduct || !editProduct.product_name) {
        setError('Preencha o nome do produto.');
        return;
      }
    
      try {
        console.log('Enviando para API:', { id: editProduct.id, product_name: editProduct.product_name });
        const updatedProduct = await updateProduct(editProduct.id, {
          product_name: editProduct.product_name,
          quantity: editProduct.quantity,
        });
        console.log('Resposta da API:', updatedProduct);
        setProducts(products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)));
        setEditProduct(null);
        setError(null); // Limpa o erro após sucesso
        onEditModalClose();
      } catch (err) {
        console.error('Erro ao atualizar produto:', err.message);
        console.log('Erro ao atualizar produto:', err.message);
        setError(err.message); // Define o erro para exibição no modal
      }
    };

    const ivaList = [
      { id: 1, taxa: 23, descricao: "IVA Padrão" },
      { id: 2, taxa: 13, descricao: "IVA Intermediário" },
      { id: 3, taxa: 6, descricao: "IVA Reduzido" },
      { id: 4, taxa: 0, descricao: "Isento de IVA" },
    ];

    const tipoOperacaoList = [
      { id: 1, tipo: "venda", descricao: "Venda" },
      { id: 2, tipo: "compra", descricao: "Compra" },
    ];

  return (
    <div className="p-4 pb-10">
      {/* button */}
            <Dropdown>
            <DropdownTrigger>
            <button 
                onClick={onAddModalOpen}
                className="flex fixed absolute top-4 right-14 bg-[#FC9D25] w-14 text-white p-2 shadow-lg flex items-center justify-center rounded">
                < Plus size={25}  />     
            </button> 
            </DropdownTrigger>
      
            </Dropdown>
          

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
                  <span className="text-sm h-0">{isChecked ? 'Ativo' : 'Inativo' }</span>
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

  {/* Modal para editar produto */}
  <Modal
    isOpen={isEditModalOpen}
    onOpenChange={onEditModalClose}
    size="md"
    placement="center" // Centraliza o modal
    className="w-100 bg-white shadow-xl rounded-lg"
    hideCloseButton={true}
  >
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="rounded bg-[#FC9D25] flex justify-between items-center">
          <div className="text-xl font-bold text-white">Edit product</div>
                <Button
                  onClick={onClose}
                  className="text-white bg-transparent border-0 text-2xl p-0"
                  aria-label="Close"
                >
                  &times; {/* Unicode for "×" sign */}
                </Button>
          </ModalHeader>
          <ModalBody className="py-5 px-6">
            {editProduct && (
              <form id="updateProductForm" onSubmit={handleUpdateProduct} className="space-y-6">
                <div>
                  <label htmlFor="productAbbreviation" className="block text-sm font-medium text-gray-400 mb-1">
                    Abbreviation
                  </label>
                  <input
                    id="productAbreviatura"
                    type="text"
                    value={editProduct ? editProduct.Abreviatura : ''}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, Abreviatura: e.target.value })
                    }
                    placeholder="Digite a Abbreviation do produto"
                    className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                    required
                  />
                </div>
                 <div >
                  <label htmlFor="productDescription" className="block text-sm font-medium text-gray-400 mb-1">
                      Description
                  </label>
                  <input
                      id="product"
                      type="text"   
                      value={editProduct ? editProduct.VDESC1 : ''}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, VDESC1: e.target.value })
                      }
                      placeholder="Digite a descriçao do produto"
                      className="w-full p-1 bg-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                      required
                    />
                    {quantityError && (
                      <p className="text-red-500 text-sm mt-1">{quantityError}</p>
                    )}
                </div>
               
                {/* <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={ativo}
                      onChange={(e) => setAtivo(e.target.checked)}
                    />
                    {ativo ? "Ativo" : "Inativo"}
                  </label>
                </div> */}
              
        
              </form>
            )}
          </ModalBody>
          <ModalFooter className="w-102 border-t border-gray-200 pt-2 px-8">
            <Button
              type="submit"
              form="updateProductForm"
              className="px-6 py-2 bg-[#FC9D25] text-white rounded-md hover:bg-gray font-medium transition duration-200"
              onClick={() => window.location.reload()} // Recarrega a página ao clicar
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
                  <FaGear size={20} color='white'/>
                </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-20 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className="flex items-left justify-left "> 
                  Cod Prod
              </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-150 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                <div className="flex items-left justify-left"> 
                  Abbreviation
                </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-150 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className="flex items-left justify-left"> 
                  Description
              </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-5 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className=" flex items-left justify-left "> 
                  Cod Iva
              </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-180 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className="flex items-left justify-left"> 
                  Desc Iva
              </div>
              </th>
             
              <th className="uppercase border-collapse border border-[#EDEBEB] w-15 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className="flex items-left justify-left "> 
                  ID Unit
              </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-130 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className="flex items-left justify-left"> 
                 Desc Unit
              </div>
              </th>
            
              <th className="uppercase border-collapse border border-[#EDEBEB] w-5 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className="flex items-left justify-left "> 
                  Product of
              </div>

              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-10 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
                <div className="flex items-left justify-left"> 
                Active
                </div>
              </th>

              <th className="uppercase border-collapse border border-[#EDEBEB] w-5 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className=" items-left justify-left "> 
                  Cod SubFam
              </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-130 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className=" items-left justify-left"> 
                  Desc SubFam
              </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-5 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className=" items-left justify-left "> 
                  Cod Fam
              </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-130 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className=" items-left justify-left"> 
                  Desc Fam
              </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-5 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className=" items-left justify-left "> 
                  Cod Grp
              </div>
              </th>
              <th className="uppercase border-collapse border border-[#EDEBEB] w-130 sm:px-3 py-2 bg-[#FC9D25] text-[#FAFAFA] text-sm">
               <div className=" items-left justify-left"> 
                  Desc Grp
              </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
          {paginatedProducts.map((product)  => (
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
              <td className="border border-[#EDEBEB] px-4 py-2 text-right">{product.VPRODUTO}</td>
              <td className="border border-[#EDEBEB] px-3 py-2 text-left">{product.Abreviatura}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-left">{product.VDESC1}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-right">{product.VCodIva}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-left">{product.VDescIva}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-right">{product.DefinicaoProduto}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-left">{product.VDescUnit}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-left">{product.ProductType}</td>

              <td className="py-4 px-2 flex items-center justify-center">
                {product.activo ? (
                  <FaCheckCircle size={20} color="#4CAF50" className="self-center" />  // Aqui você pode ajustar o tamanho e a cor do ícone
                ) : (
                  ""
                )}
              </td>

              <td className="border border-[#EDEBEB] px-4 py-2 text-right">{product.VSUBFAM}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-left">{product.VDescSubfamily}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-right">{product.VCodFam}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-left">{product.VDescFamily}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-right">{product.VCodGrfam}</td>
              <td className="border border-[#EDEBEB] px-4 py-2 text-left">{product.VDescGroup}</td>

             
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
};

export default DataProduct;