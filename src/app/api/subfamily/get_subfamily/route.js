import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const subfamilias = await prisma.subfamilia.findMany();

    return new Response(JSON.stringify(subfamilias), {
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

