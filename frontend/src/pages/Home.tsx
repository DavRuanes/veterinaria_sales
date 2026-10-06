import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, HeartHandshake, MapPin, PiggyBank, Search, Stethoscope } from "lucide-react";
import { usePosts, useServices } from "../lib/api";
import { LOGO, photo, PHOTOS, SITE } from "../lib/site";
import { Icon } from "../components/Icon";
import { ButtonLink, ErrorBox, Eyebrow, Loading, SectionHeading, Wave } from "../components/ui";
import { AppPromo, BlogCard, FeaturedFaqs, Newsletter, Stats, Testimonials } from "../components/sections";

const SLIDES = [
  {
    image: PHOTOS.dogsRunning,
    eyebrow: "La seguridad social de tu mascota",
    title: (
      <>
        Tu clínica veterinaria <span className="text-aqua-300">sin carencias, sin copagos y sin límites</span>
      </>
    ),
    text: `Consultas ilimitadas, vacunas, desparasitaciones y mucho más por solo ${SITE.priceMonthly} € al mes.`,
  },
  {
    image: PHOTOS.vetCat,
    eyebrow: "Más de 150 veterinarios",
    title: (
      <>
        Un equipo experto <span className="text-aqua-300">para cada necesidad</span>
      </>
    ),
    text: "Especialistas en cardiología, dermatología, traumatología, exóticos y mucho más.",
  },
  {
    image: PHOTOS.catDog,
    eyebrow: "Urgencias 24h",
    title: (
      <>
        Cuidamos de ellos <span className="text-aqua-300">los 365 días del año</span>
      </>
    ),
    text: "Atención presencial y telefónica 24 horas con equipo quirúrgico disponible.",
  },
];

function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 7000);
    return () => clearInterval(id);
  }, [index]);

  return (
    <section className="relative overflow-hidden bg-ink-900" aria-roledescription="carrusel" aria-label="Destacados">
      {SLIDES.map((s, i) => (
        <img
          key={s.image}
          src={photo(s.image, 1800)}
          alt=""
          className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${i === index ? "opacity-45" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-transparent" />
      <div className="container-page relative grid min-h-[560px] items-center gap-10 py-20 lg:grid-cols-[1.3fr_1fr]">
        <div key={index} className="animate-fade-up">
          <Eyebrow light>{SLIDES[index].eyebrow}</Eyebrow>
          <h1 className="text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-6xl">{SLIDES[index].title}</h1>
          <p className="mt-6 max-w-xl text-lg text-ink-200">{SLIDES[index].text}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink to="/hazte-socio" size="lg">
              Hazte socio
            </ButtonLink>
            <ButtonLink to="/pide-cita" variant="light" size="lg">
              Pide cita
            </ButtonLink>
          </div>
        </div>
        <div className="hidden justify-center lg:flex">
          <div className="relative">
            <div className="absolute inset-0 scale-110 rounded-full bg-aqua-200/20 blur-2xl" aria-hidden />
            <img src={LOGO} alt="Logotipo de Veterinarias Sales" className="relative w-80 rounded-full bg-white p-3 shadow-lift" />
            <div className="absolute -bottom-2 -left-6 rounded-2xl bg-white px-5 py-3 shadow-lift">
              <p className="text-xs font-bold text-ink-500 uppercase">Desde</p>
              <p className="font-display text-3xl font-bold text-brand-700">
                {SITE.priceMonthly}€<span className="text-base text-ink-500">/mes</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-aqua-300" : "w-2.5 bg-white/50 hover:bg-white"}`}
            aria-label={`Ver destacado ${i + 1}`}
            aria-current={i === index}
          />
        ))}
      </div>
      <Wave className="text-white" />
    </section>
  );
}

