"""Contenido inicial. Solo se inserta si la tabla correspondiente está vacía."""

import datetime as dt

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from . import models


def img(photo_id: str, w: int = 1200) -> str:
    return f"https://images.unsplash.com/{photo_id}?w={w}&q=80&auto=format&fit=crop"


SERVICES = [
    {
        "slug": "consultas",
        "title": "Consultas",
        "icon": "stethoscope",
        "summary": "Consultas personalizadas con los mejores profesionales y equipamiento de última tecnología.",
        "description": "En nuestras clínicas ofrecemos consultas personalizadas con los mejores profesionales "
        "especialistas y equipamiento de última tecnología, para dar a tu mascota una asistencia integral de calidad.",
        "bullets": ["Consultas ilimitadas para socios", "Revisiones completas", "Seguimiento personalizado"],
    },
    {
        "slug": "tienda",
        "title": "Tienda de alimentación y complementos",
        "icon": "shopping-bag",
        "summary": "Alimentación de alta gama, complementos y asesoramiento personalizado.",
        "description": "Disponemos de tienda con alimentación de alta gama y complementos para que encuentres "
        "todo lo que tu mascota necesita, con asesoramiento personalizado según especie, raza, edad y nivel de actividad.",
        "bullets": ["Alimentación de alta gama", "Complementos y accesorios", "Asesoramiento personalizado"],
        "bookable": False,
    },
    {
        "slug": "urgencias-24h",
        "title": "Atención 24h y urgencias",
        "icon": "siren",
        "summary": "Atención veterinaria presencial y telefónica 24 horas, 365 días al año.",
        "description": "Atención veterinaria presencial y telefónica 24 horas, los 365 días del año, con un equipo "
        "quirúrgico disponible para cualquier intervención urgente y atención constante a los pacientes hospitalizados.",
        "bullets": ["Teléfono de urgencias 24h", "Equipo quirúrgico de guardia", "Hospitalización vigilada"],
        "bookable": False,
    },
    {
        "slug": "pruebas-laboratoriales",
        "title": "Pruebas laboratoriales",
        "icon": "flask-conical",
        "summary": "Hemograma, bioquímica, microscopía y análisis con inteligencia artificial en tiempo real.",
        "description": "Contamos con laboratorio propio para obtener resultados en tiempo real y tomar decisiones "
        "rápidas sobre el diagnóstico y el tratamiento de tu mascota.",
        "bullets": ["Hemograma", "Bioquímica", "Microscopio", "Citologías y análisis fecales con IA", "Resultados en tiempo real"],
    },
    {
        "slug": "cirugias",
        "title": "Cirugías",
        "icon": "scissors",
        "summary": "Equipo multidisciplinar de cirujanos y quirófanos totalmente equipados.",
        "description": "Un grupo multidisciplinar de cirujanos generales realiza desde intervenciones menores hasta "
        "cirugías complejas en quirófanos equipados con anestesia inhalatoria, monitorización multiparamétrica y respiración asistida.",
        "bullets": ["Anestesia inhalatoria", "Monitorización multiparamétrica", "Respiración asistida"],
    },
    {
        "slug": "endoscopia",
        "title": "Endoscopia",
        "icon": "scan-search",
        "summary": "Procedimiento mínimamente invasivo para diagnóstico y extracción de cuerpos extraños.",
        "description": "La endoscopia permite tomar muestras biológicas y extraer cuerpos extraños, asegurando una "
        "recuperación rápida del paciente al ser un procedimiento mínimamente invasivo.",
        "bullets": ["Toma de muestras", "Extracción de cuerpos extraños", "Recuperación rápida"],
    },
    {
        "slug": "ecg",
        "title": "ECG",
        "icon": "heart-pulse",
        "summary": "Evaluación fiable e indolora de la actividad eléctrica del corazón.",
        "description": "El electrocardiograma es la técnica básica para evaluar la actividad eléctrica del corazón. "
        "Es una prueba fiable, indolora y sin riesgos para tu mascota.",
        "bullets": ["Prueba indolora", "Sin riesgos", "Resultados inmediatos"],
    },
    {
        "slug": "microchip",
        "title": "Identificación y microchip",
        "icon": "cpu",
        "summary": "Identificación indolora y obligatoria desde los 3 meses de edad.",
        "description": "Proceso indoloro y obligatorio por ley desde los 3 meses de edad para perros, gatos y hurones. "
        "Permite identificar al animal y asociarlo a los datos de contacto de su tutor.",
        "bullets": ["Perros, gatos y hurones", "Registro oficial", "Pasaporte europeo"],
    },
    {
        "slug": "radiologia",
        "title": "Radiología",
        "icon": "bone",
        "summary": "Radiología digital avanzada para diagnósticos certeros y precoces.",
        "description": "Disponemos de equipos de radiología digital avanzada que nos permiten realizar pruebas "
        "diagnósticas basadas en imagen para obtener diagnósticos certeros y precoces.",
        "bullets": ["Radiología digital", "Imagen de alta definición", "Diagnóstico precoz"],
    },
    {
        "slug": "peluqueria",
        "title": "Estética y peluquería",
        "icon": "sparkles",
        "summary": "Corte, baño, cepillado y cuidados en un entorno confortable y sin estrés.",
        "description": "Nuestro equipo de estética trabaja en un entorno confortable que reduce el estrés durante la "
        "sesión. Todos los productos que utilizamos están disponibles en nuestra tienda.",
        "bullets": ["Corte de pelo y retoques", "Baños y cepillado", "Corte de uñas", "Limpieza de oídos", "Vaciado de glándulas"],
    },
    {
        "slug": "vacunaciones",
        "title": "Vacunaciones",
        "icon": "syringe",
        "summary": "Protección frente a enfermedades con un plan vacunal personalizado.",
        "description": "Las vacunas protegen a tu mascota frente a enfermedades estimulando su sistema inmune. "
        "Te asesoramos sobre el plan vacunal más adecuado según su especie, edad y estilo de vida.",
        "bullets": ["Plan vacunal personalizado", "Recordatorios de vacunación", "Cartilla actualizada"],
    },
    {
        "slug": "desparasitaciones",
        "title": "Desparasitaciones",
        "icon": "shield-check",
        "summary": "Protección interna y externa frente a parásitos.",
        "description": "La desparasitación interna protege frente a parásitos intestinales (jarabe, gotas o comprimidos) "
        "y la externa frente a pulgas, garrapatas y ácaros (pipetas, sprays, comprimidos o collares).",
        "bullets": ["Desparasitación interna", "Desparasitación externa", "Calendario personalizado"],
    },
    {
        "slug": "ecografia",
        "title": "Ecografía",
        "icon": "activity",
        "summary": "Diagnóstico por imagen en tiempo real, sencillo e inocuo, con Doppler.",
        "description": "Técnica de diagnóstico por imagen sencilla e inocua que permite ver las estructuras internas en "
        "tiempo real sin necesidad de sedación. Nuestros equipos cuentan con Doppler, lo que mejora la calidad diagnóstica.",
        "bullets": ["Sin sedación", "Imagen en tiempo real", "Tecnología Doppler"],
    },
    {
        "slug": "tac",
        "title": "TAC",
        "icon": "scan",
        "summary": "Diagnóstico por imagen de alta precisión para casos complejos.",
        "description": "La tomografía axial computarizada ofrece diagnóstico por imagen de alta precisión, útil para el "
        "diagnóstico precoz, la evaluación pronóstica y la planificación de tratamientos. Es una herramienta clave en casos complejos.",
        "bullets": ["Alta precisión", "Planificación quirúrgica", "Casos complejos"],
    },
    {
        "slug": "certificados",
        "title": "Certificados",
        "icon": "file-badge",
        "summary": "Certificados oficiales para viajar dentro y fuera de España.",
        "description": "Emitimos certificados oficiales para viajar con tu mascota dentro y fuera de España. "
        "Nuestros veterinarios están registrados en CEXGAN.",
        "bullets": ["Certificados de viaje", "Veterinarios registrados en CEXGAN", "Pasaporte europeo"],
    },
    {
        "slug": "nutricion",
        "title": "Asesoramiento nutricional personalizado",
        "icon": "apple",
        "summary": "Dieta adaptada a la edad, tamaño, actividad y estado de salud de tu mascota.",
        "description": "Diseñamos un plan de alimentación a medida para cada mascota.",
        "bullets": ["Edad", "Tamaño y raza", "Nivel de actividad", "Temperamento y preferencias", "Estado reproductivo", "Condiciones médicas"],
    },
]

