# Veterinarias Sales

Web de clínicas veterinarias con modelo de cuota de socio.

- **frontend/**: React + TypeScript + Vite + Tailwind CSS
- **backend/**: FastAPI + SQLAlchemy + PostgreSQL

## Arrancar en local

Requisitos: Docker Desktop y Node.js.

```bash
# 1. Base de datos + API (desde la raíz del proyecto)
docker compose up -d --build

# 2. Web
cd frontend
npm install
npm run dev
```

| Servicio | URL |
|---|---|
| Web | http://localhost:5190 |
| API | http://localhost:8010/api |
| Documentación de la API (Swagger) | http://localhost:8010/docs |
| PostgreSQL | `localhost:5440`, usuario, contraseña y base de datos `vetsales` |

La API crea las tablas y carga el contenido inicial (servicios, especialidades, clínicas, blog, opiniones y FAQs) la primera vez que arranca. El contenido está en [backend/app/seed.py](backend/app/seed.py).

## Páginas

| Ruta | Contenido |
|---|---|
| `/` | Inicio: slider, ventajas, servicios, contadores, buscador de clínicas, opiniones, app, blog, FAQs y newsletter |
| `/que-es-veterinarias-sales` | Modelo de socio, precios y cómo funciona |
| `/servicios-de-las-clinicas` | Los 16 servicios de las clínicas |
| `/especialidades` | Las 11 especialidades |
| `/medicina-general-y-preventiva` | Medicina preventiva canina, felina y de exóticos |
| `/tus-clinicas` | Buscador, filtro por comunidad, mapa y "cerca de mí" |
| `/pide-cita` | Reserva en 3 pasos con los huecos libres reales |
| `/hazte-socio` | Alta de socio en 3 pasos |
| `/blog`, `/faqs`, `/contacto` | Blog, preguntas frecuentes y formulario de contacto |
| `/admin` | Panel con citas (cambio de estado), socios, mensajes y suscriptores |

## Panel de administración

Entra en `/admin` con el token definido en `ADMIN_TOKEN`. Por defecto es `cambia-este-token`.
Para cambiarlo, crea un archivo `.env` en la raíz con `ADMIN_TOKEN=tu-token-seguro` y ejecuta `docker compose up -d`.

## Personalizar

- Teléfonos, WhatsApp, precio y redes sociales: [frontend/src/lib/site.ts](frontend/src/lib/site.ts)
- Colores y tipografías: [frontend/src/index.css](frontend/src/index.css) (bloque `@theme`)
- Horario de citas (martes a sábado, de 10:00 a 21:00, cada 30 min): [backend/app/scheduling.py](backend/app/scheduling.py)
- Logo: [frontend/public/logo.png](frontend/public/logo.png)

## Demo en GitHub Pages

GitHub Pages solo sirve archivos estáticos, así que la demo se compila con `VITE_DEMO=true`. En ese modo la web no llama al backend:

- El contenido sale de [frontend/src/demo/data.json](frontend/src/demo/data.json), que es una copia de lo que devuelve la API.
- Los formularios usan una API simulada ([frontend/src/demo/mockApi.ts](frontend/src/demo/mockApi.ts)) con las mismas reglas que el backend y guardan los envíos en el navegador del visitante.
- El token del panel `/admin` es `demo`.

El workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) publica la demo cada vez que se sube un cambio a `main`.

Si cambias el contenido en `backend/app/seed.py`, regenera `data.json` con la API en marcha:

```bash
node -e 'const B="http://localhost:8010/api",g=p=>fetch(B+p).then(r=>r.json());(async()=>{const l=await g("/blog");require("fs").writeFileSync("frontend/src/demo/data.json",JSON.stringify({clinics:await g("/clinics"),services:await g("/services"),specialties:await g("/specialties"),posts:await Promise.all(l.map(p=>g("/blog/"+p.slug))),testimonials:await g("/testimonials"),faqs:await g("/faqs")},null,1))})()'
```

## Reiniciar la base de datos

```bash
docker compose down -v && docker compose up -d
```
