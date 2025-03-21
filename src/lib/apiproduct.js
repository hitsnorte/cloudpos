// src/lib/apiproduct.js
  export const fetchProduct = async () => {
    try {
      const response = await fetch('/api/cloudproducts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
  
  export const createProduct = async (productData) => {
    
    try {
      const response = await fetch('/api/cloudproducts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData), // Espera { produto_name: string }
      });
      if (!response.ok) {
        
        throw new Error('Erro ao criar produto');
      }
      const data = await response.json();
      return data.data; // Retorna o produto criado
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      console.log('Erro ao criar produto:', error);

      throw error;
    }
  };
  
  export const deleteProduct = async (id) => {
    try {
      const response = await fetch(`/api/cloudproducts/${id}`, {
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

      const response = await fetch(`/api/cloudproducts/${id}`, {
        method: 'PATCH', // Troque para 'PATCH' se necessário
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar produto');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {

      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  };
