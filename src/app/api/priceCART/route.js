export async function GET(request) {
    try {
        const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME;
        const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

        const authHeader = 'Basic ' + Buffer.from(`${BASIC_AUTH_USERNAME}:${BASIC_AUTH_PASSWORD}`).toString('base64');

        const response = await fetch('http://213.146.218.25:5101/datasnap/rest/TSysModuleComprasOnline/PrecosOnline', {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return new Response(
                JSON.stringify({ error: "Erro ao buscar dados da API externa."+response.status }),
                { status: 500, headers: { "Content-Type": "application/json; charset=UTF-8" } }
            );
        }

        const raw = await response.json();
        console.log('Raw API data:', raw);//log

        const parsedData = JSON.parse(raw.result[0]); // parse ao JSON

        return new Response(
            JSON.stringify({
                status: 'success',
                data: parsedData,
                meta: {
                    total: Array.isArray(parsedData) ? parsedData.length : 1,
                    timestamp: new Date().toISOString(),
                },
            }),
            { status: 200, headers: { "Content-Type": "application/json; charset=UTF-8" } }
    );

    } catch (error) {
        console.error('Erro interno ao buscar preços online:', error);
        return new Response(
            JSON.stringify({ error: "Erro interno do servidor." }),
            { status: 500, headers: { "Content-Type": "application/json; charset=UTF-8" } }
        );
    }
}
