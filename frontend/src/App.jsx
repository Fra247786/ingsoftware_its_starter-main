import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router";
import HomePage from "./HomePage.jsx";
import FacilityPage from "./FacilityPage.jsx";

function Header() {
  const { pathname, hash } = useLocation();
  const onHome = pathname === "/";
  const onCenter = onHome && hash === "#centro";

  return (
    <header className="site-header">
      <div className="container header-content">
        <Link className="brand" to="/" aria-label="SportHub, pagina iniziale">
          <span className="brand-symbol" aria-hidden="true">
            S
          </span>
          <span>SportHub</span>
        </Link>
        <nav aria-label="Navigazione principale">
          <ul className="nav-list">
            <li>
              <Link
                className={`nav-link${onHome && !onCenter ? " current" : ""}`}
                to="/#impianti"
                aria-current={onHome && !onCenter ? "location" : undefined}
              >
                Impianti
              </Link>
            </li>
            <li>
              <Link
                className={`nav-link${onCenter ? " current" : ""}`}
                to="/#centro"
                aria-current={onCenter ? "location" : undefined}
              >
                Il centro
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        SportHub · Il centro sportivo a portata di mano
      </div>
    </footer>
  );
}

function NotFoundPage() {
  useEffect(() => {
    document.title = "Pagina non trovata | SportHub";
  }, []);

  return (
    <main className="section">
      <div className="container">
        <h1>Pagina non trovata</h1>
        <p>La pagina richiesta non esiste.</p>
        <Link className="back-link" to="/">
          Torna agli impianti
        </Link>
      </div>
    </main>
  );
}

export default function App() {
  const { pathname, hash, key } = useLocation();

  // I Link cambiano URL senza ricaricare il documento: gestiamo anche lo scroll.
  useEffect(() => {
    if (hash) {
      // Esempio: se vai su `/#impianti`, `hash` vale `"#impianti"`.
      // `slice(1)` rimuove `#`, poi cerchiamo l’elemento con `id="impianti"` e lo portiamo in vista con `scrollIntoView()`.
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      // Se vai su `/facilities/1`, non c’è un hash: `window.scrollTo(0, 0)` porta la pagina all’inizio
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, key]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/facilities/:id" element={<FacilityPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  );
}
