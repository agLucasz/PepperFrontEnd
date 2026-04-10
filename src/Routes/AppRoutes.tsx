import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../Pages/App.tsx';
import Dashboard from '../Pages/Dashboard.tsx';
import AdminLogin from '../Pages/Admin/AdminLogin.tsx';
import AdminDashBoard from '../Pages/Admin/AdminDashBoard.tsx';
import Produtos from '../Pages/Admin/Produto/Produtos.tsx';
import CadastrarProdutos from '../Pages/Admin/Produto/CadastrarProdutos.tsx';
import ListarProdutos from '../Pages/Admin/Produto/ListarProdutos.tsx';
import Vendas from '../Pages/Admin/Venda/Venda.tsx';
import CadastrarVenda from '../Pages/Admin/Venda/CadastrarVenda.tsx';
import ListarVenda from '../Pages/Admin/Venda/ListarVenda.tsx';
import Estoque from '../Pages/Admin/Estoque/Estoque.tsx';
import LancarEstoque from '../Pages/Admin/Estoque/LancarEstoque.tsx';
import ListarEstoque from '../Pages/Admin/Estoque/ListarEstoque.tsx';
import CadastrarEmpresa from '../Pages/Admin/Empresa/CadastrarEmpresa.tsx';
import Categorias from '../Pages/Admin/Categorias/Categorias.tsx';
import CadastrarCategoria from '../Pages/Admin/Categorias/CadastrarCategoria.tsx';
import ListarCategorias from '../Pages/Admin/Categorias/ListarCategorias.tsx';
import { Catalogo } from '../Pages/Catalogo.tsx';

function isAuthenticated(): boolean {
    try {
        const authRaw = localStorage.getItem('pepperAuth');
        if (!authRaw) return false;
        const auth = JSON.parse(authRaw) as { token?: string };
        return Boolean(auth?.token);
    } catch {
        return false;
    }
}

type GuardProps = {
    children: React.ReactElement;
};

const ProtectedRoute: React.FC<GuardProps> = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/adminLogin" replace />;
};

const PublicAdminLoginRoute: React.FC<GuardProps> = ({ children }) => {
    return isAuthenticated() ? <Navigate to="/admin/dashboard" replace /> : children;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/adminLogin" element={<PublicAdminLoginRoute><AdminLogin /></PublicAdminLoginRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashBoard /></ProtectedRoute>} />
            <Route path="/admin/produtos" element={<ProtectedRoute><Produtos /></ProtectedRoute>} />
            <Route path="/admin/produtos/cadastrar" element={<ProtectedRoute><CadastrarProdutos /></ProtectedRoute>} />
            <Route path="/admin/produtos/listar" element={<ProtectedRoute><ListarProdutos /></ProtectedRoute>} />
            <Route path="/admin/vendas" element={<ProtectedRoute><Vendas /></ProtectedRoute>} />
            <Route path="/admin/vendas/cadastrar" element={<ProtectedRoute><CadastrarVenda /></ProtectedRoute>} />
            <Route path="/admin/vendas/listar" element={<ProtectedRoute><ListarVenda /></ProtectedRoute>} />
            <Route path="/admin/estoque" element={<ProtectedRoute><Estoque /></ProtectedRoute>} />
            <Route path="/admin/estoque/lancar" element={<ProtectedRoute><LancarEstoque /></ProtectedRoute>} />
            <Route path="/admin/estoque/listar" element={<ProtectedRoute><ListarEstoque /></ProtectedRoute>} />
            <Route path="/admin/empresa/cadastrar" element={<ProtectedRoute><CadastrarEmpresa /></ProtectedRoute>} />
            <Route path="/admin/categorias" element={<ProtectedRoute><Categorias /></ProtectedRoute>} />
            <Route path="/admin/categorias/cadastrar" element={<ProtectedRoute><CadastrarCategoria /></ProtectedRoute>} />
            <Route path="/admin/categorias/listar" element={<ProtectedRoute><ListarCategorias /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
