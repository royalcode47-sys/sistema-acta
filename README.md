# sistema-acta

Breve descripción del proyecto.

Quick start
-

Instalación de dependencias:

```bash
python3 -m pip install -r requirements.txt
```

Ejecutar localmente (desarrollo):

```bash
# Opción 1: servidor de desarrollo
PORT=5000 python3 servidor/server.py

# Opción 2: con gunicorn (más parecido a producción)
gunicorn --chdir servidor server:app --bind 0.0.0.0:8000
```

Endpoints útiles
- `/ping` : revisa si el servidor responde
- `/generar-acta` : POST JSON con los datos para generar el acta (devuelve un .xlsx)

Despliegue en Render
- `render.yaml` ya incluye `buildCommand: pip install -r requirements.txt` y
	`startCommand: gunicorn --chdir servidor server:app --bind 0.0.0.0:$PORT`.

Si usas plataformas que respetan `Procfile`, se añadió uno con el comando de `gunicorn`.

Pruebas locales rápidas
- Usando `flask` test client (sin necesidad de levantar servidor):

```bash
/usr/bin/python3 - <<'PY'
from servidor import server as s
client = s.app.test_client()
print(client.get('/ping').get_json())
PY
```
