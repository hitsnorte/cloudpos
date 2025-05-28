"use client";

import { Card, CardBody } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Import useSession
import { useEffect, useState } from "react";
import { fetchDashboard } from '@/src/lib/apidashboard';

//import loader
import LoadingBackdrop from "@/src/components/loader/page";

export default function App() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(() => JSON.parse(localStorage.getItem("isConfirmed")) || false);

  // If the user is unauthenticated, redirect them to the login page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // If the property is not confirmed, redirect to homepage
  useEffect(() => {
    if (!isConfirmed) {
      router.push("/"); // Redirect to the homepage if the property is not confirmed
    }
  }, [isConfirmed, router]);

  // Fetch the dashboard data when the user is authenticated and property is confirmed
  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated" && isConfirmed) {
        try {
          const data = await fetchDashboard();
          if (data && data.totalGroups !== undefined && data.totalFamilies !== undefined && data.totalSubfamilies !== undefined && data.totalProducts !== undefined) {
            setDashboardData(data); // Store the fetched data
          } else {
            throw new Error('Invalid data received from API');
          }
        } catch (error) {
          console.log('Error fetching dashboard data:', error);
          setDashboardData({ grupos: 0, familias: 0, subfamilias: 0, produtos: 0 });
        }
      }
    };

    // Only fetch data if the status is authenticated and the property is confirmed
    if (status === "authenticated" && isConfirmed) {
      fetchData(); // Fetch dashboard data when status or isConfirmed changes
    }
  }, [status, isConfirmed]); // Fetch data again when the session or confirmation status changes

  // While loading
      if (status === "loading") {
        return <LoadingBackdrop open={true} />;
    }

  if (!session) {
    return null; // Prevent showing the page before redirecting to login
  }

  if (!dashboardData) {
    return <p className="text-center text-lg">Loading dashboard...</p>;
  }

  // Card paths for different sections
  const cardPaths = [
    { label: "GROUPS", value: dashboardData.totalGroups || 0, path: "/homepage/grupos" },
    { label: "FAMILIES", value: dashboardData.totalFamilies || 0, path: "/homepage/family" },
    { label: "SUBFAMILIES", value: dashboardData.totalSubfamilies || 0, path: "/homepage/subfamilia" },
    { label: "PRODUCTS", value: dashboardData.totalProducts || 0, path: "/homepage/product" },
  ];

  // Navigate to the corresponding page when a card is clicked
  const handleCardClick = (path) => {
    router.push(path);
  };

  return (
      <div>
        <h1 className="text-3xl font-semibold px-4">Dashboard</h1>
        <div className="px-4 flex flex-wrap gap-6 p-6">
          {cardPaths.map((card, index) => (
              <Card
                  key={index}
                  className="w-70 h-45 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col items-center cursor-pointer hover:bg-gray-100"
              >
                <CardBody className="flex flex-col items-center w-full h-full relative">
                  <div
                      className="w-full h-full cursor-pointer hover:bg-gray-100"
                      onClick={() => handleCardClick(card.path)}
                  >
                    <p className="text-5xl font-bold text-[#FC9D25] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      {card.value}
                    </p>
                    <p className="text-center h-13 text-lg text-gray-600 absolute bottom-4 left-1/2 transform -translate-x-1/2">
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
