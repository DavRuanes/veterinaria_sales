export const SITE = {
  name: "Veterinarias Sales",
  priceMonthly: "29,99",
  priceYearly: "319,99",
  phone: "605543907",
  phoneHours: "Martes a sábado de 9:00 a 18:00",
  emergencyPhone: "605543907",
  whatsapp: "34605543907",
  email: "sales.vet@gmail.com",
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
    linkedin: "https://linkedin.com/",
  },
  maps: "https://www.google.com/maps/place/Tectum+Ca%C3%B1averal+I/@40.4076025,-3.5647398,17z/data=!3m1!4b1!4m6!3m5!1s0xd423b0018bb7c01:0x355231691a55ba34!8m2!3d40.4075984!4d-3.5621595!16s%2Fg%2F11zfsk6zn7",
};

export const SPECIES_LABEL: Record<string, string> = {
  perro: "Perro",
  gato: "Gato",
  exotico: "Exótico",
};

export function photo(id: string, w = 1200) {
  return `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;
}

export const PHOTOS = {
  dogsRunning: "photo-1548199973-03cce0bbc87b",
  vetCat: "photo-1628009368231-7bb7cfcb0def",
  puppy: "photo-1576201836106-db1758fd1c97",
  frenchie: "photo-1583337130417-3346a1be7dee",
  beagle: "photo-1543466835-00a7907e9de1",
  kittenPaw: "photo-1592194996308-7b43878e84a6",
  catDog: "photo-1450778869180-41d0601e046e",
  dogBeach: "photo-1530281700549-e82e7bf110d6",
  catPortrait: "photo-1514888286974-6c03e2ca1dba",
  samoyed: "photo-1596492784531-6e6eb5ea9993",
  rabbit: "photo-1452857297128-d9c29adba80b",
};

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

/** Ruta del logo respetando la base de despliegue (p. ej. /repo/ en GitHub Pages). */
export const LOGO = `${import.meta.env.BASE_URL}logo.png`;
