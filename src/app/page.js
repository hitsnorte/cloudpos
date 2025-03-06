"use client";

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

