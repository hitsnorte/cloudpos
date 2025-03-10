// src/app/api/cloudproducts/route.js
import prisma from '@/src/lib/prisma';

export async function GET(request) {
  try {
    const group = await prisma.cloud_groups.findMany();
    const response = {
      status: 'success',
      data: group,
      meta: {
        total: group.length,
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
      message: 'Erro ao buscar grupo',
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