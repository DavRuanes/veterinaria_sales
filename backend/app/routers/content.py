from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api", tags=["contenido"])


@router.get("/clinics", response_model=list[schemas.ClinicOut])
def list_clinics(
    region: str | None = None,
    q: str | None = Query(default=None, max_length=80),
    db: Session = Depends(get_db),
):
    stmt = select(models.Clinic).order_by(models.Clinic.region, models.Clinic.name)
    if region:
        stmt = stmt.where(models.Clinic.region == region)
    if q and q.strip():
        term = q.strip()
        like = f"%{term}%"
        stmt = stmt.where(
            or_(
                models.Clinic.name.ilike(like),
                models.Clinic.city.ilike(like),
                models.Clinic.address.ilike(like),
                models.Clinic.region.ilike(like),
                models.Clinic.postal_code.startswith(term),
            )
        )
    return db.scalars(stmt).all()


@router.get("/clinics/{slug}", response_model=schemas.ClinicOut)
def get_clinic(slug: str, db: Session = Depends(get_db)):
    clinic = db.scalar(select(models.Clinic).where(models.Clinic.slug == slug))
    if not clinic:
        raise HTTPException(404, "Clínica no encontrada")
    return clinic


@router.get("/services", response_model=list[schemas.ServiceOut])
def list_services(db: Session = Depends(get_db)):
    return db.scalars(select(models.Service).order_by(models.Service.position)).all()


@router.get("/specialties", response_model=list[schemas.SpecialtyOut])
def list_specialties(db: Session = Depends(get_db)):
    return db.scalars(select(models.Specialty).order_by(models.Specialty.position)).all()


@router.get("/blog", response_model=list[schemas.BlogPostSummary])
def list_posts(
    category: str | None = None,
    limit: int = Query(default=50, ge=1, le=50),
    db: Session = Depends(get_db),
):
    stmt = select(models.BlogPost).order_by(models.BlogPost.published_at.desc()).limit(limit)
    if category:
        stmt = stmt.where(models.BlogPost.category == category)
    return db.scalars(stmt).all()


@router.get("/blog/{slug}", response_model=schemas.BlogPostOut)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = db.scalar(select(models.BlogPost).where(models.BlogPost.slug == slug))
    if not post:
        raise HTTPException(404, "Artículo no encontrado")
    return post


@router.get("/testimonials", response_model=list[schemas.TestimonialOut])
def list_testimonials(db: Session = Depends(get_db)):
    return db.scalars(select(models.Testimonial).order_by(models.Testimonial.published_at.desc())).all()


@router.get("/faqs", response_model=list[schemas.FaqOut])
def list_faqs(featured: bool | None = None, db: Session = Depends(get_db)):
    stmt = select(models.Faq).order_by(models.Faq.position)
    if featured is not None:
        stmt = stmt.where(models.Faq.featured == featured)
    return db.scalars(stmt).all()
