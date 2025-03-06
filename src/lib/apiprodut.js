// src/lib/api.js
export const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cloudproducts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao buscar produtos');
      const data = await response.json();
      return data.data; // Retorna apenas os produtos (ajuste conforme o formato JSON)
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  };
  
  export const createProduct = async (productData) => {
    try {
      const response = await fetch('http://localhost:3000/api/cloudproducts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Erro ao criar produto');
      const data = await response.json();
      return data.data; // Retorna o produto criado
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  };
  
  export const deleteProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cloudproducts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao excluir produto');
      // Não retorna dados, apenas confirma a exclusão
      return true;
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  };
  
  export const updateProduct = async (id, productData) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cloudproducts/${id}`, {
        method: 'PUT', // Ou 'PATCH', dependendo da API
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Erro ao atualizar produto');
      const data = await response.json();
      return data.data; // Retorna o produto atualizado
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  };


