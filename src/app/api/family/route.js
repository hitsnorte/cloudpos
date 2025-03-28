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

    // Agora faz a requisição para o servidor de familias usando a URL da propriedade
    const familyUrl = `http://${propertyServer}:${propertyPort}/getfamilia`;
    const familyResponse = await fetch(familyUrl);
    if (!familyResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Erro ao acessar o servidor de familia." }),
        { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    const familyData = await familyResponse.json();

    // Retorna os dados estruturados com meta informações
    const responseData = {
      status: "success",
      data: familyData,
      meta: {
        total: familyData.length,
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
    const { family_name, selectedGroup } = await request.json();
    
    console.log("group_id:", selectedGroup);

    if (!family_name || typeof family_name !== "string") {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Nome da família é obrigatório e deve ser uma string",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!selectedGroup || typeof selectedGroup !== "string") {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "O grupo selecionado é obrigatório",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Criar a família na tabela cloud_family
    const family = await prisma.cloud_family.create({
      data: {
        family_name,
      },
    });

    // Inserir na tabela cloud_family_group_relation usando o ID da nova família
    const familyGroupRelation = await prisma.cloud_family_group_relation.create({
      data: {
        cloud_family_id: family.id, // ID da nova família criada
        cloud_group_id: parseInt(selectedGroup), // ID do grupo selecionado
      },
    });

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Família e relação com grupo criadas com sucesso!",
        data: {
          family,
          familyGroupRelation,
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
