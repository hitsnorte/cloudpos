'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

//import modal nrm clientes
import PopUpModal from '@/src/components/modals/nrm_clients/page';

export default function Tables() {
    const [propertyID, setPropertyID] = useState(null);
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [clientNumber, setClienteNumber] = useState(null);
    const [tempTable, setTempTable] = useState(null);

    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        const storedID = localStorage.getItem('selectedProperty');
        if (storedID) {
            setPropertyID(storedID);
            console.log("PropertyID do localStorage:", storedID);
        } else {
            console.warn("Nenhuma propriedade encontrada no localStorage!");
        }
    }, []);



    useEffect(() => {
        if (!propertyID || !params?.id) {
            console.log("Aguardando propertyID e id da sala...");
            return;
        }

        const fetchTables = async () => {
            try {
                const response = await axios.get('/api/POS/tables', {
                    headers: { 'X-Property-ID': propertyID }
                });

                const allTables = response.data.data;
                const roomId = Number(params.id); // ID_Sala do parâmetro da URL

                const filteredTables = allTables.filter(
                    table => table.ID_Sala === roomId
                );

                console.log("Mesas filtradas para sala", roomId, filteredTables);
                setTables(filteredTables);
            } catch (error) {
                console.error("Erro ao buscar as mesas:", error);
                setTables([]);
            }
        };

        fetchTables();
    }, [propertyID, params?.id]);

    //função para fechar o modal de pax
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleClientNumberSubmit = (clientNumber) => {
        if (clientNumber.trim() !== '' && tempTable) {
            console.log("Número de clientes:", clientNumber);
            setClienteNumber(clientNumber);
            setShowModal(false);

            // Obter dados atuais
            const mesaPaxMap = JSON.parse(localStorage.getItem("mesaPaxMap") || "{}");

            // Atualizar ou adicionar entrada
            mesaPaxMap[tempTable.ID_Mesa] = clientNumber;

            // Salvar no localStorage
            localStorage.setItem("mesaPaxMap", JSON.stringify(mesaPaxMap));

            localStorage.removeItem("selectedMesa");
            localStorage.setItem("selectedMesa", JSON.stringify(tempTable));
            localStorage.setItem("previousPage", window.location.pathname);

            setTimeout(() => {
                router.push(`/homepage/Pos/cart/${tempTable.ID_Mesa}`);
            }, 0);
        }
    };

    const mesaPaxMap = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem("mesaPaxMap") || "{}")
        : {};

    const mesaTotalMap = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem("mesaTotalMap") || "{}")
        : {};


    const handleBack = () => {
        const postoId = localStorage.getItem("postoId");
        if (postoId) {
            router.push(`/homepage/Pos/rooms/${postoId}`);
        } else {
            router.back(); // fallback
        }
    };


    return (
        <>
            <div className="flex items-center px-6 mt-4 mb-2">
                <button
                    onClick={handleBack}
                    className="px-3 -ml-2 py-1 bg-[#FC9D25] text-white rounded hover:bg-gray-300 transition"
                >
                    ← Rooms
                </button>
                <h1 className="text-3xl font-semibold ml-3">Tables</h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6">
                {tables.map((table, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            setSelectedTable(table); // <- adiciona isso
                            setTempTable(table); // ← armazena temporariamente
                            setShowModal(true);
                        }}
                        className="relative w-full h-40 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col items-center cursor-pointer hover:bg-gray-100 transition"
                    >
                        {mesaPaxMap[table.ID_Mesa] && (
                            <span className="absolute top-2 left-2 text-[10px] w-5 h-5 flex items-center justify-center bg-red-600 text-white rounded-full shadow-sm">
                                {mesaPaxMap[table.ID_Mesa]}
                            </span>
                        )}

                        <div className="flex flex-col items-center justify-center w-full h-full">
                            <div className="mb-2">
                                <img
                                    src={"/icons/table_icon.png"}
                                    alt="table icon"
                                    width={80}
                                    className="mx-auto"
                                />
                            </div>
                            <p className="text-center text-sm text-[#191919]">
                                {table.Descricao
                                    ? table.Descricao
                                        .toLowerCase()
                                        .split(" ")
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(" ")
                                    : "Sem nome"}
                            </p>
                            {mesaTotalMap[table.ID_Mesa] && (
                                <span className="absolute bottom-2 right-2 text-xs font-semibold text-green-700 bg-white px-1 rounded shadow-sm">
                                    € {mesaTotalMap[table.ID_Mesa].toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>


            {
                showModal && (
                    <PopUpModal
                        onClose={handleCloseModal}
                        onSubmit={handleClientNumberSubmit}
                    />
                )
            }
        </>
    );
}