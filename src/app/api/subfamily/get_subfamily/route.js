import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { group_name } = params;

    // Verifica se o parâmetro foi enviado corretamente
    if (!group_name) {
      return new Response(JSON.stringify({ error: 'O parâmetro group_name é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Busca o grupo pelo nome
    const group = await prisma.cloud_groups.findMany({
      where: { group_name: group_name },
    });

    // Se não encontrar o grupo
    if (!group) {
      return new Response(JSON.stringify({ error: 'Grupo não encontrado.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(group), {
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