SPECIALTIES = [
    ("medicina-interna", "Medicina interna", "microscope",
     "Diagnóstico y tratamiento no quirúrgico de las enfermedades que afectan a los órganos internos.",
     ["Enfermedades endocrinas", "Digestivo e hígado", "Riñón y vías urinarias"]),
    ("exoticos", "Medicina de exóticos", "bird",
     "Atención a reptiles, aves y pequeños mamíferos: prevención, microchip, nutrición y cirugía.",
     ["Reptiles", "Aves", "Pequeños mamíferos", "Hospitalización"]),
    ("dermatologia", "Dermatología", "hand",
     "Tratamiento de los problemas de piel con citologías, cultivos y terapia lumínica de última generación.",
     ["Citologías y cultivos", "Alergias", "Terapia lumínica"]),
    ("oftalmologia", "Oftalmología", "eye",
     "Asistencia médico-quirúrgica de las enfermedades oculares.",
     ["Cirugía de párpados", "Córnea", "Enucleación"]),
    ("neurologia", "Neurología", "brain",
     "Prevención, diagnóstico y tratamiento de las enfermedades del sistema nervioso.",
     ["Epilepsia", "Hernias discales", "Diagnóstico por imagen"]),
    ("etologia", "Etología", "paw-print",
     "Estudio del comportamiento animal para abordar conductas inusuales o problemáticas.",
     ["Ansiedad por separación", "Agresividad", "Adaptación a nuevos entornos"]),
    ("cardiologia", "Cardiología", "heart-pulse",
     "Atención cardíaca completa con electrocardiogramas, ecocardiografías y cirugía intratorácica.",
     ["Electrocardiograma", "Ecocardiografía", "Cirugía intratorácica"]),
    ("traumatologia", "Traumatología y ortopedia", "bone",
     "Tratamiento de los problemas óseos y musculoesqueléticos con técnicas avanzadas.",
     ["Fracturas", "Displasias", "Ligamentos"]),
    ("oncologia", "Oncología", "ribbon",
     "Diagnóstico precoz y tratamientos oncológicos, incluida la quimioterapia.",
     ["Diagnóstico precoz", "Quimioterapia", "Cuidados paliativos"]),
    ("odontologia", "Odontología", "toothbrush",
     "Prevención y tratamiento bucodental con limpiezas ultrasónicas y cirugía oral.",
     ["Limpieza ultrasónica", "Extracciones", "Cirugía oral"]),
    ("tejidos-blandos", "Cirugía de tejidos blandos", "scissors",
     "Procedimientos abdominales, digestivos, reproductivos y hepáticos.",
     ["Cirugía abdominal", "Aparato reproductor", "Cirugía hepática"]),
]

