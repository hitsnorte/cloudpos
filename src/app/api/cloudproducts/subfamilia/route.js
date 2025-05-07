// src/app/api/cloudproducts/subfamilia/route.js

import prisma from '@/src/lib/prisma';

export async function GET(request) {
    try {
        const propertyID = request.headers.get('X-Property-ID');
        const subfamID = request.headers.get('X-Subfam-ID');

        if (!propertyID || !subfamID) {
            return new Response(
                JSON.stringify({ error: "Cabeçalhos 'X-Property-ID' e 'X-Subfam-ID' são obrigatórios." }),
                { status: 400, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        const API_BASE_URL = process.env.API_BASE_URL;
        const propertyResponse = await fetch(`${API_BASE_URL}/api/properties/get_properties/${propertyID}`);
        if (!propertyResponse.ok) {
            return new Response(
                JSON.stringify({ error: "Erro ao acessar informações da propriedade." }),
                { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        const propertyData = await propertyResponse.json();
        const { propertyServer, propertyPort } = propertyData;

        const subfamilyUrl = `http://${propertyServer}:${propertyPort}/getsubfamilia`;
        const subfamilyResponse = await fetch(subfamilyUrl);
        if (!subfamilyResponse.ok) {
            return new Response(
                JSON.stringify({ error: "Erro ao acessar o servidor de subfamílias." }),
                { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        const subfamilias = await subfamilyResponse.json();
        const subfamIDNum = parseInt(subfamID, 10);

        const found = subfamilias.find(sf => sf.VCodSubFam === subfamIDNum);

        if (!found) {
            return new Response(
                JSON.stringify({ error: "Subfamília não encontrada." }),
                { status: 404, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        return new Response(
            JSON.stringify({ status: "success", data: found }),
            { status: 200, headers: { "content-type": "application/json; charset=UTF-8" } }
        );

    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: "Erro interno do servidor." }),
            { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
        );
    }
}
