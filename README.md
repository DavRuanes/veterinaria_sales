# Veterinarias Sales

Web para una red de clínicas veterinarias que funciona con una cuota mensual de socio: pagas una cantidad fija y tienes consultas, vacunas, desparasitaciones y otros servicios básicos incluidos, sin copagos ni periodos de carencia.

**Demo:** https://davruanes.github.io/veterinaria_sales/

La idea surgió de analizar cómo funcionan las cadenas de clínicas veterinarias por suscripción que ya existen en España. Quería reproducir ese tipo de web de principio a fin: no solo la parte visual, sino también lo que hay detrás (reservar una cita en un hueco libre de verdad, dar de alta a un socio, buscar la clínica más cercana) con un backend y una base de datos reales.

> Los nombres de las clínicas, direcciones, teléfonos y opiniones son inventados. Las fotos son de Unsplash y los mapas de OpenStreetMap.

---

## Qué se puede hacer en la web

- **Consultar la información**: qué incluye la cuota, los 16 servicios de las clínicas, las 11 especialidades, la medicina preventiva por tipo de animal, el blog y las preguntas frecuentes.
- **Buscar una clínica**: por ciudad, código postal o provincia, filtrando por comunidad autónoma o pidiendo las más cercanas a tu ubicación. Todas aparecen en un mapa.
- **Pedir cita**: eliges clínica, servicio, día y hora entre los huecos que quedan libres, y rellenas los datos de la mascota.
- **Hacerse socio**: eliges plan mensual o anual, rellenas los datos del titular y añades una o varias mascotas.
- **Contactar** o **suscribirse a la newsletter**.
- **Gestionar todo desde un panel de administración**: ver las citas y cambiar su estado (pendiente, confirmada, completada o cancelada), y consultar socios, mensajes y suscriptores.

---

## Tecnologías y por qué las elegí

### Frontend

| Tecnología | Para qué la uso |
|---|---|
| **React 19 + TypeScript** | React para construir la interfaz por componentes. TypeScript porque en un proyecto con formularios y una API es muy fácil equivocarse con la forma de los datos, y así el editor me avisa antes de que el error llegue al navegador. Los tipos de [frontend/src/lib/api.ts](frontend/src/lib/api.ts) reflejan exactamente lo que devuelve el backend. |
| **Vite** | Compila TypeScript y JSX y sirve la web en desarrollo. Arranca en un segundo y recarga los cambios al instante. Create React App está abandonado, así que no tenía sentido usarlo. |
| **Tailwind CSS 4** | Estilos escritos directamente en los componentes. Los colores salen del logo y están definidos como variables en [frontend/src/index.css](frontend/src/index.css): gris pizarra (`ink`), azul petróleo (`brand`) y aguamarina (`aqua`). Si mañana cambia la marca, se cambian ahí y se actualiza toda la web. |
| **React Router** | Navegación entre páginas sin recargar. Cada sección tiene su propia URL (`/tus-clinicas`, `/pide-cita`...), así que se puede compartir un enlace directo. |
| **TanStack Query** | Gestiona las peticiones a la API: estados de carga, errores y caché. Si vas de la portada a la página de servicios, no vuelve a pedir los servicios porque ya los tiene. |
| **Leaflet + OpenStreetMap** | El mapa de clínicas. Lo elegí frente a Google Maps porque no necesita clave de API ni tarjeta de crédito. Además se carga solo cuando entras en la página de clínicas, para que no pese en el resto. |
| **lucide-react** | Iconos. Los iconos de redes sociales y tiendas de apps son SVG propios porque lucide ya no incluye logotipos de marcas. |

### Backend

| Tecnología | Para qué la uso |
|---|---|
| **Python + FastAPI** | La API. Dudé entre FastAPI y Spring Boot. Para una API de este tamaño, FastAPI requiere mucho menos código y genera sola la documentación interactiva en `/docs`, que viene muy bien para probar los endpoints sin montar nada más. |
| **Pydantic** | Valida todo lo que llega a la API: formato del email, del teléfono y del DNI/NIE, código postal de 5 dígitos, que se acepten los términos... Si algo no cumple, la API responde con un error 422 antes de tocar la base de datos. |
| **SQLAlchemy 2** | ORM para trabajar con la base de datos usando clases de Python en lugar de escribir SQL a mano. Los modelos están en [backend/app/models.py](backend/app/models.py). |
| **PostgreSQL** | Base de datos. Es la opción más habitual en producción y permite cosas que uso aquí, como columnas JSON (las mascotas de un socio) y restricciones de unicidad. |
| **Docker Compose** | Levanta PostgreSQL y la API con un solo comando, sin instalar Python ni Postgres en el ordenador. Lo hice así precisamente porque no tenía Python instalado y no quería depender de cómo esté configurada cada máquina. |

