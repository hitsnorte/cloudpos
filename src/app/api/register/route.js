import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const API_KEY = process.env.API_KEY || "teste-api-key";

export async function POST(request) {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey || apiKey !== API_KEY) {
        return new Response(JSON.stringify({ message: "Invalid API key" }), {
            status: 403,
        });
    }

    try {
        const { firstName, secondName, email, password } = await request.json();

        // Verificar se o email já está em uso
        const existingUser = await prisma.cloud_users.findUnique({
            where: { email },
        });

        if (existingUser) {
            return new Response(JSON.stringify({ error: "Email já está em uso." }), {
                status: 400,
            });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar o novo utilizador
        const newUser = await prisma.cloud_users.create({
            data: {
                firstName,
                secondName,
                email,
                password: hashedPassword,
            },
        });

        return new Response(JSON.stringify(newUser), { status: 201 });
    } catch (error) {
        console.error("Database error:", error);
        return new Response(
            JSON.stringify({ message: "Database error", error: error.message }),
            { status: 500 }
        );
    }
}

// Fechar conexão Prisma ao encerrar a aplicação
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});
