import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

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
