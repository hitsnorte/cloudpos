export async function GET(request) {
  try {
    const propertyID = request.headers.get('X-Property-ID');

    if (!propertyID) {
      return new Response(
        JSON.stringify({ error: "propertyID é obrigatório." }),
        { status: 400, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    const API_BASE_URL = process.env.API_BASE_URL;

    const propertyResponse = await fetch(`${API_BASE_URL}/api/properties/get_properties/${propertyID}`);
    if (!propertyResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Erro ao acessar informações da propriedade." }),
        { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    const propertyData = await propertyResponse.json();
    const { propertyServer, propertyPort } = propertyData;

    const url = `http://${propertyServer}:${propertyPort}/getmesasemuso`;
    const response = await fetch(url);
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Erro ao acessar o servidor de produto." }),
        { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
      );
    }

    // CORREÇÃO AQUI:
    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { "content-type": "application/json; charset=UTF-8" } }
    );

  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor." }),
      { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
    );
  }
}
