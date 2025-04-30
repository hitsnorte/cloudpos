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

        // Faz a requisição para a API de propriedades para obter server e port
        const propertyResponse = await fetch(`${API_BASE_URL}/api/properties/get_properties/${propertyID}`);
        if (!propertyResponse.ok) {
            return new Response(
                JSON.stringify({ error: "Erro ao acessar informações da propriedade." }),
                { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        const propertyData = await propertyResponse.json();
        const { propertyServer, propertyPort } = propertyData;


        const pricesUrl = `http://${propertyServer}:${propertyPort}/getprecos`;
        const pricesResponse = await fetch(pricesUrl);
        if (!pricesResponse.ok) {
            return new Response(
                JSON.stringify({ error: "Erro ao aceder os preços." }),
                { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        const pricesData = await pricesResponse.json();

        const responseData = {
            status: "success",
            data: pricesData,
            meta: {
                total: pricesData.length,
                timestamp: new Date().toISOString(),
            },
        };

        return new Response(
            JSON.stringify(responseData),
            { status: 200, headers: { "content-type": "application/json; charset=UTF-8" } }
        );

    } catch (error) {
        console.error('Erro interno /api/prices:', error);
        return new Response(
            JSON.stringify({ error: "Erro interno do servidor." }),
            { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
        );
    }
}
