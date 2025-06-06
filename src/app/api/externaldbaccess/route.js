import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

export async function GET(request) {
  const dbTableName = request.headers.get('dbtablename');
  const authHeader = request.headers.get('Authorization');

  // Verifica o header Authorization
  if (
    authHeader !==
    'q4vf9p8n4907895f7m8d24m75c2q947m2398c574q9586c490q756c98q4m705imtugcfecvrhym04capwz3e2ewqaefwegfiuoamv4ros2nuyp0sjc3iutow924bn5ry943utrjmi'
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validação simples do nome da tabela (evita SQL Injection)
  if (!/^[a-zA-Z0-9_]+$/.test(dbTableName)) {
    return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
  }

  try {
    // Consulta dinâmica usando Prisma (apenas para tabelas já mapeadas no schema)
    const data = await prisma[dbTableName].findMany();

    // Exemplo de uso do axios (pode ser removido se não precisar fazer request externo)
    // const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
    // const externalData = response.data;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}