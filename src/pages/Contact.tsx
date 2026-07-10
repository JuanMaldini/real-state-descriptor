import { CONTACT, SITE } from "../config/config";

// Contacto: datos estáticos (placeholders en config). Mapa embed opcional.
export default function Contact() {
  return (
    <div className="mx-auto w-full max-w-[900px] p-4 md:p-8">
      <h1 className="u-wordmark mb-6 text-2xl md:text-3xl">Contacto</h1>

      <dl className="u-border">
        <Row term="Proyecto" desc={SITE.name} />
        <Row term="Dirección" desc={CONTACT.address} />
        <Row
          term="Teléfono"
          desc={<a href={`tel:${CONTACT.phone.replace(/\s+/g, "")}`}>{CONTACT.phone}</a>}
        />
        <Row
          term="Email"
          desc={<a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>}
          last
        />
      </dl>

      {CONTACT.mapEmbedUrl ? (
        <div className="mt-6 u-border">
          <iframe
            title="Mapa"
            src={CONTACT.mapEmbedUrl}
            className="h-[380px] w-full"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="mt-6 flex h-[220px] items-center justify-center u-border bg-[var(--muted-bg)] u-label text-[var(--muted)]">
          Mapa (pendiente)
        </div>
      )}
    </div>
  );
}

function Row({
  term,
  desc,
  last,
}: {
  term: string;
  desc: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-baseline sm:gap-6 ${
        last ? "" : "u-border-b"
      }`}
    >
      <dt className="u-label w-32 shrink-0 text-[var(--muted)]">{term}</dt>
      <dd className="text-base">{desc}</dd>
    </div>
  );
}
