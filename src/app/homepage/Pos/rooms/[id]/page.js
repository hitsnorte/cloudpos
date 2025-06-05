'use client';
import React, { useState, useEffect } from 'react';
import { FaDoorOpen } from "react-icons/fa";
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [propertyID, setPropertyID] = useState(null);
    const router = useRouter();
    const params = useParams();

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

    return (
        <>
            <h1 className="text-3xl font-semibold px-4">Rooms</h1>
            <div className="px-4 flex flex-wrap gap-6 p-6">
                {rooms.map((room, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            localStorage.setItem("selectedSala", JSON.stringify(room));
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
