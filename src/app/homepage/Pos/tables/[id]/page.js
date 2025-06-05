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
        if (clientNumber.trim() !== '' && selectedTable) {
            console.log("Número de clientes:", clientNumber);
            setClienteNumber(clientNumber);
            setShowModal(false);

            setTimeout(() => {
                localStorage.setItem("selectedMesa", JSON.stringify(selectedTable));
                router.push(`/homepage/Pos/cart/${selectedTable.ID_Mesa}`);
            }, 300);
        }
    };

    return (
        <>
            <h1 className="text-3xl font-semibold">Tables</h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6">
                {tables.map((table, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            setSelectedTable(table); // <- adiciona isso
                            setShowModal(true);
                        }}
                        className="w-full h-40 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col items-center cursor-pointer hover:bg-gray-100 transition"
                    >
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
                                {table.Descricao || 'Sem nome'}
                            </p>
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
