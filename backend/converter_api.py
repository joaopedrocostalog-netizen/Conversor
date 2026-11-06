"""Dedicated PDF -> editable DOCX conversion API for COSTALOG.

Uses pdf2docx (PyMuPDF layout analysis + python-docx output). This is an
approximate layout reconstruction, not a pixel-perfect PDF renderer.
"""
import os
import tempfile
from pathlib import Path
from urllib.parse import quote

import fitz
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pdf2docx import Converter

MAX_FILE_BYTES = 60 * 1024 * 1024
MAX_PAGES = 150
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "https://joaopedrocostalog-netizen.github.io,http://localhost:8000,http://127.0.0.1:8000",
    ).split(",")
    if origin.strip()
]

app = FastAPI(title="COSTALOG PDF to Word", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    expose_headers=["Content-Disposition"],
    allow_credentials=False,
)


@app.get("/health")
def health():
    return {"status": "ok", "capability": "pdf-to-editable-docx"}


@app.post("/convert/pdf-to-docx")
async def convert_pdf_to_docx(pdf: UploadFile = File(...)):
    filename = Path(pdf.filename or "documento.pdf").name
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Envie um arquivo PDF.")

    data = await pdf.read(MAX_FILE_BYTES + 1)
    await pdf.close()
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="O PDF excede o limite de 60 MB.")
    if not data.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="O arquivo enviado não é um PDF válido.")

    temp_dir = tempfile.mkdtemp(prefix="costalog-pdf-docx-")
    source = os.path.join(temp_dir, "input.pdf")
    output = os.path.join(temp_dir, "output.docx")
    try:
        with open(source, "wb") as handle:
            handle.write(data)

        try:
            with fitz.open(source) as document:
                page_count = document.page_count
                if page_count < 1:
                    raise HTTPException(status_code=400, detail="O PDF não contém páginas.")
                if page_count > MAX_PAGES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"O PDF tem {page_count} páginas. O limite é {MAX_PAGES}.",
                    )
                if document.is_encrypted:
                    raise HTTPException(
                        status_code=422,
                        detail="O PDF está protegido por senha. Remova a proteção antes de converter.",
                    )
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=422, detail="Não foi possível abrir este PDF.")

        converter = None
        try:
            converter = Converter(source)
            converter.convert(output, start=0, end=None)
        except Exception:
            raise HTTPException(
                status_code=422,
                detail="Não foi possível reconstruir este PDF. Ele pode conter elementos incompatíveis ou estar danificado.",
            )
        finally:
            if converter is not None:
                converter.close()

        if not os.path.isfile(output) or os.path.getsize(output) < 100:
            raise HTTPException(status_code=422, detail="A conversão não gerou um DOCX válido.")

        stem = Path(filename).stem[:120] or "documento"
        download_name = f"{stem}.docx"
        return FileResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=download_name,
            headers={"Cache-Control": "no-store"},
            background=None,
        )
    finally:
        # FileResponse streams after the endpoint returns; its file is retained
        # in the temporary directory for the duration of the response.
        pass
