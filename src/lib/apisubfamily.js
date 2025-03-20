// src/lib/apisubfamily.js
export const fetchSubfamily = async () => {
    try {
      const response = await fetch('/api/subfamily', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Erro ao buscar as sub familias');
      }
      const data = await response.json();
      return data.data; // Retorna apenas os grupos (ajuste conforme o formato JSON da sua API)
    } catch (error) {
      console.error('Erro ao buscar as sub familias:', error);
      throw error;
    }
  };
  
  export const createSubfamily = async (subfamiliaData) => {
    try {
      const response = await fetch('/api/subfamily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subfamiliaData), // Espera { nome: string }
      });
      if (!response.ok) {
        throw new Error('Erro ao criar uma sub familia');
      }
      const data = await response.json();
      return data.data; // Retorna o grupo criado
    } catch (error) {
      console.error('Erro ao criar uma sub familia:', error);
      throw error;
    }
  };
  
  export const deleteSubfamily = async (id) => {
    try {
      const response = await fetch(`/api/subfamily/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Erro ao excluir grupo');
      }
      return true; // Confirma a exclusão bem-sucedida
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      throw error;
    }
  };
  
  export const updateSubfamily = async (id, subfamiliaData) => {
    try {
      const response = await fetch(`/api/subfamily/${id}`, {
        method: 'PATCH', // Troque para 'PATCH' se necessário
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subfamiliaData),
      });
      if (!response.ok) {
        const errorDetails = await response.text(); // Obtém detalhes da resposta de erro
        throw new Error('Erro ao atualizar subfamilia');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erro ao atualizar subfamilia:', error);
      throw error;
    }
  };