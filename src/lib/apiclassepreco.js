// src/lib/apiiva.js
export const fetchClassepreco = async () => {
    try {
      // Obter o propertyID do localStorage
      const selectedPropertyID = localStorage.getItem('selectedProperty');
  
      if (!selectedPropertyID) {
        throw new Error('PropertyID não encontrado no localStorage');
      }
  
      // Fazer a requisição GET com o propertyID no cabeçalho
      const response = await fetch('/api/classepreco', {
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
  
  export const createClassepreco = async (classeprecoData) => {
    try {
      const response = await fetch('/api/classepreco', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classeprecoData), // Espera { classepreco_name: string }
      });
      if (!response.ok) {
        throw new Error('Erro ao criar classeprecoData');
      }
      const data = await response.json();
      return data.data; // Retorna o classeprecoData criado
    } catch (error) {
      console.error('Erro ao criar classeprecoData:', error);
      throw error;
    }
  };