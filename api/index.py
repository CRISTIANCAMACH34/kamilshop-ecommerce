import sys
import os
from pathlib import Path

# Resolver directorios en entornos locales y empaquetados Serverless de Vercel
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent

search_paths = [
    str(current_dir),
    str(root_dir / "backend"),
    str(current_dir / "backend"),
    str(Path(os.getcwd()) / "backend"),
    "/var/task/backend",
    "/var/task",
]

for p in search_paths:
    if p not in sys.path and os.path.exists(p):
        sys.path.insert(0, p)

# Importar app FastAPI
from app.main import app  # noqa: E402

__all__ = ["app"]
