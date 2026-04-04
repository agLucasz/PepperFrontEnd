const API_BASE_URL = 'https://localhost:7035';

export interface UsuarioCreateDTO {
    Nome: string;
    Email: string;
    SenhaHash: string;
}

export interface UsuarioDTO {
    UsuarioId: number;
    Nome: string;
    Email: string;
    Role: string;
}

function getAuthHeaders(): Record<string, string> {
    const authData = localStorage.getItem('pepperAuth');
    const token = authData ? JSON.parse(authData).token : '';

    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function cadastrarUsuario(usuario: UsuarioCreateDTO): Promise<UsuarioDTO> {
    const response = await fetch(`${API_BASE_URL}/api/usuario/usuario`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(usuario)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao cadastrar usuário.');
    }

    return await response.json();
}