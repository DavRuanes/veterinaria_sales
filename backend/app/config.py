from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://vetsales:vetsales@localhost:5432/vetsales"
    admin_token: str = "cambia-este-token"
    cors_origins: str = "http://localhost:5190"


settings = Settings()
