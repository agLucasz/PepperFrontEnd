export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  usuarioId: number;
  token: string;
  nome: string;
  email: string;
}

const API_BASE_URL = 'https://localhost:7035';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email,
      senhaHash: credentials.password,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const message = errorText || 'Não foi possível realizar o login.';
    throw new Error(message);
  }

  const data = (await response.json()) as LoginResponse;
  return data;
}
