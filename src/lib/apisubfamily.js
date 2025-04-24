export const fetchSubfamily = async () => {
  try {
    let selectedPropertyID = null;

    // Verifique se estamos no cliente antes de acessar o localStorage
    if (typeof window !== 'undefined') {
      selectedPropertyID = localStorage.getItem('selectedProperty');
    }

    // Verifica se o selectedPropertyID foi obtido
    if (!selectedPropertyID) {
      console.warn('PropertyID não encontrado no localStorage');
      throw new Error('PropertyID não encontrado no localStorage');
    }

    // Fazer a requisição GET com o propertyID no cabeçalho
    const response = await fetch('/api/subfamily', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Property-ID': selectedPropertyID, // Enviando no cabeçalho
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar Subfamilias');
    }

    const data = await response.json();
    return data.data; // Retorna apenas as Subfamilias (ajuste conforme o formato JSON da sua API)
  } catch (error) {
    console.error('Erro ao buscar Subfamilias:', error);
    throw error;
  }
};
