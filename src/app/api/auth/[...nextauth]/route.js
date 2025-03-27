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

                // Check if password is hashed
                if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$")) {
                    isValidPassword = await bcrypt.compare(credentials.password, user.password);
                } else {
                    isValidPassword = credentials.password === user.password;
                }

                if (!isValidPassword) {
                    throw new Error("Invalid email or password");
                }

                console.log("User ID:", user.userID);

                // Fetch properties associated with the user
                const userProperties = await prisma.cloud_userProperties.findMany({
                    where: { userID: user.userID },
                    select: { propertyID: true },
                });

                const propertyIDs = userProperties.map((p) => p.propertyID);

                console.log("Property IDs:", propertyIDs);

                // Fetch property details (name, tag)
                const properties = await prisma.cloud_properties.findMany({
                    where: { propertyID: { in: propertyIDs } },
                    select: { propertyID: true, propertyName: true, propertyTag: true },
                });

                console.log("Properties:", properties);

                return {
                    id: user.userID.toString(),
                    name: `${user.firstName ?? ""} ${user.secondName ?? ""}`.trim(),
                    email: user.email,
                    propertyIDs,
                    propertyNames: properties.map((p) => ({
                        id: p.propertyID,
                        name: p.propertyName,
                        tag: p.propertyTag,
                    })), // Store property names properly
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
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.firstname = user.firstName;
                token.secondname = user.secondName;
                token.propertyIDs = user.propertyIDs;
                token.propertyNames = user.propertyNames;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.userID = token.id;
            session.user.email = token.email;
            session.user.firstName = token.firstname;
            session.user.secondName = token.secondname;
            session.propertyIDs = token.propertyIDs;
            session.propertyNames = token.propertyNames;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
