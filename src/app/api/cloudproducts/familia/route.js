// src/app/api/cloudproducts/familia/route.js

import prisma from '@/src/lib/prisma';

export async function GET(request) {
    try {
        const propertyID = request.headers.get('X-Property-ID');
        const famID = request.headers.get('X-Fam-ID');

        if (!propertyID || !famID) {
            return new Response(
                JSON.stringify({ error: "Cabeçalhos 'X-Property-ID' e 'X-Fam-ID' são obrigatórios." }),
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

        const familyUrl = `http://${propertyServer}:${propertyPort}/getfamilia`;
        const familyResponse = await fetch(familyUrl);
        if (!familyResponse.ok) {
            return new Response(
                JSON.stringify({ error: "Erro ao aceder o servidor." }),
                { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        const familias = await familyResponse.json();
        const famIDNum = parseInt(famID, 10);

        const found = familias.find(f => f.VCodFam === famIDNum);

        if (!found) {
            return new Response(
                JSON.stringify({ error: "Família não encontrada." }),
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