---

## Estructura del proyecto

```
veterinaria_sales/
├── backend/
│   ├── app/
│   │   ├── main.py          # Arranque de la API, CORS y registro de rutas
│   │   ├── config.py        # Configuración leída de variables de entorno
│   │   ├── database.py      # Conexión a PostgreSQL
│   │   ├── models.py        # Tablas de la base de datos
│   │   ├── schemas.py       # Validación de datos de entrada y salida
│   │   ├── scheduling.py    # Lógica de horarios y huecos libres
│   │   ├── seed.py          # Contenido inicial (servicios, clínicas, blog...)
│   │   └── routers/
│   │       ├── content.py   # Endpoints de lectura (clínicas, servicios, blog...)
│   │       ├── forms.py     # Citas, altas de socio, contacto y newsletter
│   │       └── admin.py     # Endpoints del panel de administración
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── public/logo.png
│   └── src/
│       ├── lib/             # Cliente de la API, tipos y datos del sitio
│       ├── components/      # Cabecera, pie, mapa y secciones reutilizables
│       ├── pages/           # Una página por ruta
│       └── demo/            # Datos y API simulada para GitHub Pages
├── scripts/export-demo-data.mjs
├── .github/workflows/deploy.yml
└── docker-compose.yml
```

---

## Cómo funciona cada parte

### El contenido

Servicios, especialidades, clínicas, artículos del blog, opiniones y preguntas frecuentes se guardan en la base de datos. La primera vez que arranca, la API crea las tablas y las rellena con el contenido de [backend/app/seed.py](backend/app/seed.py). Solo lo hace si la tabla está vacía, así que reiniciar la API no duplica nada.

Podría haber puesto todo ese texto directamente en el frontend, pero tenerlo en la base de datos tiene sentido: el día de mañana se podría editar desde un panel sin tocar código ni volver a desplegar la web.

### Buscador de clínicas

El texto que escribes se envía a la API, que busca coincidencias en el nombre, la ciudad, la dirección y la comunidad. Para el código postal busca los que *empiezan* por lo que escribes, de modo que `280` devuelve todas las clínicas de Madrid capital. El filtro por comunidad se guarda en la URL (`/tus-clinicas?region=Madrid`), así el menú de la cabecera puede enlazar directamente a cada comunidad.

El botón **"Cerca de mí"** pide la ubicación al navegador y calcula en el propio navegador la distancia a cada clínica con la fórmula de Haversine (distancia sobre una esfera, que para estas distancias es suficientemente precisa). Lo hago en el cliente porque solo hay unas pocas clínicas y así la ubicación del usuario nunca sale de su navegador.

### Sistema de citas

Es la parte con más lógica, y está en [backend/app/scheduling.py](backend/app/scheduling.py) y [backend/app/routers/forms.py](backend/app/routers/forms.py).

- Las clínicas atienden de **martes a sábado, de 10:00 a 21:00**, con citas cada 30 minutos (la última a las 20:30).
- Cuando eliges un día, el frontend pide a la API los huecos libres de esa clínica. La API parte de todos los huecos del día y quita los que ya tienen una cita no cancelada, los que ya han pasado si es el día de hoy y todos si el día está cerrado o queda a más de 60 días.
- Los horarios se calculan con la zona horaria de Madrid, para que no dependan de en qué servidor se ejecute la API.

El problema típico de un sistema de reservas es que dos personas intenten coger la misma hora a la vez. Lo resuelvo con dos capas:

1. Antes de guardar, la API vuelve a comprobar que el hueco sigue libre, porque el usuario pudo tardar cinco minutos en rellenar el formulario.
2. La tabla de citas tiene una restricción única sobre `(clínica, fecha, hora)`. Si dos peticiones pasan la comprobación en el mismo instante, PostgreSQL solo deja guardar una, y la otra recibe un error 409 con el mensaje *"Ese horario ya no está disponible"*.

Esa restricción plantea un detalle: una cita cancelada sigue ocupando su fila. Para que esa hora pueda volver a reservarse, al crear una cita nueva sobre un hueco cancelado se elimina primero la cita cancelada.

