import { API_BASE_URL } from '../config/api';

export interface PaisApi {
    nome: string;
    Nome?: string;
    codigoISO2: string;
    CodigoISO2?: string;
    codigoISO3: string;
    CodigoISO3?: string;
}

export async function listarPaises(): Promise<PaisApi[]> {
    const response = await fetch(`${API_BASE_URL}/api/localizacao/paises`);
    if (!response.ok) {
        throw new Error('Erro ao carregar países.');
    }
    return await response.json();
}

export async function listarPaisesComProdutos(): Promise<PaisApi[]> {
    const response = await fetch(`${API_BASE_URL}/api/localizacao/paises-disponiveis`);
    if (!response.ok) {
        throw new Error('Erro ao carregar países com produtos.');
    }
    return await response.json();
}
