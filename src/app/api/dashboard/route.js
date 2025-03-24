// src/app/api/dashboard/route.js
import prisma from '@/src/lib/prisma';

export async function GET(request) {
  try {
    // Usando count para contar o número de registros na tabela cloud_groups
    const totalGroups = await prisma.cloud_groups.count();
    const totalFamilies = await prisma.cloud_family.count();
    const totalSubfamilies = await prisma.subfamilia.count();
    const totalProducts = await prisma.cloud_product.count();

    const response = {
      status: 'success',
      data: { totalGroups, totalFamilies, totalSubfamilies, totalProducts}, // Incluindo a contagem total
      meta: {
        total: totalGroups,
        total: totalFamilies,
        total: totalSubfamilies,
        total: totalProducts,
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
      message: 'Erro ao buscar grupo',
      error: error.message,
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}



