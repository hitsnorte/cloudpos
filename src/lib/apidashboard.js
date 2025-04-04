export const fetchDashboard = async () => {
  try {
    // Recuperar o selectedProperty do localStorage
    const selectedProperty = localStorage.getItem('selectedProperty');

    // Verificar se existe um propertyID válido
    if (!selectedProperty) {
      throw new Error('Property ID não encontrado no localStorage.');
    }

    // Fazer a requisição com o cabeçalho correto
    const response = await fetch('/api/dashboard', {
      method: 'GET',
      headers: {
        'X-Property-ID': selectedProperty,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dashboard');
    }

    const data = await response.json();
    console.log("Resposta da API:", data); // Para depuração

    return data.data;  // Retorna a propriedade 'data'
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    throw error;
  }
};
