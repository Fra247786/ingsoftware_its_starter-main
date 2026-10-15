import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import FacilityCard from './FacilityCard.jsx';
import centerImage from '../assets/centro-sportivo-drone.webp';

const apiUrl = 'http://localhost:3000';

export default function HomePage() {
  const [facilities, setFacilities] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    document.title = 'Impianti | SportHub';
    setStatus('loading');

    async function loadFacilities() {
      try {
        const response = await fetch(`${apiUrl}/facilities`);
        if (!response.ok) throw new Error('Risposta del server non valida');
        const data = await response.json();
        setFacilities(data);
        setStatus(data.length === 0 ? 'empty' : 'ready');
      } catch {
        setStatus('error');
      }
    }

    loadFacilities();
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="container hero-content">
          <p className="eyebrow">Il tuo spazio per lo sport</p>
          <h1>Trova il posto giusto per muoverti.</h1>
          <p className="hero-text">Esplora gli impianti del centro sportivo e scopri quello più adatto alla tua attività.</p>
          <Link className="button button-primary" to="/#impianti">Esplora gli impianti <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="section" id="impianti" aria-labelledby="facilities-title">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Gli spazi</p>
              <h2 id="facilities-title">I nostri impianti</h2>
            </div>
            <p className="section-intro">Scegli un impianto per leggere tutti i dettagli.</p>
          </div>

          {status !== 'ready' && (
            <p className="status-message" role="status">
              {status === 'loading' && 'Caricamento degli impianti in corso…'}
              {status === 'empty' && 'Al momento non ci sono impianti da mostrare.'}
              {status === 'error' && 'Non riusciamo a caricare gli impianti. Verifica che il backend sia avviato.'}
            </p>
          )}
          {status === 'ready' && (
            <ul className="facility-grid">
              {facilities.map((facility) => <FacilityCard key={facility.id} facility={facility} />)}
            </ul>
          )}
        </div>
      </section>

      <section className="section about-section" id="centro" aria-labelledby="about-title">
        <div className="container about-content">
          <div className="about-copy">
            <p className="eyebrow">Il centro</p>
            <h2 id="about-title">Uno spazio per ogni passione.</h2>
            <p>SportHub riunisce impianti per sport diversi in un unico centro. Inizia esplorando gli spazi disponibili e scopri le loro caratteristiche.</p>
          </div>
          <figure className="about-figure">
            <img src={centerImage} alt="Vista aerea illustrativa di un centro sportivo con campi da calcio e tennis e una palestra" width="1672" height="941" loading="lazy" decoding="async" />
            <figcaption>Vista aerea del centro sportivo</figcaption>
          </figure>
        </div>
      </section>
    </main>
  );
}
