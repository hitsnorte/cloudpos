"use client"

import {Card, CardBody} from "@heroui/react";


export default function App() {
    return (
        <Card className="w-65 h-75 bg-white rounded-lg shadow-2xl border border-gray-300">
            <CardBody>
                <p>Este card é para o dashboard</p>
            </CardBody>
        </Card>
    );
}