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
    const propertyResponse = await fetch(`${API_BASE_URL}/api/properties/get_properties/${propertyID}`);
    if (!propertyResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Erro ao acessar informações da propriedade." }),
        { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    const propertyData = await propertyResponse.json();
    const { propertyServer, propertyPort } = propertyData;

    // Agora faz a requisição para o servidor de produtos usando a URL da propriedade
    const subfamilyUrl = `http://${propertyServer}:${propertyPort}/getsubfamilia`;
    const subfamilyResponse = await fetch(subfamilyUrl);
    if (!subfamilyResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Erro ao acessar o servidor de subfamilia." }),
        { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    const subfamiliaData = await subfamilyResponse.json();

    // Retorna os dados estruturados com meta informações
    const responseData = {
      status: "success",
      data: subfamiliaData,
      meta: {
        total: subfamiliaData.length,
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
    const { nome, selectedFamily } = await request.json();
    
    console.log("Family_id:", selectedFamily);

    if (!nome || typeof nome !== "string") {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Nome da Sub família é obrigatório e deve ser uma string",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!selectedFamily || typeof selectedFamily !== "string") {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "A Familia selecionada é obrigatória",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Criar a sub família na tabela subfamilia
    const subfamilia = await prisma.subfamilia.create({
      data: {
        nome,
      },
    });

    // Inserir na tabela cloud_family_subfamilia usando o ID da nova família
    const subfamiliafamilyRelation = await prisma.cloud_family_subfamilia.create({
      data: {
        id_subfamilia: subfamilia.id, // ID da nova sub família criada
        id_cloud_family: parseInt(selectedFamily), // ID da familia selecionado
      },
    });

    return new Response(
      JSON.stringify({
        status: "success",
        message: "sub Família e relação com familia criada com sucesso!",
        data: {
          subfamilia,
          subfamiliafamilyRelation,
        },
        meta: {
          createdAt: new Date().toISOString(),
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao criar família:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Erro ao criar família e relação com grupo",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
