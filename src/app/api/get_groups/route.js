import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const groups = await prisma.cloud_groups.findMany();

    return new Response(JSON.stringify(groups), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar grupos.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
