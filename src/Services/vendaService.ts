const API_BASE_URL = 'https://localhost:7035';

export interface VendaItemCreateDTO {
    ProdutoId: number;
    QuantidadeItem: number;
    ValorUnitario: number;
}

export interface VendaCreateDTO {
    DtVenda: string;
    Items: VendaItemCreateDTO[];
}

export interface VendaItemDTO {
    VendaItemId: number;
    VendaId: number;
    ProdutoId: number;
    Produto?: string;
    ValorUnitario: number;
    QuantidadeItem: number;
    ValorTotal: number;
}

export interface VendaDTO {
    VendaId: number;
    DtVenda: string;
    Itens: VendaItemDTO[];
    ValorTotal: number;
}

function getAuthHeaders(): Record<string, string> {
    const authData = localStorage.getItem('pepperAuth');
    const token = authData ? JSON.parse(authData).token : '';
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function lancarVenda(venda: VendaCreateDTO, confirmarDesconto: boolean = false): Promise<VendaDTO> {
    const response = await fetch(`${API_BASE_URL}/api/venda/venda?confirmarDesconto=${confirmarDesconto}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(venda)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao lançar venda.');
    }

    return await response.json();
}

export async function listarVendas(): Promise<VendaDTO[]> {
    const response = await fetch(`${API_BASE_URL}/api/venda/venda`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao listar vendas.');
    }

    return await response.json();
}

export async function obterVenda(id: number): Promise<VendaDTO> {
    const response = await fetch(`${API_BASE_URL}/api/venda/venda/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao obter venda.');
    }

    return await response.json();
}

export async function excluirVenda(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/venda/venda/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao excluir venda.');
    }
}
