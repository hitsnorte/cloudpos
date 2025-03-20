// src/app/api/cloudproducts/[id]/route.js
import prisma from '@/src/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  const { id } = params; // Extrai o ID da rota dinâmica

  try {
    const cloud_product = await prisma.cloud_product.delete({
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

export async function PATCH(request, { params }) {
  const id = params.id; // Extrai o ID da rota dinâmica

  try {
    const { product_name, quantity } = await request.json();
    // Validação: product_name é obrigatório
    if (!product_name) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'O nome do grupo é obrigatório',
        },
        { status: 400 }
      );
    }

    const cloud_product = await prisma.cloud_product.update({
      where: { id: parseInt(id) },
      data: {
        product_name,
        quantity: quantity ? parseInt(quantity) : null, // Converte quantity para número
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        data: cloud_product,
        meta: {
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log('Erro ao atualizar produto:', error);
    console.error('Erro ao atualizar produto:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Erro ao atualizar produto',
        error: error.message,
      },
      { status: error.code === 'P2025' ? 404 : 500 } // 404 se o grupo não for encontrado
    );
  } finally {
    await prisma.$disconnect();
  }
}