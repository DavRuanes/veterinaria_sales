import { Bird, Cat, Dog } from "lucide-react";
import { photo, PHOTOS } from "../lib/site";
import { ButtonLink, Eyebrow, PageHero } from "../components/ui";
import { CtaBand, IncludedList } from "../components/sections";

const INCLUDED = [
  "Seguimiento veterinario personalizado",
  "Revisiones completas de salud",
  "Pruebas diagnósticas y de laboratorio",
  "Vacunas y desparasitaciones según especie y edad",
  "Consejos adaptados a cada fase de su vida",
  "Detección precoz de enfermedades",
];

const PROGRAMS = [
  {
    Icon: Dog,
    title: "Medicina canina",
    image: PHOTOS.beagle,
    text: "Planes preventivos adaptados a la raza, el tamaño y el estilo de vida de tu perro, desde cachorro hasta senior.",
  },
  {
    Icon: Cat,
    title: "Medicina felina",
    image: PHOTOS.kittenPaw,
    text: "Instalaciones adaptadas a los gatos, con iluminación suave y espacios separados para reducir su estrés.",
  },
  {
    Icon: Bird,
    title: "Animales exóticos",
    image: PHOTOS.rabbit,
    text: "Microchip, cuidado dental, cirugía y hospitalización para reptiles, aves y pequeños mamíferos.",
  },
];

export default function Preventive() {
  return (
    <>
      <PageHero
        eyebrow="Medicina general y preventiva"
        title="Nos anticipamos para cuidar mejor"
        intro="La prevención es la base de una vida larga y sana. Por eso la medicina preventiva está incluida en tu cuota de socio."
        image={photo(PHOTOS.frenchie, 1800)}
      >
        <ButtonLink to="/pide-cita" size="lg">
          Pide cita
        </ButtonLink>
        <ButtonLink to="/hazte-socio" variant="light" size="lg">
          Hazte socio ahora
        </ButtonLink>
      </PageHero>

      <section className="container-page grid items-center gap-12 py-20 lg:grid-cols-2">
        <div>
          <Eyebrow>Incluido en tu cuota</Eyebrow>
          <h2 className="text-3xl font-bold sm:text-4xl">Prevención de principio a fin</h2>
          <p className="mt-4 mb-8 text-lg text-ink-600">
            Te acompañamos en cada etapa de la vida de tu mascota con revisiones periódicas y recordatorios para que no
            se te pase nada.
          </p>
          <IncludedList items={INCLUDED} />
        </div>
        <img src={photo(PHOTOS.puppy, 1000)} alt="Cachorro de golden retriever corriendo" className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift" />
      </section>

      <section className="bg-ink-50 py-20">
        <div className="container-page grid gap-6 md:grid-cols-3">
          {PROGRAMS.map(({ Icon, title, image, text }) => (
            <article key={title} className="overflow-hidden rounded-3xl bg-white shadow-card">
              <img src={photo(image, 700)} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />
              <div className="p-7">
                <span className="-mt-14 mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lift">
                  <Icon className="size-7" aria-hidden />
                </span>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-ink-600">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
