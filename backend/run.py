import uvicorn

if __name__ == "__main__":
    print("==========================================================")
    print("  INICIANDO TITULO E-COMMERCE BACKEND (ARQUITECTURA HEXAGONAL)")
    print("  FastAPI / Python 3.12 / POO / SOLID / ACID / 5NF")
    print("  Documentacion Swagger interactiva: http://127.0.0.1:8000/docs")
    print("==========================================================")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
