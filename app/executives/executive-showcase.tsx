import Link from "next/link";
import { executives, getExecutiveOfficeLabel } from "./data";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function ExecutiveShowcase({ people = executives }: { people?: typeof executives }) {
  return (
    <div className="homepage-executive-hierarchy" aria-label="NIPSA executive leadership hierarchy">
      {people.map((person) => (
        <article className="homepage-executive-level" key={person.slug}>
          <div className="homepage-executive-profile">
            <Link
              className="homepage-executive-identity"
              href={`/executives/${person.slug}`}
              aria-label={`View profile for ${person.name}`}
            >
              {person.image ? (
                <span className={`homepage-executive-portrait ${person.tone}`}>
                  <img
                    src={person.image}
                    alt={`Portrait of ${person.name}, ${getExecutiveOfficeLabel(person.role)}, NIPSA-UNILESA`}
                  />
                </span>
              ) : (
                <span className={`homepage-executive-portrait homepage-executive-placeholder ${person.tone}`}>
                  <span aria-hidden="true">{person.initials}</span>
                  <small>Profile placeholder</small>
                </span>
              )}
              <span className="homepage-executive-name">{person.name}</span>
              <span className="homepage-executive-role">{getExecutiveOfficeLabel(person.role)}</span>
              <span className="homepage-executive-organization">NIPSA-UNILESA</span>
              <span className="homepage-executive-description">{person.intro}</span>
            </Link>
            <dl className="homepage-executive-meta">
              <div>
                <dt>Official email</dt>
                <dd><a href={`mailto:${person.email}`}>{person.email}</a></dd>
              </div>
              <div>
                <dt>Assumed office date</dt>
                <dd>{person.assumedOffice}</dd>
              </div>
              <div>
                <dt>Tenure</dt>
                <dd>{person.tenure}</dd>
              </div>
            </dl>
            <Link
              className="button primary homepage-executive-contact"
              href={`/executives/${person.slug}`}
              aria-label={`Contact the office about ${person.name}`}
            >
              Contact Office <Arrow />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
