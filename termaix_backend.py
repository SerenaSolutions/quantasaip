from fastapi import FastAPI, WebSocket, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Mock database
fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "fakehashedpassword",
        "disabled": False,
    }
}

class User(BaseModel):
    username: str
    full_name: str = None
    email: str = None
    disabled: bool = None

class UserInDB(User):
    hashed_password: str

class EnergyMetric(BaseModel):
    datacenter_id: str
    energy_consumption: float
    timestamp: str

class AIRecommendation(BaseModel):
    recommendation: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')

@app.post('/token')
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if not user or not user['hashed_password'] == form_data.password:
        return {'error': 'Invalid credentials'}
    # Here, you would generate a token
    return {'access_token': user['username'], 'token_type': 'bearer'}

@app.get('/users/me', response_model=User)
async def read_users_me(token: str = Depends(oauth2_scheme)):
    # Here, validate the token and return the user
    return fake_users_db.get(token)

@app.post('/datacenters/energy', response_model=EnergyMetric)
async def report_energy_consumption(energy_metric: EnergyMetric):
    # Store the energy metric in a database
    return energy_metric

@app.get('/ai/recommendations', response_model=List[AIRecommendation])
async def get_ai_recommendations():
    # Return AI recommendations
    return [AIRecommendation(recommendation="Reduce power usage by 10%.")]

@app.websocket('/ws/control')
async def websocket_control(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")

@app.get('/health')
async def health_check():
    return {'status': 'Healthy'}
