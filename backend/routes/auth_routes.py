import os
from fastapi import APIRouter, Depends, HTTPException, status, Cookie, Response
from passlib.context import CryptContext # type: ignore
from jose import jwt, JWTError, ExpiredSignatureError # type: ignore
from datetime import datetime, timedelta, timezone
from typing import Optional
from backend.database.repos import user_repo
from backend.models import User
from backend.routes._schemas import UserPayload, UserProtected

# === Config ===
SECRET_KEY = os.environ['JWT_KEY']
if not SECRET_KEY:
    raise ValueError("JWT_KEY environment variable not set.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7
REFRESH_TOKEN_EXPIRE_MINUTES = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()

# === Helper Functions ===
def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    :param password: The plain text password to hash.
    :return: The hashed password.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create an access token with an expiration date.
    If expires_delta is None, defaults to ACCESS_TOKEN_EXPIRE_MINUTES.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a refresh token with an expiration date.
    If expires_delta is None, defaults to REFRESH_TOKEN_EXPIRE_DAYS.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    """
    Decode a JWT token and return the payload.
    Returns None if the token is invalid or expired.
    Raises HTTPException if the token is expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
        return None

def save_tokens(response: Response, access_token: str, refresh_token: str):
    """
    Save access and refresh tokens in HTTP-only cookies.
    """
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False
    )
    
# === Endpoints ===
@router.post("/login")
def login(payload: UserPayload, response: Response):
    """
    Authenticate user and return access and refresh tokens.
    The user must provide valid email and password.
    """
    if( not payload.email or not payload.password_current):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email and password are required")

    users = user_repo.query([('email','==', payload.email.strip().lower())])
    if not users:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No account with that email exists")
    
    user = users[0]
    
    if not verify_password(payload.password_current, user.password_hashed):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Password is incorrect")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.id}, expires_delta=access_token_expires)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(data={"sub": user.id}, expires_delta=refresh_token_expires)
    
    save_tokens(response, access_token, refresh_token)
    
@router.post("/register")
def register(payload: UserPayload, response: Response):
    """
    Register a new user and return access and refresh tokens.
    The user must provide a unique username and email.
    """
    if not payload.username or not payload.email or not payload.password_current:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username, email, and password are required.")

    if len(user_repo.query([('email','==', payload.email.strip().lower())])) > 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with that email already exists.")
    
    user = User(
        username=payload.username,
        email=payload.email,
        password_hashed=hash_password(payload.password_current)
    )

    id = user_repo.add(user)
    if not id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User registration failed")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": str(id)}, expires_delta=access_token_expires)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(data={"sub": str(id)}, expires_delta=refresh_token_expires)

    save_tokens(response, access_token, refresh_token)
    
@router.post("/refresh")
def refresh_token(response: Response, refresh_token: str = Cookie(None)):
    """
    Refresh the access token using a valid refresh token from the cookie.
    The refresh token must be valid and not expired.
    """
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    payload = decode_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user = user_repo.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)

    save_tokens(response, access_token, refresh_token)
    
@router.post("/logout")
def logout(response: Response):
    """
    Log out the user by clearing the access and refresh tokens.
    This will remove the cookies set for authentication.
    """
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"detail": "Logged out successfully"}

@router.post("/authenticate", response_model=UserProtected)
def authenticate(response: Response, access_token: str = Cookie(None)):
    """
    Authenticate the user using the access token from the cookie.
    Returns user details if the token is valid.
    """
    if not access_token:
        raise HTTPException(status_code=401, detail="Access token missing")
    
    payload = decode_token(access_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid access token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid access token")
    
    user = user_repo.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserProtected.from_model(user)

# === Other ===
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(access_token: str = Cookie(None)):
    """
    Dependency to get the current authenticated user from the JWT access token.
    Raises 401 if invalid or expired.
    """
    payload = decode_token(access_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid access token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid access token")
    
    user = user_repo.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
