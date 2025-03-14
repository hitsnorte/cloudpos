import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { id } = params;

    // Verifica se o ID é um número válido
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'ID inválido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Busca a sub familia pelo ID
    const subfamilia = await prisma.subfamilia.findUnique({
      where: { id: parseInt(id) },
    });

    // Se não encontrar a sub familia
    if (!subfamilia) {
      return new Response(JSON.stringify({ error: 'Grupo não encontrado.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(subfamilia), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar grupo.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
