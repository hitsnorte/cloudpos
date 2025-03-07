"use client";
<<<<<<< HEAD

import { Card, CardBody } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function App() {
  const router = useRouter();

  const cardPaths = [
    { label: "Grupos", value: 0, path: "/homepage/grupos" },
    { label: "Familias", value: 6, path: "/homepage/family" },
    { label: "Subfamilias", value: 0, path: "/subfamilias" }, //colocar o caminho
    { label: "Produtos", value: 0, path: "/produtos" }, //colocar o caminho
  ];

  const handleCardClick = (path) => {
    console.log(`Attempting to navigate to ${path}`); 
    try {
      router.push(path); // Tenta redirecionar
      console.log(`Successfully navigated to ${path}`); 
    } catch (error) {
      console.error(`Navigation failed: ${error.message}`); 
    }
  };

  return (
    <div>
    <h1 className="text-4xl font-semibold text-center my-6">Dashboard</h1>



    <div className="flex flex-wrap gap-4 justify-center p-6">
      {cardPaths.map((card, index) => (
        <Card
          key={index} 
          className="w-64 h-64 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col items-center p-4 cursor-pointer hover:bg-gray-100"
        >
          <CardBody className="flex flex-col items-center w-full h-full relative">
            <div
              className="w-full h-full cursor-pointer hover:bg-gray-100"
              onClick={() => {
                console.log(`Card clicked: ${card.label}`); 
                handleCardClick(card.path);
              }}
            >
              <p className="text-8xl font-bold text-gray-800 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
=======

import { Card, CardBody } from "@heroui/react";

export default function App() {
  return (
      <div className="flex flex-wrap gap-4 justify-center p-6">
        <Card className="w-65 h-75 bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col items-center p-4">
          <CardBody className="flex flex-col items-center w-full h-full relative">
            <p className="text-9xl font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              1
            </p>
            <p className="text-center text-md absolute bottom-4 left-1/2 transform -translate-x-1/2">
              Grupos
            </p>
          </CardBody>
        </Card>

        <Card className="w-65 h-75 bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col items-center p-4">
          <CardBody className="flex flex-col items-center w-full h-full relative">
            <p className="text-9xl font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              2
            </p>
            <p className="text-center text-md absolute bottom-4 left-1/2 transform -translate-x-1/2">
              Familias
            </p>
          </CardBody>
        </Card>

        <Card className="w-65 h-75 bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col items-center p-4">
          <CardBody className="flex flex-col items-center w-full h-full relative">
            <p className="text-9xl font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              3
            </p>
            <p className="text-center text-md absolute bottom-4 left-1/2 transform -translate-x-1/2">
              Subfamilias
            </p>
          </CardBody>
        </Card>

        <Card className="w-65 h-75 bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col items-center p-4">
          <CardBody className="flex flex-col items-center w-full h-full relative">
            <p className="text-9xl font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              4
            </p>
            <p className="text-center text-md absolute bottom-4 left-1/2 transform -translate-x-1/2">
              Produtos
            </p>
          </CardBody>
        </Card>
      </div>
);
}

>>>>>>> 7f2970a2f7bc228806fc76ba8945cc4607cc95aa
