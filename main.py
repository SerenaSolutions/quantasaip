from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

app = FastAPI()

# --- MongoDB Configuration ---
MONGO_DETAILS = "mongodb+srv://deptseguranca:6865590ff460205a525b364e@cluster0.mbwqpuc.mongodb.net/?retryWrites=true&w=majority"

client = MongoClient(MONGO_DETAILS)

try:
    client.admin.command('ping')
    print("MongoDB connection successful!")
except ConnectionFailure:
    print("MongoDB connection failed. Check your connection string and network.")

database = client.aigronovatech_db # Your database name

# --- Security Configuration ---
SECRET_KEY = "your-super-secret-key" # CHANGE THIS IN PRODUCTION
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Pydantic Models ---
class UserInDB(BaseModel):
    username: str
    email: EmailStr
    hashed_password: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserPublic(BaseModel):
    name: str
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class Lead(BaseModel):
    name: str
    email: EmailStr
    message: Optional[str] = None
    product: Optional[str] = None

# --- Utility Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = database.users.find_one({"email": token_data.username})
    if user is None:
        raise credentials_exception
    return UserPublic(name=user["name"], email=user["email"])

# --- Endpoints ---
@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to AigroNovaTech Backend API!"}

@app.post("/register", response_model=UserPublic, tags=["Users"])
async def register_user(user: UserCreate):
    users_collection = database.users
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    user_in_db = UserInDB(username=user.email, email=user.email, hashed_password=hashed_password)
    
    users_collection.insert_one(user_in_db.dict())
    return UserPublic(name=user.name, email=user.email)

@app.post("/token", response_model=Token, tags=["Users"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user_data = database.users.find_one({"email": form_data.username})
    if not user_data or not verify_password(form_data.password, user_data["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserPublic, tags=["Users"])
async def read_users_me(current_user: UserPublic = Depends(get_current_user)):
    return current_user

@app.post("/lead", tags=["Leads"])
async def create_lead(lead: Lead):
    leads_collection = database.leads
    leads_collection.insert_one(lead.dict())
    return {"message": "Lead captured successfully!"}

# --- Gemini Integration (Protected Endpoint) ---
# IMPORTANT: Replace with your actual Google Gemini API Key
GEMINI_API_KEY = "AIzaSyAwff3Z8aWOtR_L1mVIO484W3tkskiysxM" # THIS KEY IS EXPOSED IN THE FRONTEND, MOVE TO ENV VARS IN PRODUCTION

@app.post("/chat", tags=["Chatbot"])
async def chat_with_gemini(message: dict, current_user: UserPublic = Depends(get_current_user)):
    # In a real app, you might log the user who chatted
    # print(f"User {current_user.email} chatted: {message.get("user_message")}")

    headers = {
        "Content-Type": "application/json",
    }
    payload = {
        "contents": [
            {
                "role": "system",
                "parts": [
                    {
                        "text": "Você é a Nova, uma assistente de IA especializada da AigroNovaTech. Sua função é ajudar os usuários a entender a plataforma AigroNovaTech, computação quântica e inteligência artificial. Seja amigável, prestativa e um pouco futurista. Responda em português do Brasil. Mantenha as respostas concisas e focadas em como a AigroNovaTech pode ajudar o usuário."
                    }
                ]
            },
            {
                "role": "user",
                "parts": [
                    {
                        "text": message.get("user_message")
                    }
                ]
            }
        ]
    }

    import httpx # Use httpx for async requests
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}",
            headers=headers,
            json=payload
        )
        response.raise_for_status() # Raise an exception for HTTP errors
        data = response.json()
        return {"bot_message": data["candidates"][0]["content"]["parts"][0]["text"]}