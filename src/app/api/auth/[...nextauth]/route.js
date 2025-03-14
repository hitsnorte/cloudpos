import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const user = await prisma.cloud_users.findFirst({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error("Invalid email or password");
                }

                let isValidPassword = false;

                // Verifica se a password está encriptada
                if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$")) {
                    isValidPassword = await bcrypt.compare(credentials.password, user.password);
                } else {
                    // Permite um utilizador sem a password encriptada entrar no site
                    isValidPassword = credentials.password === user.password;
                }

                if (!isValidPassword) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: user.userID.toString(),
                    name: `${user.firstName ?? ""} ${user.secondName ?? ""}`.trim(),
                    email: user.email,
                };
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
