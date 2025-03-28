import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Criar nova cadeia
export async function POST(req) {
    try {
        const body = await req.json();


        let { chainTag, chainName } = body;

        // Valida campos obrigatórios
        if (!chainTag || !chainName) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }


        chainTag = String(chainTag).trim();
        chainName = String(chainName).trim();

        // Guarda cadeia na BD
        const chain = await prisma.cloud_chain.create({
            data: { chainTag, chainName },
        });

        return NextResponse.json({ message: "Chain registered!", chain }, { status: 201 });
    } catch (error) {
        console.error("Error creating chain:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

//Busca todas as cadeias
export async function GET() {
    try {
        const chains = await prisma.cloud_chain.findMany();
        return NextResponse.json(chains, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
