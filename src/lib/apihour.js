// src/lib/apihour.js
export const fetchHour = async () => {
    try {
      // Obter o propertyID do localStorage
      const selectedPropertyID = localStorage.getItem('selectedProperty');
  
      if (!selectedPropertyID) {
        throw new Error('PropertyID não encontrado no localStorage');
      }
  
      // Fazer a requisição GET com o propertyID no cabeçalho
      const response = await fetch('/api/hour', {
        method: 'GET', // Mantendo o método GET
        headers: {
          'Content-Type': 'application/json',
          'X-Property-ID': selectedPropertyID, // Enviando no cabeçalho
        },
      });
  
      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }
  
      const data = await response.json();
      return data.data; // Retorna apenas os produtos (ajuste conforme o formato JSON da sua API)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  };
  
  export const createHour = async (hourData) => {
    try {
      const response = await fetch('/api/hour', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hourData), // Espera { hour_name: string }
      });
      if (!response.ok) {
        throw new Error('Erro ao criar hourData');
      }
      const data = await response.json();
      return data.data; // Retorna o hourData criado
    } catch (error) {
      console.error('Erro ao criar hourData:', error);
      throw error;
    }
  };