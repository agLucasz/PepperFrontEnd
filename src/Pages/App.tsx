import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import '../Styles/app.css';
import logo from '../Assets/logo_pepper.png';

function App() {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate('/catalogo');
  };

  return (
    <div className="app-layout">
      <div className="app-container">
        <div className="app-content-box">
          <div className="logo-container">
            <img src={logo} alt="Pepper Logo" className="company-logo" />
          </div>
          
          <div className="presentation-content">
            <div className="title-wrapper">
              <ShoppingBag className="title-icon" size={32} />
              <h1 className="presentation-title">Pepper Import's</h1>
            </div>
            <p className="presentation-subtitle">
              A melhor loja de camisas de times de futebol.<br/>
              Qualidade e tradição em cada detalhe.
            </p>
            
            <button className="enter-button" onClick={handleEnter}>
              Acessar Catálogo
              <ArrowRight size={20} className="button-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
