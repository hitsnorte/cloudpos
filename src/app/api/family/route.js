
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
    const { family_name  } = await request.json();
    if (!family_name || typeof family_name !== 'string') {
      const response = {
        status: 'error',
        message: 'Nome da familia é obrigatório e deve ser uma string',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const family = await prisma.cloud_family.create({
      data: {
        family_name,
      },
    });
    const response = {
      status: 'success',
      data: family,
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
      message: 'Erro ao criar familia',
      error: error.message,
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}