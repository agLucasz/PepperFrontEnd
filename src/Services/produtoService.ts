const API_BASE_URL = 'https://localhost:7035';

export interface ProdutoCreateDTO {
    NomeProduto: string;
    DescricaoProduto?: string;
    ValorCompra: number;
    ValorVenda: number;
    Quantidade: number;
    Tamanho: string[];
    PaisCodigoISO: string;
    ImagemUrl: string;
}

export interface ProdutoDTO {
    ProdutoId: number;
    NomeProduto: string;
    DescricaoProduto?: string;
    ValorCompra: number;
    ValorVenda: number;
    Quantidade: number;
    Tamanho: string[];
    PaisCodigoISO: string;
    Ativo: boolean;
    ImagemUrl?: string;
}

export interface ProdutoCatalogoDTO {
    produtoId: number;
    nomeProduto: string;
    descricaoProduto?: string;
    valorVenda: number;
    tamanho: string;
    imagemUrl?: string;
}

interface UploadImageResponseDTO {
    imageUrl: string;
}

function getAuthHeaders(): Record<string, string> {
    const authData = localStorage.getItem('pepperAuth');
    const token = authData ? JSON.parse(authData).token : '';

    return token ? { Authorization: `Bearer ${token}` } : {};
}

function mapProdutoPayload(produto: ProdutoCreateDTO) {
    return {
        ...produto,
        Tamanho: produto.Tamanho.reduce((acc, curr) => acc + parseInt(curr, 10), 0)
    };
}

export async function uploadImagem(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao enviar imagem.');
    }

    const data = await response.json() as UploadImageResponseDTO;
    return data.imageUrl;
}

export async function cadastrarProduto(produto: ProdutoCreateDTO): Promise<ProdutoDTO> {
    const response = await fetch(`${API_BASE_URL}/api/produto`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(mapProdutoPayload(produto))
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao cadastrar produto.');
    }

    return await response.json();
}

export async function listarProdutos(): Promise<ProdutoDTO[]> {
    const response = await fetch(`${API_BASE_URL}/api/produto`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao listar produtos.');
    }

    return await response.json();
}

export async function listarCatalogo(): Promise<ProdutoCatalogoDTO[]> {
    const response = await fetch(`${API_BASE_URL}/api/produto/catalogo`, {
        method: 'GET'
        // Catalogo geralmente é público, não precisa de token.
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao listar catálogo.');
    }

    return await response.json();
}

export async function desativarProduto(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/produto/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao excluir produto.');
    }
}
