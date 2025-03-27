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

    // Agora faz a requisição para o servidor de produtos usando a URL da propriedade
    const productUrl = `http://${propertyServer}:${propertyPort}/getproduto`;
    const productResponse = await fetch(productUrl);
    if (!productResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Erro ao acessar o servidor de produto." }),
        { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    const productData = await productResponse.json();

    // Retorna os dados estruturados com meta informações
    const responseData = {
      status: "success",
      data: productData,
      meta: {
        total: productData.length,
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
    const { product_name, quantity, selectedSubfamily } = await request.json();
    
    console.log("dados:", product_name, quantity, selectedSubfamily);
    
    if (!product_name || typeof product_name !== "string") {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Nome do produto é obrigatório e deve ser uma string",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }


    // Criar a família na tabela cloud_family
    const product = await prisma.cloud_product.create({
      data: {
        product_name,
        quantity: parseInt(quantity),
      },
    });

    // Inserir na tabela cloud_product_relation usando o ID da nova família
    const productSubfamilyRelation = await prisma.cloud_product_relation.create({
      data: {
        cloud_product_id: product.id, // ID da nova família criada
        cloud_subfamily_id: parseInt(selectedSubfamily), // ID do grupo selecionado
      },
    });

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Produto e relação com Sub familia criadas com sucesso!",
        data: {
          product,
          productSubfamilyRelation,
        },
        meta: {
          createdAt: new Date().toISOString(),
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao criar Produto:", error);
    console.log("Erro ao criar Produto:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Erro ao criar Produto e relação com Sub familia",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
