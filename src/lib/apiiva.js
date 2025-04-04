// src/lib/apiiva.js
export const fetchIva = async () => {
    try {
      // Obter o propertyID do localStorage
      const selectedPropertyID = localStorage.getItem('selectedProperty');
  
      if (!selectedPropertyID) {
        throw new Error('PropertyID não encontrado no localStorage');
      }
  
      // Fazer a requisição GET com o propertyID no cabeçalho
      const response = await fetch('/api/iva', {
        method: 'GET', // Mantendo o método GET
        headers: {
          'Content-Type': 'application/json',
          'X-Property-ID': selectedPropertyID, // Enviando no cabeçalho
        },
      });
  
      if (!response.ok) {
        throw new Error('Erro ao buscar iva');
      }
  
      const data = await response.json();
      return data.data; // Retorna apenas os produtos (ajuste conforme o formato JSON da sua API)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  };
  