### Alta de socio

El formulario va en tres pasos (plan y clínica, datos del titular, mascotas) para que no se haga pesado. Los datos se validan dos veces:

- **En el navegador**, con los atributos de HTML (`required`, `pattern`, `type="email"`), para avisar al momento sin esperar al servidor.
- **En la API**, con Pydantic, porque la validación del navegador se puede saltar fácilmente. La del servidor es la que cuenta.

El DNI/NIE se comprueba con una expresión regular (8 números y una letra, o X/Y/Z seguida de 7 números y una letra) y se guarda siempre en mayúsculas. El email es único: si ya existe un socio con ese correo, la API responde con un error 409 en lugar de crear un duplicado. Las mascotas se guardan como una lista en una columna JSON, porque siempre se consultan junto al socio y no necesitaba una tabla aparte.

### Contacto y newsletter

El formulario de contacto guarda el mensaje para verlo después en el panel. La suscripción a la newsletter no da error si el email ya estaba suscrito: responde lo mismo que si fuera nuevo. Así nadie puede usar el formulario para averiguar si un correo está en la lista.

### Panel de administración

En `/admin` se accede con un token. El frontend lo envía en la cabecera `X-Admin-Token` y la API lo compara con `secrets.compare_digest`, que tarda lo mismo acierte o falle, para no dar pistas a alguien que intente adivinarlo. El token se define con la variable de entorno `ADMIN_TOKEN` (por defecto `cambia-este-token`).

Para una demo es suficiente, pero un panel real debería tener usuarios con contraseña e inicio de sesión. Lo dejo apuntado en las mejoras pendientes.

### Modo demo para GitHub Pages

GitHub Pages solo sirve archivos estáticos: no puede ejecutar Python ni tener una base de datos. Para poder enseñar la web sin pagar un servidor, el frontend tiene un **modo demo** que se activa al compilar con `VITE_DEMO=true`:

- El contenido sale de [frontend/src/demo/data.json](frontend/src/demo/data.json), que es una copia exacta de lo que devuelve la API.
- Las peticiones no salen a internet: las responde [frontend/src/demo/mockApi.ts](frontend/src/demo/mockApi.ts), que aplica las mismas reglas que el backend (horario, huecos ocupados, socios duplicados, validaciones, token de admin).
- Lo que envía cada visitante se guarda en el `localStorage` de su navegador. Si reservas una cita, esa hora desaparece de la disponibilidad y la ves en el panel `/admin` (en la demo, el token es `demo`).

El resto del código no sabe si está en modo demo o no: todas las peticiones pasan por la función `api()` de [frontend/src/lib/api.ts](frontend/src/lib/api.ts), que decide a quién preguntar. Así la demo y la versión real comparten el 100 % de la interfaz.

---

## API

Con la API en marcha, la documentación interactiva está en **http://localhost:8010/docs**. Estos son los endpoints:

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/clinics?region=&q=` | Lista de clínicas, con filtro por comunidad y búsqueda |
| GET | `/api/clinics/{slug}` | Una clínica |
| GET | `/api/clinics/{id}/availability?date=` | Huecos libres de una clínica en un día |
| GET | `/api/services` | Servicios de las clínicas |
| GET | `/api/specialties` | Especialidades |
| GET | `/api/blog`, `/api/blog/{slug}` | Artículos del blog |
| GET | `/api/testimonials` | Opiniones |
| GET | `/api/faqs?featured=` | Preguntas frecuentes |
| POST | `/api/appointments` | Reservar una cita |
| POST | `/api/members` | Alta de socio |
| POST | `/api/contact` | Mensaje de contacto |
| POST | `/api/newsletter` | Suscripción a la newsletter |
| GET | `/api/admin/stats`, `/appointments`, `/members`, `/messages`, `/subscribers` | Datos del panel (requiere token) |
| PATCH | `/api/admin/appointments/{id}` | Cambiar el estado de una cita (requiere token) |

---

## Ejecutarlo en local

Hace falta **Docker Desktop** y **Node.js** (versión 20 o superior).

```bash
# 1. Base de datos y API
docker compose up -d --build

