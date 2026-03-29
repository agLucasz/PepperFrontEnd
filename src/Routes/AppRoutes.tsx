import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../Pages/App.tsx';
import Dashboard from '../Pages/Dashboard.tsx';
import AdminLogin from '../Pages/Admin/AdminLogin.tsx';
import AdminDashBoard from '../Pages/Admin/AdminDashBoard.tsx';
import Produtos from '../Pages/Admin/Produto/Produtos.tsx';
import CadastrarProdutos from '../Pages/Admin/Produto/CadastrarProdutos.tsx';
import ListarProdutos from '../Pages/Admin/Produto/ListarProdutos.tsx';
import { Catalogo } from '../Pages/Catalogo.tsx';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/adminLogin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashBoard />} />
            <Route path="/admin/produtos" element={<Produtos />} />
            <Route path="/admin/produtos/cadastrar" element={<CadastrarProdutos />} />
            <Route path="/admin/produtos/listar" element={<ListarProdutos />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
