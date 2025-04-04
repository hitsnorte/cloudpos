// src/app/api/dashboard/route.js
import prisma from '@/src/lib/prisma';

export async function GET(request) {
  try {
    const propertyID = request.headers.get('X-Property-ID');
    if (!propertyID) {
      return new Response(
        JSON.stringify({ error: "propertyID é obrigatório." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const API_BASE_URL = process.env.API_BASE_URL;

    // Obtendo as informações da propriedade
    const propertyResponse = await fetch(`${API_BASE_URL}/api/properties/get_properties/${propertyID}`);
    if (!propertyResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Erro ao acessar informações da propriedade." }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const propertyData = await propertyResponse.json();
    const { propertyServer, propertyPort } = propertyData;

    // Definindo as URLs dos endpoints
    const endpoints = [
      { key: 'totalGroups', url: `http://${propertyServer}:${propertyPort}/getgrfamiliar` },
      { key: 'totalFamilies', url: `http://${propertyServer}:${propertyPort}/getfamilia` },
      { key: 'totalSubfamilies', url: `http://${propertyServer}:${propertyPort}/getsubfamilia` },
      { key: 'totalProducts', url: `http://${propertyServer}:${propertyPort}/getproduto` }
    ];

    // Fazendo as requisições aos endpoints
    const results = await Promise.all(
      endpoints.map(async ({ key, url }) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ao acessar ${key}`);
        const data = await response.json();
        return { key, value: Array.isArray(data) ? data.length : 0 };
      })
    );
    
    // Estruturando os dados
    const responseData = Object.fromEntries(results.map(({ key, value }) => [key, value]));

    const response = {
      status: 'success',
      data: responseData,
      meta: {
        total: responseData.totalGroups + responseData.totalFamilies + responseData.totalSubfamilies + responseData.totalProducts,
        timestamp: new Date().toISOString(),
      },
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


