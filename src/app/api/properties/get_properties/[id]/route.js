import prisma from '@/src/lib/prisma';


export async function GET(_, { params }) {  // ← Pega os parâmetros da URL
    try {
        const { id: propertyID } = await params;  // ← Captura o parâmetro de rota `[id]`

        if (!propertyID) {
            return new Response(
                JSON.stringify({ error: "propertyID é obrigatório." }),
                { status: 400, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        const propertyIDInt = parseInt(propertyID, 10);
        if (isNaN(propertyIDInt)) {
            return new Response(
                JSON.stringify({ error: "propertyID inválido." }),
                { status: 400, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        // Busca a propriedade no banco de dados
        const property = await prisma.cloud_properties.findUnique({
            where: { propertyID: propertyIDInt },
            select: { propertyServer: true, propertyPort: true }
        });

        if (!property) {
            return new Response(
                JSON.stringify({ error: "Propriedade não encontrada." }),
                { status: 404, headers: { "content-type": "application/json; charset=UTF-8" } }
            );
        }

        // Retorna o propertyServer e propertyPort
        return new Response(
            JSON.stringify({ propertyServer: property.propertyServer, propertyPort: property.propertyPort }),
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