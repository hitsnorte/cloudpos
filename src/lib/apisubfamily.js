// src/lib/apisubfamily.js
export const fetchGrup = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/subfamily', {
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
  
  export const createGrup = async (subfamiliaData) => {
    try {
      const response = await fetch('http://localhost:3000/api/subfamilia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subfamiliaDataData), // Espera { nome: string }
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
  
  export const deleteGrup = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/subfamily/${id}`, {
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
  
  export const updateGrupt = async (id, subfamiliaData) => {
    try {
      const response = await fetch(`http://localhost:3000/api/subfamily/${id}`, {
        method: 'PUT', // Troque para 'PATCH' se necessário
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subfamiliaData),
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar grupo');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      throw error;
    }
  };