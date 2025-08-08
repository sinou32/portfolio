import os
import jwt
from datetime import datetime, timedelta
from typing import Optional

# Simple admin password (in production, use proper user management)
ADMIN_PASSWORD = "architecture2024"
SECRET_KEY = os.environ.get("SECRET_KEY", "architectural_portfolio_secret_key_2024")
ALGORITHM = "HS256"


def verify_password(password: str) -> bool:
    """Verify admin password"""
    return password == ADMIN_PASSWORD


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None