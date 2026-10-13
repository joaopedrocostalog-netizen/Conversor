"""API opcional de assinatura criptográfica A1 (.pfx/.p12), usando pyHanko.
Implante somente em ambiente HTTPS sob seu controle. Não registre corpo de requisições.
"""
import io
import os
import uuid

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign import signers
from pyhanko.sign.fields import SigSeedSubFilter

app = FastAPI(title="COSTALOG - Assinatura digital A1")
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "https://joaopedrocostalog-netizen.github.io")
app.add_middleware(
    CORSMiddleware, allow_origins=[ALLOWED_ORIGIN], allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"], allow_credentials=False
)

@app.get("/health")
def health():
    return {"status": "ok", "capability": "pkcs12-signing"}

@app.post("/sign-a1")
async def sign_a1(
    pdf: UploadFile = File(...),
    certificate: UploadFile = File(...),
    password: str = Form(...),
):
    if not certificate.filename.lower().endswith((".p12", ".pfx")):
        raise HTTPException(400, "Certificado deve ser .p12 ou .pfx.")
    pdf_data = await pdf.read(20 * 1024 * 1024 + 1)
    cert_data = await certificate.read(1024 * 1024 + 1)
    await pdf.close()
    await certificate.close()
    if len(pdf_data) > 20 * 1024 * 1024 or len(cert_data) > 1024 * 1024:
        raise HTTPException(413, "PDF (20 MB) ou certificado (1 MB) excede limite.")
    if not pdf_data.startswith(b"%PDF-"):
        raise HTTPException(400, "Arquivo enviado não parece ser um PDF.")
    if not password:
        raise HTTPException(400, "Senha do certificado obrigatória.")
    try:
        signer = signers.SimpleSigner.load_pkcs12_data(
            pkcs12_bytes=cert_data, other_certs=[], passphrase=password.encode("utf-8")
        )
        if signer is None:
            raise ValueError("Falha ao carregar certificado.")
    except Exception:
        raise HTTPException(400, "Não foi possível abrir o certificado. Confira o arquivo e a senha.")
    try:
        reader = IncrementalPdfFileWriter(io.BytesIO(pdf_data))
        field_name = "COSTALOG_Signature_" + uuid.uuid4().hex[:12]
        meta = signers.PdfSignatureMetadata(
            field_name=field_name, md_algorithm="sha256",
            subfilter=SigSeedSubFilter.PADES,
        )
        signed = signers.sign_pdf(reader, signature_meta=meta, signer=signer)
        output = signed.getvalue()
    except Exception:
        raise HTTPException(422, "Não foi possível assinar o PDF. Verifique se o documento está protegido ou corrompido.")
    return Response(
        output,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="documento-assinado-icp.pdf"',
                 "Cache-Control": "no-store"},
    )
