// src/app/api/cloudproducts/route.js
import prisma from '@/src/lib/prisma';

export async function GET(request) {
  try {
    const propertyID = request.headers.get('X-Property-ID'); // Obter o propertyID dos cabeçalhos

    if (!propertyID) {
      return new Response(
        JSON.stringify({ error: "propertyID é obrigatório." }),
        { status: 400, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    const API_BASE_URL = process.env.API_BASE_URL;

    // Faz a requisição para a API de propriedades para obter server e port
    const propertyResponse = await fetch(`${API_BASE_URL}/api/properties/${propertyID}`);
    if (!propertyResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Erro ao acessar informações da propriedade." }),
        { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    const propertyData = await propertyResponse.json();
    const { propertyServer, propertyPort } = propertyData;

    // Agora faz a requisição para o servidor do grupo usando a URL da propriedade
    const groupUrl = `http://${propertyServer}:${propertyPort}/getgrfamiliar`;
    const groupResponse = await fetch(groupUrl);
    if (!groupResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Erro ao acessar o servidor de grupo." }),
        { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    const groupData = await groupResponse.json();

    // Retorna os dados estruturados com meta informações
    const responseData = {
      status: "success",
      data: groupData,
      meta: {
        total: groupData.length,
        timestamp: new Date().toISOString(),
      },
    };

    return new Response(
      JSON.stringify(responseData),
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


export async function POST(request) {
  try {
    const { group_name  } = await request.json();
    if (!group_name || typeof group_name !== 'string') {
      const response = {
        status: 'error',
        message: 'Nome do grupo é obrigatório e deve ser uma string',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const group = await prisma.cloud_groups.create({
      data: {
        group_name,
      },
    });
    const response = {
      status: 'success',
      data: group,
      meta: {
        createdAt: new Date().toISOString(),
      },
    };
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const response = {
      status: 'error',
      message: 'Erro ao criar grupo',
      error: error.message,
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}