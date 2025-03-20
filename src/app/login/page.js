"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
            callbackUrl: "/dashboard", // Ensure proper redirection
        });

        if (result?.error) {
            setError(result.error); // Display actual error message
        } else {
            router.push("/dashboard"); // Redirect on successful login
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold">Login</h1>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-6 w-96">
                <div className="relative w-full">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-3 w-full bg-transparent border-2 border-[#EDEBEB] border-b-[#FC9D25] border-b-4 outline-none"
                        required
                    />
                </div>
                <div className="relative w-full">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-3 w-full bg-transparent border-2 border-[#EDEBEB] border-b-[#FC9D25] border-b-4 outline-none"
                        required
                    />
                </div>
                <button type="submit" className="bg-[#EDEBEB] text-[#191919] px-4 py-2 rounded w-full">
                    Login
                </button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
}
