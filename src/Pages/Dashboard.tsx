import React from 'react';
import Sidebar from '../Components/Sidebar';
import '../Styles/dashboard.css';

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            
            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h2 className="dashboard-title">Catálogo</h2>
                    <p className="dashboard-subtitle">Explore as melhores camisas de times disponíveis.</p>
                </header>
                
                {/* Aqui entrará o grid de produtos futuramente */}
                <div>
                    <p>Conteúdo do catálogo será exibido aqui...</p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
