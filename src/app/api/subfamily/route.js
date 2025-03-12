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
    const { nome  } = await request.json();
    if (!nome || typeof nome !== 'string') {
      const response = {
        status: 'error',
        message: 'Nome da sub familia obrigatório e deve ser uma string',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const subfamilia = await prisma.subfamilia.create({
      data: {
        nome,
      },
    });
    const response = {
      status: 'success',
      data: subfamilia,
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
      message: 'Erro ao criar sub familia',
      error: error.message,
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}