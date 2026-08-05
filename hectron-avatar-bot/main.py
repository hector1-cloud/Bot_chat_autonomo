from fastapi import FastAPI
from pydantic import BaseModel
import re

from firebase_db import guardar_mensaje, obtener_historial
from ai_brain import procesar_mensaje
from image_engine import generar_foto_avatar

app = FastAPI(title="Agentes Hectron - Avatar API")

class PeticionChat(BaseModel):
    user_id: str
    mensaje: str

@app.post("/chat")
def interactuar_con_avatar(peticion: PeticionChat):
    user_id = peticion.user_id
    mensaje = peticion.mensaje
    
    guardar_mensaje(user_id, 'user', mensaje)
    historial = obtener_historial(user_id)
    
    respuesta_ia = procesar_mensaje(historial, mensaje)
    
    imagen_url = None
    patron_imagen = r'\[GENERATE_IMAGE:(.*?)\]'
    match = re.search(patron_imagen, respuesta_ia)
    
    if match:
        prompt_tecnico = match.group(1).strip()
        imagen_url = generar_foto_avatar(prompt_tecnico)
        respuesta_ia = re.sub(patron_imagen, '', respuesta_ia).strip()
        
    guardar_mensaje(user_id, 'model', respuesta_ia)
    
    return {
        "texto": respuesta_ia,
        "imagen": imagen_url
    }
