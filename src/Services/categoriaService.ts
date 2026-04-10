import { API_BASE_URL } from '../config/api';

export interface CategoriaDTO {
    categoriaId: number;
    nomeCategoria: string;
}

export interface CategoriaCreateDTO {
    NomeCategoria: string;
}

function getAuthHeaders(): Record<string, string> {
    const authData = localStorage.getItem('pepperAuth');
    const token = authData ? JSON.parse(authData).token : '';
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listarCategorias(): Promise<CategoriaDTO[]> {
    const response = await fetch(`${API_BASE_URL}/api/categoria`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao listar categorias.');
    }

    return await response.json();
}

export async function obterCategoria(id: number): Promise<CategoriaDTO> {
    const response = await fetch(`${API_BASE_URL}/api/categoria/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao obter categoria.');
    }

    return await response.json();
}

export async function cadastrarCategoria(dto: CategoriaCreateDTO): Promise<CategoriaDTO> {
    const response = await fetch(`${API_BASE_URL}/api/categoria`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(dto)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao cadastrar categoria.');
    }

    return await response.json();
}

export async function atualizarCategoria(id: number, dto: CategoriaCreateDTO): Promise<CategoriaDTO> {
    const response = await fetch(`${API_BASE_URL}/api/categoria/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(dto)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao atualizar categoria.');
    }

    return await response.json();
}

export async function excluirCategoria(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/categoria/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao excluir categoria.');
    }
}
