import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export async function PUT(req, { params }) {
    const { id } = params; // Extrai cadeia através do URL
    try {
        const body = await req.json();
        let {chainName } = body;

        // Garante que pelo menos um campo é atualizado
        if (!chainName) {
            return NextResponse.json({ error: "At least one field must be updated" }, { status: 400 });
        }

        let updateData = {};

        // Adiciona campos atualizados a "updatedData"
        if (chainName) updateData.chainName = chainName.trim();


        // Atualiza chain na BD
        const updatedUser = await prisma.cloud_chain.update({
            where: { chainID: parseInt(id) },
            data: updateData,
        });

        return NextResponse.json({ message: "Chain updated successfully", updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
