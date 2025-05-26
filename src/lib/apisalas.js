export const fetchSalas = async () => {
    try {
        const selectedPropertyID = localStorage.getItem('selectedProperty');
        const response = await fetch('/api/salas', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Property-ID': selectedPropertyID,
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar preços.');
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Erro ao buscar preços:', error);
        throw error;
    }
};
