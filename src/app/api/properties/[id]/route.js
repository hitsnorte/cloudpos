import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
    const { id } = await params; // Extrai a propriedade através do URL
    try {
        const body = await req.json();
        let { propertyName, propertyServer, propertyPort, mpeHotel, propertyChain } = body; // propertyChain é um array

        // Garante que pelo menos um campo seja atualizado
        if (!propertyName && !propertyServer && !propertyPort && !mpeHotel && (!propertyChain || propertyChain.length === 0)) {
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

        // Se houver uma atualização na relação de cadeias
        if (propertyChain && propertyChain.length > 0) {
            // Remove todas as relações existentes antes de buscar novas cadeias
            await prisma.cloud_chainProperties.deleteMany({
                where: { propertyID: parseInt(id) },
            });

            // Buscar IDs das cadeias pelo chainTag
            const chains = await prisma.cloud_chain.findMany({
                where: { chainTag: { in: propertyChain } },
                select: { chainID: true }
            });

            if (chains.length === 0) {
                return NextResponse.json({ error: "Invalid property chains selected" }, { status: 400 });
            }

            // Criar novas relações
            const chainPropertyData = chains.map(chain => ({
                propertyID: parseInt(id),
                chainID: chain.chainID,
            }));

            await prisma.cloud_chainProperties.createMany({
                data: chainPropertyData,
            });
        }


        return NextResponse.json({ message: "Property updated successfully", updatedProperty }, { status: 200 });
    } catch (error) {
        console.error("Error updating property:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { id } = params;

    try {
        // Verifica se a propriedade existe
        const property = await prisma.cloud_properties.findUnique({
            where: { propertyID: parseInt(id) },
        });

        if (!property) {
            return NextResponse.json({ error: "Property not found" }, { status: 404 });
        }

        // Elimina a propriedade (ligações em cloud_chainProperties e cloud_userProperties serão apagadas automaticamente)
        await prisma.cloud_properties.delete({
            where: { propertyID: parseInt(id) },
        });

        return NextResponse.json({ message: "Property and all related data deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting property:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

