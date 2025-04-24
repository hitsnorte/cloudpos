// /src/app/api/subfamily/get_subfamily/[id]/route.js

import { fetchSubfamily} from "@/src/lib/apisubfamily";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // Check if the ID is valid (this can stay the same)
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'ID inválido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use `fetchSubfamily` to get the list of subfamilies from the API
    const subfamilias = await fetchSubfamily();

    // Find the subfamily that matches the given ID
    const subfamilia = subfamilias.find((subfam) => subfam.id === parseInt(id));

    if (!subfamilia) {
      return new Response(JSON.stringify({ error: 'Subfamilia não encontrada.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(subfamilia), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar subfamilia.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
