// pages/api/dashboardData.js
export default async function handler(req, res) {
    if (req.method === 'GET') {
      // Aqui você simula a consulta aos dados reais, como de um banco de dados
      const groupsCount = 10; // Exemplo de número de grupos
      const familiesCount = 20; // Exemplo de número de famílias
      const subfamiliesCount = 30; // Exemplo de número de subfamílias
      const productsCount = 50; // Exemplo de número de produtos
  
      // Retorna os dados para o frontend
      res.status(200).json({
        groupsCount,
        familiesCount,
        subfamiliesCount,
        productsCount,
      });
    } else {
      // Se o método não for GET, retorna erro 405 (Método Não Permitido)
      res.status(405).json({ error: 'Método não permitido' });
    }
  }
  