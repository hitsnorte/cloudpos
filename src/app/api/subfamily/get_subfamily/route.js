import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const subfamilys = await prisma.subfamilia.findMany();

    return new Response(JSON.stringify(subfamilys), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar subfamilias.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
