import { API_BASE_URL } from '../config/api';

export interface EntradaEstoqueCreateDTO {
    produtoId: number;
    quantidadeProduto: number;
    dataEntrada?: string; // Optional since backend might have default or we can send it
}

export interface EntradaEstoqueDTO {
    estoqueId: number;
    produtoId: number;
    produto?: any; // You can type this properly if you have the Product DTO here
    quantidadeProduto: number;
    dataEntrada: string;
}

function getAuthHeaders(): Record<string, string> {
    const authData = localStorage.getItem('pepperAuth');
    const token = authData ? JSON.parse(authData).token : '';

    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function lancarEntrada(entrada: EntradaEstoqueCreateDTO): Promise<EntradaEstoqueDTO> {
    const response = await fetch(`${API_BASE_URL}/api/entradaEstoque`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(entrada)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao lançar entrada de estoque.');
    }

    return await response.json();
}

export async function listarEntradas(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/entradaEstoque`, {
        method: 'GET',
        headers: {
            ...getAuthHeaders()
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao carregar histórico de entradas.');
    }

    return await response.json();
}

export async function excluirEntrada(estoqueId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/entradaEstoque/${estoqueId}`, {
        method: 'DELETE',
        headers: {
            ...getAuthHeaders()
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao excluir entrada de estoque.');
    }
}
