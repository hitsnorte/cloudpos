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
    const tipoprodutoUrl = `http://${propertyServer}:${propertyPort}/gethoras`;
    const tipoprodutoResponse = await fetch(tipoprodutoUrl);
    if (!tipoprodutoResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Erro ao acessar o servidor de produto." }),
        { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    const tipoprodutoData = await tipoprodutoResponse.json();

    // Retorna os dados estruturados com meta informações
    const responseData = {
      status: "success",
      data: tipoprodutoData,
      meta: {
        total: tipoprodutoData.length,
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