ALL_SERVICES = ["consultas", "tienda", "pruebas-laboratoriales", "vacunaciones", "desparasitaciones", "microchip", "peluqueria", "radiologia", "ecografia"]

CLINICS = [
    # slug, nombre, región, ciudad, dirección, CP, lat, lng, 24h, servicios extra
    ("sevilla-nervion", "Veterinarias Sales Sevilla Nervión", "Andalucía", "Sevilla", "Av. Luis de Morales, 18", "41018", 37.3833, -5.9733, True, ["cirugias", "urgencias-24h", "tac"]),
    ("malaga-teatinos", "Veterinarias Sales Málaga Teatinos", "Andalucía", "Málaga", "C/ Pacífico, 42", "29004", 36.7046, -4.4473, False, ["cirugias"]),
    ("barcelona-sant-andreu", "Veterinarias Sales Barcelona Sant Andreu", "Cataluña", "Barcelona", "C/ Gran de Sant Andreu, 210", "08030", 41.4352, 2.1897, True, ["cirugias", "urgencias-24h", "endoscopia"]),
    ("badalona-centre", "Veterinarias Sales Badalona", "Cataluña", "Badalona", "C/ del Mar, 75", "08911", 41.4469, 2.2451, False, []),
    ("madrid-vallecas", "Veterinarias Sales Madrid Vallecas", "Madrid", "Madrid", "Av. de la Albufera, 153", "28038", 40.3920, -3.6620, True, ["cirugias", "urgencias-24h", "tac", "endoscopia"]),
    ("madrid-chamberi", "Veterinarias Sales Madrid Chamberí", "Madrid", "Madrid", "C/ de Fuencarral, 140", "28010", 40.4310, -3.7020, False, ["cirugias"]),
    ("alcobendas", "Veterinarias Sales Alcobendas", "Madrid", "Alcobendas", "Av. de España, 21", "28100", 40.5370, -3.6370, False, []),
    ("murcia-centro", "Veterinarias Sales Murcia", "Murcia", "Murcia", "Av. Miguel de Cervantes, 40", "30009", 37.9960, -1.1350, False, ["cirugias"]),
    ("valencia-campanar", "Veterinarias Sales Valencia Campanar", "Comunidad Valenciana", "Valencia", "Av. de Pío XII, 52", "46015", 39.4810, -0.3920, True, ["cirugias", "urgencias-24h"]),
    ("alicante-centro", "Veterinarias Sales Alicante", "Comunidad Valenciana", "Alicante", "Av. de Maisonnave, 33", "03003", 38.3420, -0.4950, False, []),
]

