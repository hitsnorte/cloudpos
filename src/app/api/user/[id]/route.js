import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
    const { id } = await params; // Extrai user através do URL
    const formataUserID = id;

    try {
        const body = await req.json();
        let { firstName, secondName, email, password, propertyIDs} = body;

        // Garante que pelo menos um campo é atualizado
        if (!firstName && !secondName && !email && !password && !propertyIDs) {
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

        if (propertyIDs && propertyIDs.length > 0) {
            // Remove qualquer relação existente antes de criar uma nova
            await prisma.cloud_userProperties.deleteMany({
                where: { userID: parseInt(id) },
            });

            // Cria uma nova relação com a nova propertyID para múltiplos userID
            const userPropertiesData = propertyIDs.map((id) => ({
                propertyID: parseInt(id),
                userID: parseInt(formataUserID),
            }));

            await prisma.cloud_userProperties.createMany({
                data: userPropertiesData,
            });
        }


        return NextResponse.json({ message: "User updated successfully", updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { id } = params;

    try {
        const user = await prisma.cloud_users.findUnique({
            where: { userID: parseInt(id) },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await prisma.cloud_users.delete({
            where: { userID: parseInt(id) },
        });

        return NextResponse.json({ message: "User and associated properties deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
