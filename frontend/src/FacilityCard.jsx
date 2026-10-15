import { Link } from 'react-router';

export default function FacilityCard({ facility }) {
  return (
    <li>
      <article className="facility-card">
        <Link className="facility-card-link" to={`/facilities/${facility.id}`}>
          <span className="facility-number">{String(facility.id).padStart(2, '0')}</span>
          <span className="tag">{facility.type}</span>
          <h3>{facility.name}</h3>
          <p>{facility.description}</p>
          <span className="card-action">Scopri l’impianto →</span>
        </Link>
      </article>
    </li>
  );
}
