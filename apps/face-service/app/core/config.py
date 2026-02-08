from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "face-service"
    version: str = "0.1.0"
    debug: bool = False

    database_url: str = "postgresql://attndly:attndly_dev@localhost:5432/attndly_dev"
    redis_url: str = "redis://localhost:6379"
    cors_origins: list[str] = ["http://localhost:3000"]

    # Face recognition settings
    face_model: str = "Facenet512"
    face_detector: str = "ssd"
    storage_path: str = "./storage"
    max_faces_per_employee: int = 5
    min_confidence: float = 0.60

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
