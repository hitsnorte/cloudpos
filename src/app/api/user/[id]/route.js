import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
    const { id } = await params; // Extrai ID do usuário a partir do URL
    const formataUserID = id;

    try {
        const body = await req.json();
        let { firstName, secondName, email, password, currentPassword, propertyIDs } = body;

        // Garante que pelo menos 1 campo está a ser atualizado
        if (!firstName && !secondName && !email && !password && !propertyIDs) {
            return NextResponse.json({ error: "At least one field must be updated" }, { status: 400 });
        }

        // Inicializa updateData logo no início
        let updateData = {};

        // Verifica e valida a senha atual
        if (password && currentPassword) {
            const user = await prisma.cloud_users.findUnique({
                where: { userID: parseInt(id) },
            });

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            // Valida se a senha escrita no campo é igual à senha atual
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isPasswordValid) {
                return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
            }

            // Se a senha for válida, encripta a nova senha
            updateData.password = await bcrypt.hash(password, 10);  // Agora 'updateData' já foi inicializado
        }

        // Prepara os dados para atualizar com outros campos
        if (firstName) updateData.firstName = firstName.trim();
        if (secondName) updateData.secondName = secondName.trim();
        if (email) updateData.email = email.trim();

        // Atualiza o user na base de dados
        const updatedUser = await prisma.cloud_users.update({
            where: { userID: parseInt(id) },
            data: updateData,
        });

        if (propertyIDs && propertyIDs.length > 0) {
            // Remove relações de propriedade-user atuais antes de criar as novas
            await prisma.cloud_userProperties.deleteMany({
                where: { userID: parseInt(id) },
            });

            // Cria novas relações propriedade-user
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
