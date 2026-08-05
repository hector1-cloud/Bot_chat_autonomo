import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
if cred_path and os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
else:
    print("Warning: Firebase credentials not found. DB operations will fail.")
    db = None

def guardar_mensaje(user_id, rol, contenido):
    if not db: return
    doc_ref = db.collection('chats').document(user_id).collection('mensajes').document()
    doc_ref.set({
        'rol': rol,
        'contenido': contenido,
        'timestamp': firestore.SERVER_TIMESTAMP
    })

def obtener_historial(user_id):
    if not db: return []
    mensajes_ref = db.collection('chats').document(user_id).collection('mensajes').order_by('timestamp')
    docs = mensajes_ref.stream()
    return [{"role": doc.to_dict().get('rol', 'user'), "parts": [doc.to_dict().get('contenido', '')]} for doc in docs]
