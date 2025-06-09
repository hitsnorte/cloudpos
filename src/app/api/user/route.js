import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();


        let { firstName, secondName, email, password, propertyIDs, propertyTags } = body;

        // Valida campos necessários
        if (!firstName || !secondName || !email || !password ||
            !Array.isArray(propertyIDs) || propertyIDs.length === 0 ||
            !Array.isArray(propertyTags) || propertyTags.length === 0) {
            return NextResponse.json(
                { error: "All fields (including non-empty propertyIDs and propertyTags arrays) are required" },
                { status: 400 }
            );
        }

        // Converte inputs para os formatos corretos
        firstName = String(firstName).trim();
        secondName = String(secondName).trim();
        email = String(email).trim();
        password = String(password).trim();

        // Certifica que propertyIDs e propertyTags são arrays
        if (!Array.isArray(propertyIDs) || !Array.isArray(propertyTags)) {
            return NextResponse.json({ error: "propertyIDs and propertyTags must be arrays" }, { status: 400 });
        }

        // Valida se os arrays possuem o mesmo tamanho
        if (propertyIDs.length !== propertyTags.length) {
            return NextResponse.json({ error: "propertyIDs and propertyTags must have the same length" }, { status: 400 });
        }

        // Valida formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // Encripta a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Guarda utilizador na BD
        const user = await prisma.cloud_users.create({
            data: { firstName, secondName, email, password: hashedPassword },
        });



        // Cria múltiplos registos na tabela cloud_userProperties
        const userPropertiesData = propertyIDs.map((propertyID, index) => ({
            userID: user.userID,
            propertyID: parseInt(propertyID),
            propertyTag: propertyTags[index],
        }));

        const userProperties = await prisma.cloud_userProperties.createMany({
            data: userPropertiesData,
        });

        return NextResponse.json({ message: "User registered and properties linked!", user, userProperties }, { status: 201 });
    } catch (error) {
        console.error("Error creating user or linking properties:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Busca todos os users na bd
export async function GET() {
    try {
        const users = await prisma.cloud_users.findMany({
            include: {
                cloud_userProperties: true, // ou outra associação que precisas
            },
            orderBy: { userID: 'desc' }, // opcional: mais recentes primeiro
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Erro ao buscar perfis:", error);
        return NextResponse.json({ error: "Erro ao buscar utilizadores" }, { status: 500 });
    }
}
