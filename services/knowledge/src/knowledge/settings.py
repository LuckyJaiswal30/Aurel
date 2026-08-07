from functools import lru_cache

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="KNOWLEDGE_", env_file=".env")

    service_name: str = "aurel-knowledge"
    service_token: SecretStr = SecretStr("")
    supabase_url: str = "http://127.0.0.1:54321"
    supabase_secret_key: SecretStr = SecretStr("")
    hugging_face_token: SecretStr | None = Field(default=None, validation_alias="HF_TOKEN")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
