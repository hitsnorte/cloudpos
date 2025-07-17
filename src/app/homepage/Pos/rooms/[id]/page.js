'use client';
import React, { useState, useEffect } from 'react';
import { FaDoorOpen } from "react-icons/fa";
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { IoIosSwap } from "react-icons/io";

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [propertyID, setPropertyID] = useState(null);
    const router = useRouter();
    const params = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);


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
            console.log("Aguardando propertyID e postoId...");
            return;
        }

        const fetchFilteredRooms = async () => {
            try {
                const [roomsRes, relationsRes] = await Promise.all([
                    axios.get('/api/POS/rooms', {
                        headers: { 'X-Property-ID': propertyID }
                    }),
                    axios.get('/api/POS/rooms/rooms_outlets', {
                        headers: { 'X-Property-ID': propertyID }
                    })
                ]);

                const allRooms = roomsRes.data.data;
                const allRelations = relationsRes.data.data;

                const postoId = params.id.toString();

                const allowedRoomIDs = allRelations
                    .filter(relation => relation.Posto === postoId)
                    .map(relation => Number(relation.ID_Sala));

                const filteredRooms = allRooms.filter(room =>
                    allowedRoomIDs.includes(Number(room.ID_SALA))
                );

                setRooms(filteredRooms);
            } catch (error) {
                console.error("Erro ao buscar ou filtrar rooms:", error);
                setRooms([]);
            }
        };

        fetchFilteredRooms();
    }, [propertyID, params?.postoId]);

    const handleBack = () => {
        router.push('/homepage/Pos/outlets');
    };

    return (
        <>
            <div className="flex items-center px-6 mt-4 mb-2">
                <button
                    onClick={handleBack}
                    className="px-3 -ml-2 py-1 bg-[#FC9D25] text-white rounded hover:bg-gray-300 transition"
                >
                    ← Outlets
                </button>
                <h1 className="text-3xl font-semibold ml-4">Rooms</h1>

                {/* butao e modal para selecionar price class */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 ml-164 py-3 bg-[#FC9D25] text-white rounded hover:bg-gray-300 transition"
                >
                    <IoIosSwap />
                </button>

                {isModalOpen && (
                    <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center">
                        <div className="bg-[#FAFAFA] w-100 rounded-lg shadow-lg">
                            <div className="flex justify-between items-center mb-4 px-4 py-3 bg-[#FC9D25] rounded-t-lg">
                                <h2 className="text-l font-semibold text-white ml-1">Select Price Class</h2>
                            </div>
                            <div className="flex justify-end space-x-3 ml-8 mb-5 m-5 mr-7">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-10.5 py-1 bg-[#D3D3D3] text-white rounded-md hover:bg-gray font-medium transition duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}


            </div>
            <div className="px-4 flex flex-wrap gap-6 p-6">
                {rooms.map((room, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            localStorage.setItem("selectedSala", JSON.stringify(room));
                            localStorage.setItem("postoId", params.id); // ← adicione isto
                            router.push(`/homepage/Pos/tables/${room.ID_SALA}`);
                        }}
                        className="w-72 h-48 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition"
                    >
                        <FaDoorOpen className="text-[#FC9D25]" size={50} />
                        <p className="text-center text-sm text-gray-600 mt-4">
                            {room.Descricao || "Sem descrição"}
                        </p>
                    </div>
                ))}
            </div>
        </>
    );
}