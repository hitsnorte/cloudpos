import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
    const { id } = params; // Extrai user através do URL
    try {
        const body = await req.json();
        let { firstName, secondName, email, password } = body;

        // Garante que pelo menos um campo é atualizado
        if (!firstName && !secondName && !email && !password) {
            return NextResponse.json({ error: "At least one field must be updated" }, { status: 400 });
        }

        let updateData = {};

        // Encripta nova password se uma for dada
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Adiciona campos atualizados a "updatedData"
        if (firstName) updateData.firstName = firstName.trim();
        if (secondName) updateData.secondName = secondName.trim();
        if (email) updateData.email = email.trim();

        // Atualiza utilizador na BD
        const updatedUser = await prisma.cloud_users.update({
            where: { userID: parseInt(id) },
            data: updateData,
        });

        return NextResponse.json({ message: "User updated successfully", updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
