import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("Received Data:", body); //

        let { firstName, secondName, email, password } = body;

        // Valida campos necessários
        if (!firstName || !secondName || !email || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // certifica que inputs são strings
        firstName = String(firstName).trim();
        secondName = String(secondName).trim();
        email = String(email).trim();
        password = String(password).trim();

        // Valida formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // Encripta Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Guarda utilizador na BD
        const user = await prisma.cloud_users.create({
            data: { firstName, secondName, email, password: hashedPassword },
        });

        return NextResponse.json({ message: "User registered!", user }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


// Buscar todos os users na bd
export async function GET() {
    try {
        const users = await prisma.cloud_users.findMany();
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
