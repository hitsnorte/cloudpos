import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Cria nova propriedade
export async function POST(req) {
    try {
        const body = await req.json();
        console.log("Received Property Data:", body);

        let { propertyTag, propertyName, propertyServer, propertyPort, mpeHotel, propertyChain } = body;

        // Valida campos obrigatórios
        if (!propertyTag || !propertyName || !propertyServer || !propertyPort || !propertyChain?.length) {
            return NextResponse.json({ error: "All fields are required, including at least one property chain" }, { status: 400 });
        }

        // garante que inputs são strings
        propertyTag = String(propertyTag).trim();
        propertyName = String(propertyName).trim();
        propertyServer = String(propertyServer).trim();
        propertyPort = String(propertyPort).trim();
        mpeHotel = mpeHotel ? Number(mpeHotel) : null;

        // Verifica se propriedade já existe
        const existingProperty = await prisma.cloud_properties.findUnique({
            where: { propertyTag }
        });

        if (existingProperty) {
            return NextResponse.json({ error: "Property tag already exists" }, { status: 400 });
        }

        // Guarda propriedade na BD
        const property = await prisma.cloud_properties.create({
            data: { propertyTag, propertyName, propertyServer, propertyPort, mpeHotel }
        });

        console.log("Property created:", property);

        // Map chainTags to their corresponding chainIDs
        const chains = await prisma.cloud_chain.findMany({
            where: { chainTag: { in: propertyChain } },
            select: { chainID: true, chainTag: true }
        });

        console.log("Chains found:", chains);

        if (!chains.length) {
            return NextResponse.json({ error: "Invalid property chains selected" }, { status: 400 });
        }

        // Insert property-chain relationships into cloud_chainProperties
        const chainPropertyData = chains.map(chain => ({
            chainID: chain.chainID,
            chainTag: chain.chainTag,
            propertyID: property.propertyID,
            propertyTag: property.propertyTag
        }));

        console.log("Data to insert in cloud_chainProperties:", chainPropertyData);

        await prisma.cloud_chainProperties.createMany({
            data: chainPropertyData
        });

        console.log("Property linked to chains successfully");

        return NextResponse.json({ message: "Property created and linked to chains successfully!", property }, { status: 201 });
    } catch (error) {
        console.error("Error creating property:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Busca todas as propriedades
export async function GET() {
    try {
        const properties = await prisma.cloud_properties.findMany();
        return NextResponse.json(properties, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
