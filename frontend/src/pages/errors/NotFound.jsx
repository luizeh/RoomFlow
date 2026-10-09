import { Link } from 'react-router-dom';
import '../../styles/pages/errors.css';

export default function NotFound() {
    return (
        <main className="page not-found">
            <span className="not-found-code">404</span>
            <h1 className="page-title">Página não encontrada</h1>
            <p className="page-subtitle">O endereço que você acessou não existe ou foi removido.</p>
            <Link to="/rooms" className="btn btn-primary">
                <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Voltar para salas
            </Link>
        </main>
    );
}
