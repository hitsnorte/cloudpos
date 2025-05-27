"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LayoutWrapper from "@/src/components/Layout/LayoutWrapper";

//import loader
import LoadingBackdrop from "@/src/components/loader/page";

export default function ClientLayout({ children }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    // Debug session status
    useEffect(() => {
        console.log("Session Status:", status);
        console.log("Session Data:", session);
    }, [status, session]);

    // Redirect to login only AFTER render
    useEffect(() => {
        if (status === "unauthenticated" && pathname !== "/login") {
            router.replace("/login");
        } else if (status !== "loading") {
            setLoading(false);
        }
    }, [status, pathname, router]);

    // Show loading screen while checking auth status
    if (status === "loading" || loading) {
        return <LoadingBackdrop open={true} />;
    }
    // Render login page directly
    if (pathname === "/login") {
        return children;
    }

    return <LayoutWrapper>{children}</LayoutWrapper>;
}
