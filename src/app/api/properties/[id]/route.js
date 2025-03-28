import { NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function PUT(req, { params }) {
    const { id } = params; // Extrai propriedade através do URL
    try {
        const body = await req.json();
        let { propertyName , propertyServer , propertyPort , mpeHotel  } = body;

        // Garante que pelo menos um campo é atualizado
        if ( !propertyName && !propertyServer && !propertyPort && !mpeHotel) {
            return NextResponse.json({ error: "At least one field must be updated" }, { status: 400 });
        }

        let updateData = {};

        // Adiciona campos atualizados a "updatedData"
        if (propertyName) updateData.propertyName = propertyName.trim();
        if (propertyServer) updateData.propertyServer = propertyServer.trim();
        if (propertyPort) updateData.propertyPort = propertyPort.trim();
        if (mpeHotel) updateData.mpeHotel = parseInt(mpeHotel , 10);

        // Atualiza property na BD
        const updatedUser = await prisma.cloud_properties.update({
            where: { propertyID: parseInt(id) },
            data: updateData,
        });

        return NextResponse.json({ message: "Property updated successfully", updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(_, { params }) {  // ← Pega os parâmetros da URL
    try {
        const { id: propertyID } = await params;  // ← Captura o parâmetro de rota `[id]`

        if (!propertyID) {
            return new Response(
                JSON.stringify({ error: "propertyID é obrigatório." }),
                { status: 400, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        const propertyIDInt = parseInt(propertyID, 10);
        if (isNaN(propertyIDInt)) {
            return new Response(
                JSON.stringify({ error: "propertyID inválido." }),
                { status: 400, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        // Busca a propriedade no banco de dados
        const property = await prisma.cloud_properties.findUnique({
            where: { propertyID: propertyIDInt },
            select: { propertyServer: true, propertyPort: true }
        });

        if (!property) {
            return new Response(
                JSON.stringify({ error: "Propriedade não encontrada." }),
                { status: 404, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        // Retorna o propertyServer e propertyPort
        return new Response(
            JSON.stringify({ propertyServer: property.propertyServer, propertyPort: property.propertyPort }),
            { status: 200, headers: { "content-type": "application/json; charset=UTF-8" } }
        );
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: "Erro interno do servidor." }),
            { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
        );
    }
}

// API de destino que recebe o propertyID via URL

export async function GET(_, { params }) {  // ← Pega os parâmetros da URL
  try {
    const { id: propertyID } = await params;  // ← Captura o parâmetro de rota `[id]`

    if (!propertyID) {
      return new Response(
        JSON.stringify({ error: "propertyID é obrigatório." }),
        { status: 400, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    const propertyIDInt = parseInt(propertyID, 10);
    if (isNaN(propertyIDInt)) {
      return new Response(
        JSON.stringify({ error: "propertyID inválido." }),
        { status: 400, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    // Busca a propriedade no banco de dados
    const property = await prisma.cloud_properties.findUnique({
      where: { propertyID: propertyIDInt },
      select: { propertyServer: true, propertyPort: true }
    });

    if (!property) {
      return new Response(
        JSON.stringify({ error: "Propriedade não encontrada." }),
        { status: 404, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    // Retorna o propertyServer e propertyPort
    return new Response(
      JSON.stringify({ propertyServer: property.propertyServer, propertyPort: property.propertyPort }),
      { status: 200, headers: { "content-type": "application/json; charset=UTF-8" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor." }),
      { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
    );
  }
}

