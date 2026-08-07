import secrets
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from knowledge.settings import get_settings

bearer_scheme = HTTPBearer(auto_error=False)


def require_service_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> None:
    expected = get_settings().service_token.get_secret_value()
    provided = credentials.credentials if credentials else ""
    if not expected or not secrets.compare_digest(provided.encode(), expected.encode()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not allowed")
