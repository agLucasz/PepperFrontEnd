export const API_BASE_URL =
  import.meta.env.REACT_APP_API_URL ??
  import.meta.env.VITE_API_URL ??
  'http://localhost:5000';

export const PRODUTO_HUB_URL = `${API_BASE_URL}/produtoHub`;