# 2. La web
cd frontend
npm install
npm run dev
```

| Qué | Dónde |
|---|---|
| Web | http://localhost:5190 |
| API | http://localhost:8010/api |
| Documentación de la API | http://localhost:8010/docs |
| PostgreSQL | `localhost:5440` (usuario, contraseña y base de datos: `vetsales`) |

Usé puertos poco habituales (5190, 8010, 5440) para que no choquen con otros proyectos que suelen ocupar el 5173, el 8000 o el 5432. Vite redirige las peticiones de `/api` a la API, así que en desarrollo no hay problemas de CORS.

Otros comandos útiles:

```bash
docker compose down             # Parar la API y la base de datos (los datos se conservan)
docker compose down -v          # Parar y borrar la base de datos (al arrancar se vuelve a rellenar)
docker compose logs -f api      # Ver los logs de la API
```

Para cambiar el token del panel, crea un archivo `.env` en la raíz con `ADMIN_TOKEN=tu-token` y vuelve a ejecutar `docker compose up -d`.

---

## Despliegue en GitHub Pages

El despliegue es automático. Cada vez que se sube un cambio a la rama `main`, el workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) hace lo siguiente:

1. Instala las dependencias del frontend con `npm ci`, que respeta las versiones exactas del `package-lock.json`.
2. Compila la web en modo demo con dos variables:
   - `VITE_DEMO=true` para usar la API simulada.
   - `VITE_BASE=/veterinaria_sales/`, porque en GitHub Pages la web no está en la raíz del dominio sino en una subcarpeta con el nombre del repositorio. Vite usa esa ruta para los archivos y React Router para la navegación. El workflow toma el nombre del repositorio automáticamente.
3. Copia `index.html` como `404.html`. GitHub Pages no sabe que `/tus-clinicas` es una ruta de React, y si entras directamente a esa URL o recargas la página devolvería un 404. Con este truco, GitHub sirve la propia aplicación y React Router muestra la página correcta.
4. Publica la carpeta `dist` en GitHub Pages.

Para configurarlo la primera vez:

1. Subir el repositorio a GitHub (tiene que ser público para usar Pages gratis).
2. En **Settings → Pages → Build and deployment → Source**, elegir **GitHub Actions**.
3. Ir a la pestaña **Actions** y esperar a que el workflow termine en verde. Si se subió el código antes de activar Pages, el primer intento falla: basta con pulsar **Re-run all jobs**.

Si se cambia el contenido en `seed.py`, hay que actualizar también los datos de la demo con la API en marcha:

```bash
node scripts/export-demo-data.mjs
```

### ¿Y para producción?

La demo está pensada para enseñar el proyecto. Para usarla de verdad con el backend, lo más sencillo sería un VPS con Docker: levantar el mismo `docker-compose.yml`, servir el frontend compilado (`npm run build`, sin `VITE_DEMO`) con Nginx, y redirigir `/api` hacia la API. Otra opción es separar las piezas: el frontend en un hosting estático y la API y la base de datos en servicios como Render y Neon.

---

## Personalizar

| Qué | Dónde |
|---|---|
| Teléfonos, WhatsApp, email, precios y redes sociales | [frontend/src/lib/site.ts](frontend/src/lib/site.ts) |
| Colores y tipografías | [frontend/src/index.css](frontend/src/index.css), bloque `@theme` |
| Horario y duración de las citas | [backend/app/scheduling.py](backend/app/scheduling.py) |
| Servicios, clínicas, blog, opiniones y FAQs | [backend/app/seed.py](backend/app/seed.py) |
| Logo | [frontend/public/logo.png](frontend/public/logo.png) |

---

## Limitaciones y lo que haría después

Hay cosas que conscientemente dejé fuera, y prefiero dejarlas claras:

- **No se envían emails.** Las pantallas de confirmación dicen que se ha enviado un correo, pero falta conectar un servicio de envío (por ejemplo, SMTP o Resend).
- **El panel de admin usa un token compartido**, no usuarios con contraseña. Para producción haría un login con JWT o sesiones.
- **No hay migraciones de base de datos.** Las tablas se crean al arrancar, lo cual funciona mientras el esquema no cambie. Si el proyecto creciera, añadiría Alembic.
- **No hay tests automáticos.** Las reglas de reservas (huecos, duplicados, cancelaciones) las he probado a mano contra la API, pero merecen tests con pytest.
- **El horario es igual para todas las clínicas.** En una red real cada clínica tendría el suyo, y habría que guardarlo en la base de datos.
- **El pago de la cuota no está implementado.** El alta registra al socio, pero no cobra. Habría que integrar una pasarela como Stripe o Redsys.
