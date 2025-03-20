// src/app/api/cloudproducts/[id]/route.js
import prisma from '@/src/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  const { id } = params; // Extrai o ID da rota dinâmica

  try {
    const cloud_family = await prisma.cloud_family.delete({
      where: { id: parseInt(id) },
    });
    const response = {
      status: 'success',
      message: 'familia excluída com sucesso',
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const response = {
      status: 'error',
      message: 'Erro ao excluir familia',
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
    const { family_name } = await request.json();

    // Validação: name é obrigatório
    if (!family_name) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'O family_name da familia é obrigatório',
        },
        { status: 400 }
      );
    }

    const cloud_family = await prisma.cloud_family.update({
      where: { id: parseInt(id) },
      data: {
        family_name,
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        data: cloud_family,
        meta: {
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar a familia:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Erro ao atualizar familia',
        error: error.message,
      },
      { status: error.code === 'P2025' ? 404 : 500 } // 404 se o grupo não for encontrado
    );
  } finally {
    await prisma.$disconnect();
  }
}