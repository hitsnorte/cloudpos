// src/app/api/cloudproducts/route.js
import prisma from '@/src/lib/prisma';

export async function GET(request) {
  try {
    const product = await prisma.cloud_product.findMany();
    const response = {
      status: 'success',
      data: product,
      meta: {
        total: product.length,
        timestamp: new Date().toISOString(),
      },
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const response = {
      status: 'error',
      message: 'Erro ao buscar produtos',
      error: error.message,
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
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
