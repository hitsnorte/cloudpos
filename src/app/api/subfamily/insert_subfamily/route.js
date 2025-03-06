import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json(); // No App Router, req.body não existe, usa req.json()
    const { nome_api } = body;

    if (!nome_api ) {
      return new Response(JSON.stringify({ error: 'O campo nome_api é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newSubfamily = await prisma.subfamilia.create({
        data: { nome: nome_api }, 
    });

    return new Response(JSON.stringify(newSubfamily), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao criar subfamilia.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
