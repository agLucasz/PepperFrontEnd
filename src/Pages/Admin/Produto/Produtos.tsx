import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, List } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Produto/Produtos.css';

const Produtos: React.FC = () => {
    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            
            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Produtos</h2>
                    <p className="admin-dashboard-subtitle">Gerencie o catálogo de produtos da loja.</p>
                </header>
                
                <div className="produtos-container">
                    <Link to="/admin/produtos/cadastrar" className="produto-card">
                        <PlusCircle size={48} className="produto-card-icon" />
                        <h3 className="produto-card-title">Cadastrar Produto</h3>
                        <p className="produto-card-description">
                            Adicione novas camisas ao catálogo. Preencha informações como nome, preço, tamanho e fotos.
                        </p>
                    </Link>

                    <Link to="/admin/produtos/listar" className="produto-card">
                        <List size={48} className="produto-card-icon" />
                        <h3 className="produto-card-title">Listar Produtos</h3>
                        <p className="produto-card-description">
                            Visualize, edite ou remova produtos existentes. Controle o estoque e as informações.
                        </p>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Produtos;
