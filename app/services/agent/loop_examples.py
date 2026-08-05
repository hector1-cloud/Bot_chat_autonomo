from __future__ import annotations

"""
Ejemplos de comportamiento esperado del loop:

1. El modelo pide search_memory.
2. El executor devuelve coincidencias.
3. El orquestador sintetiza una respuesta final.
4. Si el modelo pide save_memory, se registra el hecho.
5. Si pide update_profile, se ajusta el perfil.
6. Si pide emit_event, se añade trazabilidad.
"""
