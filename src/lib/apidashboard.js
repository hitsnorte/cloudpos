export const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Erro ao buscar dashboard');
      }
  
      const data = await response.json();
      console.log("Resposta da API:", data); // Verificando a estrutura da resposta
  
      return data.data;  // Retorna a propriedade 'data' que contém o 'totalGroups'
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      throw error;
    }
  };
  