POSTS = [
    {
        "slug": "proteger-mascota-parasitos-primavera",
        "title": "Cómo proteger a tu mascota de los parásitos en primavera y verano",
        "category": "Prevención",
        "image": img("photo-1548199973-03cce0bbc87b"),
        "excerpt": "Con el buen tiempo aumentan pulgas, garrapatas y mosquitos. Te contamos cómo mantener a tu perro o gato protegido.",
        "content": "Con la llegada del calor, los parásitos externos se multiplican. Pulgas, garrapatas, mosquitos y flebótomos "
        "pueden transmitir enfermedades graves como la leishmaniosis o la filariosis.\n\n"
        "## Desparasitación externa\nUtiliza pipetas, collares o comprimidos según el estilo de vida de tu mascota. "
        "Tu veterinario te indicará el producto y la frecuencia más adecuados.\n\n"
        "## Desparasitación interna\nLos parásitos intestinales también se contagian con más facilidad en los paseos. "
        "Lo habitual es desparasitar cada tres meses, aunque puede variar.\n\n"
        "## Revisa a tu mascota tras cada paseo\nPresta atención a orejas, axilas y entre los dedos. "
        "Si encuentras una garrapata, no la arranques: acude a tu clínica para retirarla correctamente.",
        "published_at": dt.date(2026, 4, 2),
    },
    {
        "slug": "primera-visita-cachorro",
        "title": "La primera visita al veterinario de tu cachorro: todo lo que debes saber",
        "category": "Cachorros",
        "image": img("photo-1583337130417-3346a1be7dee"),
        "excerpt": "Vacunas, microchip, desparasitación y alimentación: la guía para empezar con buen pie.",
        "content": "La primera visita es fundamental para comprobar el estado de salud de tu cachorro y establecer su plan preventivo.\n\n"
        "## ¿Qué revisaremos?\nExploración general, peso, dentición, piel y oídos.\n\n"
        "## Plan vacunal\nDiseñamos un calendario de vacunas adaptado a su edad y estilo de vida.\n\n"
        "## Microchip\nEs obligatorio desde los 3 meses y te permitirá recuperarlo si se pierde.\n\n"
        "## Alimentación\nTe aconsejamos el pienso más adecuado para su raza y tamaño.",
        "published_at": dt.date(2026, 3, 15),
    },
    {
        "slug": "gatos-estres-visita-clinica",
        "title": "Consejos para reducir el estrés de tu gato en la visita a la clínica",
        "category": "Gatos",
        "image": img("photo-1574158622682-e40e69881006"),
        "excerpt": "Transportín, feromonas y rutinas: pequeños gestos que marcan la diferencia.",
        "content": "Muchos gatos viven la visita al veterinario como una situación estresante. Estos consejos te ayudarán.\n\n"
        "## Acostúmbralo al transportín\nDéjalo abierto en casa con una manta y algún premio dentro.\n\n"
        "## Usa feromonas\nUn spray de feromonas en el transportín 15 minutos antes del viaje ayuda a tranquilizarlo.\n\n"
        "## Clínicas felinas\nNuestras salas para gatos tienen iluminación adaptada y están separadas de los perros.",
        "published_at": dt.date(2026, 2, 20),
    },
    {
        "slug": "alimentacion-perros-senior",
        "title": "Alimentación del perro senior: claves para una vejez saludable",
        "category": "Nutrición",
        "image": img("photo-1587300003388-59208cc962cb"),
        "excerpt": "A partir de los 7 años sus necesidades cambian. Descubre cómo adaptar su dieta.",
        "content": "Con la edad, el metabolismo de tu perro se ralentiza y aparecen nuevas necesidades.\n\n"
        "## Menos calorías, más calidad\nUn pienso senior controla el peso y aporta proteína de alta calidad.\n\n"
        "## Articulaciones\nLos suplementos con glucosamina y condroitina ayudan a mantener su movilidad.\n\n"
        "## Revisiones semestrales\nDetectar a tiempo problemas renales o cardíacos es clave en esta etapa.",
        "published_at": dt.date(2026, 1, 28),
    },
    {
        "slug": "viajar-con-mascota",
        "title": "Viajar con tu mascota: documentación y certificados",
        "category": "Consejos",
        "image": img("photo-1530281700549-e82e7bf110d6"),
        "excerpt": "Pasaporte europeo, vacuna de la rabia y certificados oficiales para viajar sin sorpresas.",
        "content": "Si vas a viajar con tu mascota, prepara la documentación con antelación.\n\n"
        "## Dentro de la UE\nNecesitarás microchip, pasaporte europeo y vacuna antirrábica en vigor.\n\n"
        "## Fuera de la UE\nCada país tiene sus requisitos. Emitimos certificados oficiales a través de CEXGAN.\n\n"
        "## Transporte\nConsulta las condiciones de la compañía aérea o de transporte con tiempo.",
        "published_at": dt.date(2025, 12, 10),
    },
    {
        "slug": "salud-dental-mascotas",
        "title": "Salud dental: la gran olvidada en perros y gatos",
        "category": "Prevención",
        "image": img("photo-1517849845537-4d257902454a"),
        "excerpt": "El 80% de los perros mayores de 3 años tiene algún problema bucodental. Te explicamos cómo prevenirlo.",
        "content": "El sarro y la enfermedad periodontal pueden afectar a corazón, riñones e hígado.\n\n"
        "## Cepillado\nLo ideal es cepillar los dientes de tu mascota a diario con pasta específica.\n\n"
        "## Snacks dentales\nAyudan, pero no sustituyen al cepillado.\n\n"
        "## Limpieza profesional\nUna limpieza ultrasónica periódica mantiene su boca sana.",
        "published_at": dt.date(2025, 11, 5),
    },
]

