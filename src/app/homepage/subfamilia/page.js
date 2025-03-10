
//Criar a tabela

"use client"

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    getKeyValue,
} from "@heroui/react"; // Importação dos componentes necessários para construir a tabela

// Dados da tabela (por enquanto está hardcoded)
const rows = [
    {
        key: "1", // Chave única para cada linha
        id: 1,
        nome: "Familia A",
    },
    {
        key: "2",
        id: "2",
        nome: "Familia B",
    },
    {
        key: "3",
        id: "3",
        nome: "Familia C",
    },
    {
        key: "4",
        id: "4",
        nome: "Familia D",
    },
];

// Definição de cada coluna da tabela
const columns = [
    {
        key: "id",
        label: "ID",
    },
    {
        key: "nome",  // key é o nome da coluna
        label: "NOME", // label é o nome apresentado da coluna com a key em cima
    },
];

export default function App() {
    return (

<p>teste</p>
    );
}