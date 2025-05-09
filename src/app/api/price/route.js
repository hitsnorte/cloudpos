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

        //Requisição ao /getprecos
        const pricesUrl = `http://${propertyServer}:${propertyPort}/getprecos`;
        const pricesResponse = await fetch(pricesUrl);
        if (!pricesResponse.ok) {
            return new Response(
                JSON.stringify({ error: "Erro ao aceder os preços." }),
                { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        const pricesData = await pricesResponse.json();

        //Extrai todos os códigos unicos das classes de preços a partir dos preços retornados
        const classCodes = [... new Set(pricesData.map(p => p.VCodClas))];

        //Faz uma requisição ao /getclacexp
        const clacexpurl = `http://${propertyServer}:${propertyPort}/getclacexp`;
        const clacexpResponse = await fetch (clacexpurl);
        const clacexpData= await clacexpResponse.json();

        //Mapeia os códigos das classes de preços para os centros de exploração
        const classtocexpMap ={};
        clacexpData.forEach(item => {
            classtocexpMap[item.icodiClasse] = item.IcodiCenExp;
        });

        const cexpCodes= [...new Set(Object.values(classtocexpMap))];

            const CexpURL = `http://${propertyServer}:${propertyPort}/getcenexp`;
            const CexpResponse = await fetch(CexpURL);
            const CexpData= await CexpResponse.json();

            //Mapeia os código dos Centros de exploração para os nomes dos respetivos centros
            const cexpMap = {};
            CexpData.forEach(cexp => {
                cexpMap[cexp.icodi] = cexp.Vdesc;
            })

        //Acrescenta ao /getprecos com o código e o nome do Centro de exploração
        const enrichedPrices= pricesData.map(p => {
            const cexpCode = classtocexpMap[p.VCodClas];
            const cexpName = cexpMap[cexpCode] || 'UNKNOWN';

            return{
                ...p,
                cexpCode,
                cexpName,
            }
        })

        //Monta a resposta final
        const responseData = {
            status: "success",
            data: enrichedPrices,
            meta: {
                total: enrichedPrices.length,
                timestamp: new Date().toISOString(),
            },
        };

        return new Response(
            JSON.stringify(responseData),
            { status: 200, headers: { "content-type": "application/json; charset=UTF-8" } }
        );

    } catch (error) {
        console.error('Erro interno ', error);
        return new Response(
            JSON.stringify({ error: "Erro interno do servidor." }),
            { status: 500, headers: { "content-type": "application/json; charset=UTF-8" } }
        );
    }
}
