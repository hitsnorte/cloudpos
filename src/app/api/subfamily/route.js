// src/app/api/cloudproducts/route.js
import prisma from '@/src/lib/prisma';

export async function GET(request) {
  try {
    const subfamilia = await prisma.subfamilia.findMany();
    const response = {
      status: 'success',
      data: subfamilia,
      meta: {
        total: subfamilia.length,
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
      message: 'Erro ao buscar as sub familias',
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
