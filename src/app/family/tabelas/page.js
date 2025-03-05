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

        <Table aria-label="Example table with dynamic content" className="border border-gray-300 bg-white shadow-md rounded-lg w-full">
            {/* Cabeçalho da tabela */}
            <TableHeader columns={columns}>
                {(column) => (
                    // Para cada coluna definida, renderiza o TableColumn
                    <TableColumn
                        key={column.key} // chave única da coluna
                        className="px-4 py-2 text-left font-semibold border-b border-gray-300"
                    >
                        {column.label}  {/* Exibe o rótulo da coluna */}
                    </TableColumn>
                )}
            </TableHeader>

            {/* Corpo da tabela */}
            <TableBody items={rows}>
                {(item) => (
                    // Para cada linha de dados, renderiza um TableRow
                    <TableRow key={item.key} className="border-b border-gray-300">
                        {(columnKey) => (
                            // Para cada célula, exibe o valor correspondente à chave da coluna
                            <TableCell
                                key={columnKey} // chave da coluna
                                className="px-4 py-2 text-left border-r border-gray-300"
                            >
                                {getKeyValue(item, columnKey)}
                            </TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
