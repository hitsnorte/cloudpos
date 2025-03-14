"use client";

import { Card, CardBody } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Import useSession
import { useEffect } from "react";

export default function App() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login"); // Redirect if user is not logged in
    }
  }, [status, router]);

  if (status === "loading") {
    return <p className="text-center text-lg">Loading...</p>; // Show loading while checking session
  }

  if (!session) {
    return null; // Prevent rendering before redirect
  }

  const cardPaths = [
    { label: "GROUPS", value: 0, path: "/homepage/grupos" },
    { label: "FAMILIES", value: 6, path: "/homepage/family" },
    { label: "SUBFAMILIES", value: 0, path: "/subfamilias" },
    { label: "PRODUCTS", value: 0, path: "/produtos" },
  ];

  // Define handleCardClick
  const handleCardClick = (path) => {
    console.log(`Navigating to: ${path}`);
    router.push(path); // Navigate to the given path
  };

  return (
      <div>
        <h1 className="text-4xl font-semibold text-center my-6">Dashboard</h1>

        <div className="flex flex-wrap gap-4 justify-center p-6">
          {cardPaths.map((card, index) => (
              <Card
                  key={index}
                  className="w-65 h-64 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col items-center p-4 cursor-pointer hover:bg-gray-100"
              >
                <CardBody className="flex flex-col items-center w-full h-full relative">
                  <div
                      className="w-full h-full cursor-pointer hover:bg-gray-100"
                      onClick={() => handleCardClick(card.path)}
                  >
                    <p className="text-8xl font-bold text-[#FC9D25] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      {card.value}
                    </p>
                    <p className="text-center text-lg text-gray-600 absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      {card.label}
                    </p>
                  </div>
                </CardBody>
              </Card>
          ))}
        </div>
      </div>
  );
}
