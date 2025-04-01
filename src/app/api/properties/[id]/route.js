import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
    const { id } = params; // Extrai a propriedade através do URL
    try {
        const body = await req.json();
        let { propertyName, propertyServer, propertyPort, mpeHotel, chainID } = body;

        // Garante que pelo menos um campo é atualizado
        if (!propertyName && !propertyServer && !propertyPort && !mpeHotel && !chainID) {
            return NextResponse.json({ error: "At least one field must be updated" }, { status: 400 });
        }

        let updateData = {};

        // Adiciona campos atualizados a "updateData"
        if (propertyName) updateData.propertyName = propertyName.trim();
        if (propertyServer) updateData.propertyServer = propertyServer.trim();
        if (propertyPort) updateData.propertyPort = propertyPort.trim();
        if (mpeHotel) updateData.mpeHotel = parseInt(mpeHotel, 10);

        // Atualiza a propriedade na tabela cloud_properties
        const updatedProperty = await prisma.cloud_properties.update({
            where: { propertyID: parseInt(id) },
            data: updateData,
        });

        // Se foi passado o novo chainID, atualiza a relação na tabela cloud_chainProperties
        if (chainID) {
            // Remove qualquer relação existente antes de criar uma nova
            await prisma.cloud_chainProperties.deleteMany({
                where: { propertyID: parseInt(id) },
            });

            // Cria uma nova relação com a nova chainID
            await prisma.cloud_chainProperties.create({
                data: {
                    propertyID: parseInt(id),
                    chainID: parseInt(chainID),
                },
            });
        }

        return NextResponse.json({ message: "Property updated successfully", updatedProperty }, { status: 200 });
    } catch (error) {
        console.error("Error updating property:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
