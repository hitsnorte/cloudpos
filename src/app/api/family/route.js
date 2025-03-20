
import prisma from '@/src/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const family = await prisma.cloud_family.findMany();
    const response = {
      status: 'success',
      data: family,
      meta: {
        total: family.length,
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
      message: 'Erro ao buscar familia',
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
