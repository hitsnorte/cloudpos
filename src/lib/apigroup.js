// src/lib/apigroup.js
export const fetchGrup = async () => {
  try {
    // Obter o propertyID do localStorage
    const selectedPropertyID = localStorage.getItem('selectedProperty');

    if (!selectedPropertyID) {
      throw new Error('PropertyID não encontrado no localStorage');
    }

    // Fazer a requisição GET com o propertyID no cabeçalho
    const response = await fetch('/api/group', {
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

export const createGrup = async (groupData) => {
  try {
    const response = await fetch('/api/group', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData), // Espera { group_name: string }
    });
    if (!response.ok) {
      throw new Error('Erro ao criar grupo');
    }
    const data = await response.json();
    return data.data; // Retorna o grupo criado
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    throw error;
  }
};

export const deleteGrup = async (id) => {
  try {
    const response = await fetch(`/api/group/${id}`, {
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

export const updateGrupt = async (id, groupData) => {
  try {
    const response = await fetch(`/api/group/${id}`, {
      method: 'PATCH', // Troque para 'PATCH' se necessário
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData),
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