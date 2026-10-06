import { Link, useParams } from "react-router-dom";
import { LOGO, SITE } from "../lib/site";
import { PageHero } from "../components/ui";

const PAGES: Record<string, { title: string; body: string[] }> = {
  condiciones: {
    title: "Condiciones del servicio",
    body: [
      `La cuota de socio de ${SITE.name} da acceso a los servicios incluidos en cualquiera de las clínicas de la red, sin periodo de carencia ni copagos.`,
      "La suscripción no tiene permanencia y puede cancelarse en cualquier momento. La baja será efectiva al final del periodo ya abonado.",
      "Los servicios no incluidos en la cuota (especialidades, cirugías, pruebas avanzadas, etc.) se facturan con precios exclusivos para socios.",
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    body: [
      `${SITE.name} trata los datos personales que nos facilitas para gestionar tu alta como socio, tus citas y tus consultas.`,
      "No cedemos tus datos a terceros salvo obligación legal. Solo te enviaremos comunicaciones comerciales si nos das tu consentimiento expreso.",
      `Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición y portabilidad escribiendo a ${SITE.email}.`,
    ],
  },
  cookies: {
    title: "Política de cookies",
    body: [
      "Este sitio utiliza únicamente cookies técnicas necesarias para su funcionamiento.",
      "El mapa de clínicas carga teselas de OpenStreetMap, que puede registrar tu dirección IP conforme a su propia política de privacidad.",
    ],
  },
  "aviso-legal": {
    title: "Aviso legal",
    body: [
      `Este sitio web es propiedad de ${SITE.name}. Todos los contenidos, marcas y logotipos están protegidos por la normativa de propiedad intelectual.`,
      "La información publicada tiene carácter divulgativo y no sustituye la consulta con un veterinario.",
    ],
  },
};

export default function Legal() {
  const { page = "" } = useParams();
  const content = PAGES[page];

  if (!content) return <NotFound />;

  return (
    <>
      <PageHero eyebrow="Legal" title={content.title} />
      <section className="container-page max-w-3xl py-14">
        <div className="prose-vet">
          {content.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <p className="mt-10 text-sm text-ink-500">Última actualización: {new Date().getFullYear()}</p>
      </section>
    </>
  );
}

export function NotFound() {
  return (
    <section className="container-page flex flex-col items-center py-24 text-center">
      <img src={LOGO} alt="" className="size-40 rounded-full opacity-90" />
      <h1 className="mt-8 text-5xl font-bold">404</h1>
      <p className="mt-3 text-lg text-ink-600">Vaya, esta página se ha escapado a dar un paseo.</p>
      <Link to="/" className="mt-8 rounded-full bg-brand-600 px-6 py-3 font-extrabold text-white uppercase hover:bg-brand-700">
        Volver al inicio
      </Link>
    </section>
  );
}
