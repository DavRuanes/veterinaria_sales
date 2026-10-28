export const SITE = {
  name: "Veterinarias Sales",
  priceMonthly: "29,99",
  priceYearly: "319,99",
  phone: "605543907",
  phoneHours: "Martes a sábado de 9:00 a 18:00",
  emergencyPhone: "605543907",
  whatsapp: "34605543907",
  email: "sales.veterinarias@gmail.com",
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
    linkedin: "https://linkedin.com/",
  },
  maps: "https://www.google.com/maps/place/Tectum+Ca%C3%B1averal+I/@40.4076025,-3.5647398,17z/data=!3m1!4b1!4m6!3m5!1s0xd423b0018bb7c01:0x355231691a55ba34!8m2!3d40.4075984!4d-3.5621595!16s%2Fg%2F11zfsk6zn7",
};

/** Lo que se ahorra con el pago anual frente a 12 mensualidades, p. ej. "39,89". */
const euros = (price: string) => Number(price.replace(",", "."));
export const YEARLY_SAVING = (euros(SITE.priceMonthly) * 12 - euros(SITE.priceYearly)).toFixed(2).replace(".", ",");

export const SPECIES_LABEL: Record<string, string> = {
  perro: "Perro",
  gato: "Gato",
  exotico: "Exótico",
};

/** Fotos propias en frontend/public/fotos, respetando la base de despliegue. */
export function photo(file: string) {
  return `${import.meta.env.BASE_URL}fotos/${file}`;
}

/** Punto de cada foto que debe verse siempre cuando se recorta (object-position). */
const FOCUS: Record<string, string> = {
  "cachorro.jpg": "50% 12%",
  "perra-peluche.jpg": "50% 45%",
  "perro-manta.jpg": "50% 30%",
  "cotorra.jpg": "60% 12%",
  "perro-blanco.jpg": "50% 38%",
};

export function focus(src: string) {
  return { objectPosition: FOCUS[src.split("/").pop() ?? ""] ?? "50% 50%" };
}

export const PHOTOS = {
  puppy: "cachorro.jpg",
  dogPlush: "perra-peluche.jpg",
  dogBlanket: "perro-manta.jpg",
  macaw: "guacamayo.jpg",
  cat: "gata.jpg",
  parakeet: "cotorra.jpg",
  whiteDog: "perro-blanco.jpg",
};

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

/** Ruta del logo respetando la base de despliegue (p. ej. /repo/ en GitHub Pages). */
export const LOGO = `${import.meta.env.BASE_URL}logo.png`;