function ValueProps() {
  const items = [
    {
      Icon: PiggyBank,
      title: `Cuota mensual por solo ${SITE.priceMonthly} €`,
      text: "Accede a todos los servicios esenciales con un pago fijo cada mes. Sin sorpresas en la factura.",
    },
    {
      Icon: Stethoscope,
      title: "Servicios incluidos",
      text: "Consultas ilimitadas, vacunas, desparasitaciones, microchip y mucho más, desde el primer día.",
    },
    {
      Icon: BadgeCheck,
      title: "Ventajas exclusivas",
      text: "Especialistas, descuentos en tienda y peluquería y una red de clínicas en toda España.",
    },
  ];
  return (
    <section className="relative z-10 container-page -mt-4 pb-8">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map(({ Icon: I, title, text }) => (
          <div key={title} className="rounded-3xl border border-ink-100 bg-white p-8 shadow-card">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
              <I className="size-7" aria-hidden />
            </span>
            <h3 className="mt-5 text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-ink-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesGrid() {
  const { data, isLoading, error } = useServices();
  return (
    <section className="py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Tus servicios incluidos"
          title="Todo lo que tu mascota necesita, en un solo lugar"
          intro="Última tecnología, equipamiento de última generación y un equipo multidisciplinar con un enfoque personalizado en cada caso."
        />
        {isLoading && <Loading />}
        {error && <ErrorBox error={error} />}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {data?.slice(0, 12).map((s) => (
            <Link
              key={s.slug}
              to={`/servicios-de-las-clinicas#${s.slug}`}
              className="group flex flex-col items-center rounded-3xl border border-ink-100 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-card"
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon name={s.icon} className="size-7" />
              </span>
              <span className="mt-4 font-bold text-ink-900">{s.title}</span>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <ButtonLink to="/servicios-de-las-clinicas" variant="outline">
            Ver todos los servicios <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const blocks = [
    {
      title: "Cercanía que se nota",
      text: "Clínicas propias, un equipo cercano que conoce a tu mascota por su nombre y tecnología moderna en cada consulta.",
    },
    {
      title: "Sin sorpresas",
      text: "Una cuota fija y transparente. Sin letra pequeña, sin cargos ocultos y sin facturas imprevisibles.",
    },
    {
      title: "Más que una clínica",
      text: "Atención personalizada, campañas preventivas y seguimiento continuo de la salud de tu mascota.",
    },
  ];
  return (
    <section className="bg-ink-50 py-20">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <img src={photo(PHOTOS.vetCat, 1000)} alt="Veterinaria atendiendo a un gato en consulta" className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-lift sm:aspect-[4/3] lg:aspect-[4/5]" />
          <div className="absolute -right-4 -bottom-6 flex items-center gap-3 rounded-2xl bg-ink-900 px-6 py-4 text-white shadow-lift sm:right-8">
            <HeartHandshake className="size-9 text-aqua-300" aria-hidden />
            <p className="leading-tight">
              <strong className="block font-display text-2xl">+85.000</strong>
              <span className="text-sm text-ink-300">familias confían en nosotros</span>
            </p>
          </div>
        </div>
        <div>
          <Eyebrow>Por qué elegirnos</Eyebrow>
          <h2 className="text-3xl font-bold sm:text-4xl">¿Por qué elegir Veterinarias Sales?</h2>
          <div className="mt-10 space-y-8">
            {blocks.map((b, i) => (
              <div key={b.title} className="flex gap-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 font-display text-xl font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{b.title}</h3>
                  <p className="mt-1 text-ink-600">{b.text}</p>
                </div>
              </div>
            ))}
          </div>
          <ButtonLink to="/que-es-veterinarias-sales" className="mt-10">
            Descubre cómo funciona
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function ClinicFinder() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/tus-clinicas${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  return (
    <section className="py-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-800 p-8 sm:p-14">
          <div className="bg-paws absolute inset-0" />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow light>Tus clínicas</Eyebrow>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Encuentra tu clínica más cercana</h2>
              <p className="mt-4 text-lg text-brand-100">Busca por ciudad, código postal o provincia y consulta dirección, horarios y servicios.</p>
            </div>
            <form onSubmit={submit} className="flex flex-col gap-3 rounded-3xl bg-white p-3 shadow-lift sm:flex-row">
              <label className="flex flex-1 items-center gap-3 px-3">
                <MapPin className="size-5 text-brand-600" aria-hidden />
                <span className="sr-only">Ciudad, código postal o provincia</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ciudad, código postal o provincia"
                  className="w-full py-3 text-ink-900 placeholder:text-ink-500 focus:outline-none"
                />
              </label>
              <button type="submit" className="flex items-center justify-center gap-2 rounded-2xl bg-ink-900 px-6 py-3 font-extrabold text-white uppercase hover:bg-ink-800">
                <Search className="size-5" aria-hidden /> Buscar
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function LatestPosts() {
  const { data, isLoading, error } = usePosts(3);
  return (
    <section className="bg-ink-50 py-20">
      <div className="container-page">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Blog</Eyebrow>
            <h2 className="text-3xl font-bold sm:text-4xl">Consejos y noticias</h2>
          </div>
          <ButtonLink to="/blog" variant="outline" size="sm">
            Ver todos los artículos
          </ButtonLink>
        </div>
        {isLoading && <Loading />}
        {error && <ErrorBox error={error} />}
        <div className="grid gap-6 md:grid-cols-3">{data?.map((p) => <BlogCard key={p.id} post={p} />)}</div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSlider />
      <ValueProps />
      <ServicesGrid />
      <Stats />
      <WhyUs />
      <ClinicFinder />
      <Testimonials />
      <AppPromo />
      <LatestPosts />
      <FeaturedFaqs />
      <Newsletter />
    </>
  );
}
