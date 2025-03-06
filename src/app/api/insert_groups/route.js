import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json(); // No App Router, req.body não existe, usa req.json()
    const { group_name_api } = body;

    if (!group_name_api) {
      return new Response(JSON.stringify({ error: 'O campo group_name_api é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newGroup = await prisma.cloud_groups.create({
      data: { group_name: group_name_api },
    });

    return new Response(JSON.stringify(newGroup), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao criar grupo.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
