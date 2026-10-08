import sys
from pathlib import Path

# Agregar el directorio backend al PYTHONPATH para la resolución de módulos de Python en Vercel
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app  # noqa: E402

# Exportación requerida por el runtime Python Serverless de Vercel
__all__ = ["app"]
