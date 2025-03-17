import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json(); // No App Router, req.body não existe, usa req.json()
    const { product_name_api } = body;

    if (!product_name_api ) {
      return new Response(JSON.stringify({ error: 'O campo product_name_api é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newcloudproducts = await prisma.cloud_product.create({
        data: { nome: product_name_api }, 
    });

    return new Response(JSON.stringify(newcloudproducts), {
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
