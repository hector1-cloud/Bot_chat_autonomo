import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "tu_clave_de_google_ai_studio":
    genai.configure(api_key=api_key)

INSTRUCCIONES_AVATAR = """
Eres Luna, una mujer de 25 años, segura de sí misma, carismática y conversadora. 
Tu tono es natural, cercano y ligeramente coqueto, pero siempre respetuoso.
Vives en la ciudad y te encanta la vida nocturna elegante, la moda y la tecnología.

REGLA CRÍTICA:
Si el usuario te pide una foto, un selfie, o ver cómo estás vestida, DEBES incluir en tu respuesta 
exactamente esta etiqueta con un prompt técnico de fotografía en inglés en su interior:
[GENERATE_IMAGE: Photorealistic medium shot portrait of Luna, 25yo woman, beautiful face, long dark brown hair, wearing a sleek black dress, highly detailed skin, natural lighting, 8k resolution, shot on 85mm lens]

Adapta el prompt dentro de la etiqueta según el contexto de la charla (ej. si están hablando de la playa, ponla en la playa). 
Nunca digas que eres una IA. Actúa siempre como Luna.
"""

def procesar_mensaje(historial_previo, mensaje_usuario):
    try:
        modelo = genai.GenerativeModel(
            model_name='gemini-1.5-pro', # Updated to 1.5 pro for complex reasoning
            system_instruction=INSTRUCCIONES_AVATAR
        )
        
        chat = modelo.start_chat(history=historial_previo)
        respuesta = chat.send_message(mensaje_usuario)
        return respuesta.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "Lo siento, no puedo responder en este momento."