TESTIMONIALS = [
    ("Katherine M.", "Luna, golden retriever", "Excelente atención. Me explicaron todo con mucha paciencia y Luna salió feliz de la consulta.", dt.date(2025, 12, 12)),
    ("Andrea R.", "Simba, gato europeo", "Muy buena experiencia. Fui hace una semana con mi gatete y todo genial, el trato fue muy cercano.", dt.date(2025, 12, 3)),
    ("Javier P.", "Toby, beagle", "Lo mejor es no tener que preocuparte por las facturas. Pagas la cuota y vas siempre que lo necesitas.", dt.date(2025, 11, 20)),
    ("Lucía G.", "Nala, ragdoll", "Tuvimos una urgencia un domingo por la noche y nos atendieron enseguida. Eternamente agradecidos.", dt.date(2025, 11, 2)),
    ("Marcos T.", "Rocky y Kira", "Tengo dos perros y la cuota es la misma. Las instalaciones están impecables y el equipo es encantador.", dt.date(2025, 10, 18)),
    ("Elena S.", "Coco, conejo", "Por fin una clínica que sabe de exóticos. Coco está estupendo gracias al equipo.", dt.date(2025, 9, 30)),
]

FAQS = [
    ("Socios", "¿Hay periodo de carencia o copagos?",
     "No. Desde el primer día puedes utilizar todos los servicios incluidos sin carencias, sin copagos y sin límites de uso.", True),
    ("Socios", "¿El precio depende de la edad, raza o tamaño de mi mascota?",
     "No. La cuota es la misma para cualquier mascota, independientemente de su especie, raza, edad o tamaño.", True),
    ("Socios", "¿Cuánto cuesta ser socio?",
     "La cuota es de 22,90 € al mes, o 274,80 € al año con un mes gratis si eliges el pago anual.", True),
    ("Socios", "¿Puedo dar de baja mi suscripción cuando quiera?",
     "Sí. No hay permanencia: puedes darte de baja en cualquier momento desde tu área de socio o llamando a atención al cliente.", False),
    ("Citas", "¿Cómo pido cita?",
     "Puedes pedir cita online desde esta web eligiendo tu clínica, el servicio y el horario que mejor te venga, o llamando por teléfono.", False),
    ("Citas", "¿Puedo ir sin cita?",
     "Sí, aunque te recomendamos reservar para evitar esperas. Las urgencias se atienden siempre sin cita.", False),
    ("Servicios", "¿Qué servicios están incluidos en la cuota?",
     "Consultas ilimitadas, vacunas, desparasitaciones, microchip, revisiones, curas y suturas, entre otros. Consulta la página de servicios para ver el detalle.", False),
    ("Servicios", "¿Atendéis animales exóticos?",
     "Sí, contamos con veterinarios especializados en reptiles, aves y pequeños mamíferos.", False),
    ("Servicios", "¿Qué hago si tengo una urgencia fuera de horario?",
     "Llama a nuestro teléfono de urgencias 24h. Te atenderemos y, si es necesario, te derivaremos a la clínica 24h más cercana.", False),
]


