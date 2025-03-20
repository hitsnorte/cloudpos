// src/lib/apifamily.js
export const fetchFamily = async () => {
    try {
      const response = await fetch('/api/family', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Erro ao buscar familias');
      }
      const data = await response.json();
      return data.data; // Retorna apenas as familias (ajuste conforme o formato JSON da sua API)
    } catch (error) {
      console.error('Erro ao buscar familias:', error);
      throw error;
    }
  };
  
  export const createFamily = async (familyData) => {
    try {
      const response = await fetch('/api/family', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(familyData), // Espera { family_name: string }
      });
      if (!response.ok) {
        throw new Error('Erro ao criar familia');
      }
      const data = await response.json();
      return data.data; // Retorna a familia criada
    } catch (error) {
      console.error('Erro ao criar familia:', error);
      throw error;
    }
  };
  
  export const deleteFamily = async (id) => {
    try {
      const response = await fetch(`/api/family/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Erro ao excluir familia');
      }
      return true; // Confirma a exclusão bem-sucedida
    } catch (error) {
      console.error('Erro ao excluir familia:', error);
      throw error;
    }
  };
  
  export const updateFamily = async (id, familyData) => {
    try {
      const response = await fetch(`/api/family/${id}`, {
        method: 'PATCH', // Troque para 'PATCH' se necessário
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(familyData),
      });
      if (!response.ok) {
        const errorDetails = await response.text(); // Obtém detalhes da resposta de erro
        throw new Error(`Erro ao atualizar família: ${errorDetails}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erro ao atualizar familia:', error);
      throw error;
    }
  };