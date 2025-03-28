"use client";

import { Card, CardBody } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Import useSession
import { useEffect, useState } from "react";
import { fetchDashboard } from '@/src/lib/apidashboard';



export default function App() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login"); // Redireciona se o utilizador não deu login
    }
  }, [status, router]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated") {
        try {
          // Chama a função fetchDashboard e aguarda a resposta
          const data = await fetchDashboard();
          
          // Verifica se a propriedade 'totalGroups' está presente
          if (data && data.totalGroups !== undefined && data.totalFamilies !== undefined && data.totalSubfamilies !== undefined && data.totalProducts !== undefined) {
            setDashboardData(data); // Armazena os dados no estado
          } else {
            throw new Error('Dados inválidos recebidos da API');
          }
        } catch (error) {
          console.log('Erro ao carregar os dados:', error);
          console.error('Erro ao carregar os dados:', error);
          // Em caso de erro, define valores padrão
          setDashboardData({ grupos: 0, familias: 0, subfamilias: 0, produtos: 0 });
        }
      }
    };

    fetchData(); // Chama a função assíncrona para buscar os dados
  }, [status]); // Recarrega quando o status de autenticação mudar

  if (status === "loading") {
    return <p className="text-center text-lg">Loading...</p>; // Mostra "Loading..." enquanto carrega
  }

  if (!session) {
    return null; // Previne mostrar a página antes de dar redirect para o login
  }

  // Garantir que os dados estejam disponíveis antes de renderizar
  if (!dashboardData) {
    return <p className="text-center text-lg">Loading dashboard...</p>;
  }

  const cardPaths = [
    { label: "GROUPS", value: dashboardData.totalGroups || 0, path: "/homepage/grupos" },
    { label: "FAMILIES", value: dashboardData.totalFamilies || 0, path: "/homepage/family" },
    { label: "SUBFAMILIES", value: dashboardData.totalSubfamilies || 0, path: "/homepage/subfamilia" },
    { label: "PRODUCTS", value: dashboardData.totalProducts || 0, path: "/homepage/product" },
  ];

  // Define handleCardClick
  const handleCardClick = (path) => {
    console.log(`Navigating to: ${path}`);
    router.push(path); // Navega para o caminho dado
  };

  return (
      <div>
        <h1 className="text-3xl font-semibold px-4">Dashboard</h1>

        <div className="px-4 flex flex-wrap gap-6 p-6 ">
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
