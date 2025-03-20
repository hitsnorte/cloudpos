import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cloud_family = await prisma.cloud_family.findMany();

    return new Response(JSON.stringify(cloud_family), {
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

