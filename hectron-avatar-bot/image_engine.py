import os
import requests

IMAGE_API_KEY = os.getenv("IMAGE_API_KEY")
IMAGE_API_URL = "https://api.tu-proveedor-de-imagenes.com/v1/generate" 

def generar_foto_avatar(prompt_tecnico: str) -> str:
    headers = {
        "Authorization": f"Bearer {IMAGE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "prompt": prompt_tecnico,
        "negative_prompt": "cartoon, 3d, illustration, anime, poorly drawn, deformed, bad anatomy",
        "steps": 30,
        "cfg_scale": 7.0,
        "aspect_ratio": "9:16"
    }
    
    try:
        response = requests.post(IMAGE_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data.get('image_url')
    except Exception as e:
        print(f"Error generando imagen: {e}")
        return None
