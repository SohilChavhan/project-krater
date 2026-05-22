import os
import base64
import uuid
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
load_dotenv()

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File, Form

# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

# pyrefly: ignore [missing-import]
from pydantic import BaseModel
import shutil

# pyrefly: ignore [missing-import]
import uvicorn
# pyrefly: ignore [missing-import]
import firebase_admin

# pyrefly: ignore [missing-import]
from firebase_admin import credentials, storage as fb_storage




from vision_engine import analyze_road_damage  
# pyrefly: ignore [missing-import]
from groq import Groq


cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'krater-v2.firebasestorage.app'
})
# pyrefly: ignore [missing-import]
import numpy as np

import pickle
# pyrefly: ignore [missing-import]
from keras.models import load_model

print("Loading Budget Estimator AI...")
budget_model = load_model('budget_estimator.h5')

with open('district_columns.pkl', 'rb') as f:
    district_columns = pickle.load(f)
print("Budget Estimator Ready!")


groq_api_key = os.getenv("GROQ_API_KEY")
print("MY GROQ KEY IS:", groq_api_key)
if not groq_api_key:
    raise ValueError("GROQ_API_KEY not found in .env file.")
client = Groq(api_key=groq_api_key)

app = FastAPI(title="Krater AI Engine")

def calculate_repair_budget(district_name: str, num_potholes: int) -> dict:
    try:

        sq_meters_needed = num_potholes * 5 
        input_data = np.zeros((1, len(district_columns)))
        
        if district_name in district_columns:
            district_index = district_columns.index(district_name)
            input_data[0, district_index] = 1.0
        else:

            return {"budget": 0.0, "material_sqm": sq_meters_needed}


        cost_per_meter = budget_model.predict(input_data, verbose=0)[0][0]
        total_budget = float(cost_per_meter * sq_meters_needed)
        
        return {"budget": total_budget, "material_sqm": sq_meters_needed}
    except Exception as e:
        print(f"Estimation Error: {e}")
        return {"budget": 0.0, "material_sqm": 0}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://project-krater-qhp8.vercel.app"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    context: str = ""

class ImageUploadRequest(BaseModel):
    image_base64: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the Krater AI Server. Vision and Chat systems are online."}

class TicketRequest(BaseModel):
    image_url: str
    location: str

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...),
    location: str = Form("Unknown")):
    temp_filename = f"temp_{file.filename}"
    
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:

        ai_results = analyze_road_damage(temp_filename, model_path='best.pt')



        potholes_found = ai_results.get("pothole_count", 0) 
        

        if location != "Unknown" and potholes_found > 0:
            estimation_data = calculate_repair_budget(location, potholes_found)
            estimated_budget = estimation_data["budget"]
            estimated_material = estimation_data["material_sqm"]
        else:
            estimated_budget = 0.0
            estimated_material = 0  
            

        ai_results["estimated_budget"] = estimated_budget
        ai_results["estimated_material_sqm"] = estimated_material
        ai_results["location_used"] = location
        
            
    except Exception as e:
        ai_results = {"status": "error", "message": str(e)}
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

    return ai_results

@app.post("/upload-image")
async def upload_image(request: ImageUploadRequest):
    """Receives a base64 image from React, uploads to Firebase Storage, returns the URL."""
    try:

        base64_data = request.image_base64
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]


        image_bytes = base64.b64decode(base64_data)


        bucket = fb_storage.bucket()
        filename = f"tickets/pothole_{uuid.uuid4().hex[:12]}.jpg"
        blob = bucket.blob(filename)

        token = str(uuid.uuid4())
        blob.metadata = {"firebaseStorageDownloadTokens": token}
        
        blob.upload_from_string(image_bytes, content_type='image/jpeg')


        from urllib.parse import quote
        encoded_name = quote(filename, safe='')
        public_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{encoded_name}?alt=media&token={token}"

        return {"status": "success", "url": public_url}
    except Exception as e:
        print(f"Upload error: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/chat")
async def krater_chatbot(request: ChatRequest):

    system_prompt = f"""You are a helpful civic assistant for the KRATER app. 
        Answer the user's questions politely. If they ask about road repairs or tickets, 
        use the following live database information to answer them accurately:
        
        LIVE DATABASE RECORDS:
        {request.context}
        """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            model="llama-3.1-8b-instant", 
        )
        
        bot_reply = chat_completion.choices[0].message.content
        return {"status": "success", "reply": bot_reply}

    except Exception as e:
        return {"status": "error", "reply": f"Groq AI Core Offline: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)