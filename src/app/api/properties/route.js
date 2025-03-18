import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new property
export async function POST(req) {
    try {
        const body = await req.json();
        console.log("Received Property Data:", body);

        let { propertyTag, propertyName, propertyServer, propertyPort, mpeHotel } = body;

        // Validate required fields
        if (!propertyTag || !propertyName || !propertyServer || !propertyPort) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Ensure inputs are strings
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

        // Guardar propriedade na BD
        const property = await prisma.cloud_properties.create({
            data: { propertyTag, propertyName, propertyServer, propertyPort, mpeHotel }
        });

        return NextResponse.json({ message: "Property created successfully!", property }, { status: 201 });
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
