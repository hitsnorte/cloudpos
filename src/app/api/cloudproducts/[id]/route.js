// src/app/api/cloudproducts/[id]/route.js
import prisma from '@/src/lib/prisma';

export async function DELETE(request, { params }) {
  const { id } = params; // Extrai o ID da rota dinâmica

  try {
    const product = await prisma.Cloud_product.delete({
      where: { id: parseInt(id) },
    });
    const response = {
      status: 'success',
      message: 'Produto excluído com sucesso',
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const response = {
      status: 'error',
      message: 'Erro ao excluir produto',
      error: error.message,
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request, { params }) {
  const { id } = params; // Extrai o ID da rota dinâmica

  try {
    const { product_name, quantity } = await request.json();
    if (!product_name && !quantity) {
      const response = {
        status: 'error',
        message: 'Pelo menos um campo (nome ou quantidade) é obrigatório',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const product = await prisma.Cloud_product.update({
      where: { id: parseInt(id) },
      data: {
        product_name,
        quantity: quantity ? parseInt(quantity) : undefined,
      },
    });
    const response = {
      status: 'success',
      data: product,
      meta: {
        updatedAt: new Date().toISOString(),
      },
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const response = {
      status: 'error',
      message: 'Erro ao atualizar produto',
      error: error.message,
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}