// src/app/api/cloudproducts/route.js
import prisma from '@/src/lib/prisma';

export async function GET(request) {
  try {
    const products = await prisma.cloud_product.findMany();
    const response = {
      status: 'success',
      data: products,
      meta: {
        total: products.length,
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
    const { product_name, quantity } = await request.json();
    if (!product_name || typeof product_name !== 'string') {
      const response = {
        status: 'error',
        message: 'Nome do produto é obrigatório e deve ser uma string',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
      const response = {
        status: 'error',
        message: 'Quantidade é obrigatória, deve ser um número válido e maior ou igual a 0',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const product = await prisma.cloud_product.create({
      data: {
        product_name,
        quantity: parseInt(quantity),
      },
    });
    const response = {
      status: 'success',
      data: product,
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
      message: 'Erro ao criar produto',
      error: error.message,
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}