def _empty(db: Session, model) -> bool:
    return db.scalar(select(func.count()).select_from(model)) == 0


def seed(db: Session) -> None:
    if _empty(db, models.Service):
        db.add_all(
            models.Service(position=i, bookable=s.get("bookable", True), **{k: v for k, v in s.items() if k != "bookable"})
            for i, s in enumerate(SERVICES)
        )

    if _empty(db, models.Specialty):
        db.add_all(
            models.Specialty(slug=slug, title=title, icon=icon, description=desc, bullets=bullets, position=i)
            for i, (slug, title, icon, desc, bullets) in enumerate(SPECIALTIES)
        )

    if _empty(db, models.Clinic):
        for i, (slug, name, region, city, address, cp, lat, lng, h24, extra) in enumerate(CLINICS):
            db.add(
                models.Clinic(
                    slug=slug, name=name, region=region, city=city, address=address, postal_code=cp,
                    phone=f"910 000 {100 + i:03d}", lat=lat, lng=lng, open_24h=h24,
                    hours_vet="24 horas, todos los días" if h24 else "Martes a sábado de 10:00 a 21:00",
                    hours_shop="Lunes a sábado de 10:00 a 21:00",
                    hours_grooming="Martes a sábado de 10:00 a 20:00",
                    services=ALL_SERVICES + extra,
                )
            )

    if _empty(db, models.BlogPost):
        db.add_all(models.BlogPost(**p) for p in POSTS)

    if _empty(db, models.Testimonial):
        db.add_all(
            models.Testimonial(author=a, pet=p, text=t, rating=5, published_at=d) for a, p, t, d in TESTIMONIALS
        )

    if _empty(db, models.Faq):
        db.add_all(
            models.Faq(category=c, question=q, answer=a, featured=f, position=i)
            for i, (c, q, a, f) in enumerate(FAQS)
        )

    db.commit()
