'use client';
import React, { useState, useEffect } from 'react';
import { MdPointOfSale } from "react-icons/md";
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function ProductGroups() {
    const [postos, setPostos] = useState([]);
    const [propertyID, setPropertyID] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const storedID = localStorage.getItem('selectedProperty');
        if (storedID) {
            setPropertyID(storedID);
        } else {
            console.warn("Nenhuma propriedade encontrada no localStorage!");
        }
    }, []);

    useEffect(() => {
        if (propertyID) {
            fetchPostos(propertyID);
        }
    }, [propertyID]);

    const fetchPostos = async (id) => {
        try {
            const response = await axios.get(`/api/POS/outlets`, {
                headers: {
                    'X-Property-ID': id
                }
            });
            setPostos(response.data.data);
        } catch (error) {
            console.error("Erro ao buscar postos:", error);
            setPostos([]);
        }
    };

    return (
        <>
            <h1 className="text-3xl font-semibold px-4">Outlets</h1>
            <div className="px-4 flex flex-wrap gap-6 p-6">
                {postos.map((posto, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            localStorage.setItem("selectedPosto", JSON.stringify(posto));
                            router.push(`/homepage/Pos/rooms/${posto.Icodi}`);
                        }}
                        className="w-72 h-48 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition"
                    >
                        <MdPointOfSale size={50} color="#FC9D25" />
                        <p className="text-center text-sm text-gray-600 mt-4">
                            {posto.VDescricao}
                        </p>
                    </div>
                ))}
            </div>
        </>
    );
}
