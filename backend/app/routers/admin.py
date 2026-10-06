import secrets

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import settings
from ..database import get_db


def require_admin(x_admin_token: str = Header(default="")) -> None:
    if not secrets.compare_digest(x_admin_token, settings.admin_token):
        raise HTTPException(401, "Token de administración no válido")


router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


def _count(db: Session, model, *where) -> int:
    return db.scalar(select(func.count()).select_from(model).where(*where)) or 0


@router.get("/stats", response_model=schemas.AdminStats)
def stats(db: Session = Depends(get_db)):
    return {
        "appointments": _count(db, models.Appointment),
        "appointments_pending": _count(db, models.Appointment, models.Appointment.status == "pendiente"),
        "members": _count(db, models.Member),
        "messages": _count(db, models.ContactMessage),
        "subscribers": _count(db, models.NewsletterSubscriber),
    }


@router.get("/appointments", response_model=list[schemas.AppointmentOut])
def appointments(db: Session = Depends(get_db)):
    stmt = select(models.Appointment).order_by(models.Appointment.date.desc(), models.Appointment.time.desc())
    return db.scalars(stmt).all()


@router.patch("/appointments/{appointment_id}", response_model=schemas.AppointmentOut)
def update_appointment(appointment_id: int, data: schemas.StatusUpdate, db: Session = Depends(get_db)):
    appointment = db.get(models.Appointment, appointment_id)
    if not appointment:
        raise HTTPException(404, "Cita no encontrada")
    appointment.status = data.status
    db.commit()
    db.refresh(appointment)
    return appointment


@router.get("/members", response_model=list[schemas.MemberOut])
def members(db: Session = Depends(get_db)):
    return db.scalars(select(models.Member).order_by(models.Member.created_at.desc())).all()


@router.get("/messages", response_model=list[schemas.ContactOut])
def messages(db: Session = Depends(get_db)):
    return db.scalars(select(models.ContactMessage).order_by(models.ContactMessage.created_at.desc())).all()


@router.get("/subscribers", response_model=list[schemas.NewsletterOut])
def subscribers(db: Session = Depends(get_db)):
    stmt = select(models.NewsletterSubscriber).order_by(models.NewsletterSubscriber.created_at.desc())
    return db.scalars(stmt).all()
