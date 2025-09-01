import apiClient from '~/services/api'; // Importa nosso apiClient do Axios

// Uma interface que descreve o "envelope" padrão da nossa API Laravel
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const useApi = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown,
  params?: Record<string, any>
): Promise<T> => {
  try {
    // Usa o apiClient para fazer a requisição
    const response = await apiClient.request<ApiResponse<T>>({
      method,
      url: endpoint,
      data: body,
      params,
    });

    if (response.data.success) {
      // Em caso de sucesso, retorna apenas o conteúdo da chave 'data'
      return response.data.data;
    } else {
      // Se a API retornar success: false, lança um erro com a mensagem da API
      throw new Error(response.data.message || 'A API retornou um status de não sucesso.');
    }
  } catch (error: any) {
    // Em caso de erro de rede ou outro, captura e re-lança para o componente tratar
    const errorMessage = error.response?.data?.message || error.message;
    console.error(`Erro na chamada da API para ${endpoint}:`, errorMessage);
    throw new Error(errorMessage);
  }
};