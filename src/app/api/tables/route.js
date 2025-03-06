// src/app/api/tables/route.js

import prisma from '@/src/lib/prisma';  

export async function GET(request) {
  try {
   
    const url = new URL(request.url);
    const table = url.searchParams.get('table');  
    const listTables = url.searchParams.get('list');  

   
    if (listTables === 'true') {
      const tables = await prisma.$queryRaw`SHOW TABLES;`;

      return new Response(
        JSON.stringify({
          status: 'success',
          tables,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

   
    if (!table) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Nenhuma tabela especificada.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }


    let data;
    switch (table) {
      case 'Subfamilia':
        data = await prisma.Subfamilia.findMany();
        break;
      case 'Cloud_product':
        data = await prisma.Cloud_product.findMany();
        break;
      case 'Cloud_family':
        data = await prisma.Cloud_family.findMany();
        break;
      case 'Cloud_family_subfamilia':
        data = await prisma.Cloud_family_subfamilia.findMany();
        break;
      case 'Cloud_groups':
        data = await prisma.Cloud_groups.findMany();
        break;
      case 'Cloud_product_relation':
        data = await prisma.Cloud_product_relation.findMany();
        break;
      default:
        return new Response(
          JSON.stringify({ status: 'error', message: 'Tabela inválida.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const response = {
      status: 'success',
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    
    const response = {
      status: 'error',
      message: 'Erro ao buscar dados da tabela',
      error: error.message,
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
