// src/app/api/cloudproducts/[id]/route.js
import prisma from '@/src/lib/prisma';


export async function DELETE(request, { params }) {
  const { id } = params; // Extrai o ID da rota dinâmica

  try {
    const subfamilia = await prisma.subfamilia.delete({
      where: { id: parseInt(id) },
    });
    const response = {
      status: 'success',
      message: 'Sub familia excluído com sucesso',
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const response = {
      status: 'error',
      message: 'Erro ao excluir Sub familia',
      error: error.message,
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/*export async function PUT(request, { params }) {
  const id = params.id; // Extrai o ID da rota dinâmica

  try {
    const { group_name } = await request.json();

    // Validação: group_name é obrigatório
    if (!group_name) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'O nome do grupo é obrigatório',
        },
        { status: 400 }
      );
    }

    const group = await prisma.cloud_groups.update({
      where: { id: parseInt(id) },
      data: {
        group_name,
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        data: group,
        meta: {
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Erro ao atualizar grupo',
        error: error.message,
      },
      { status: error.code === 'P2025' ? 404 : 500 } // 404 se o grupo não for encontrado
    );
  } finally {
    await prisma.$disconnect();
  }
}
  */