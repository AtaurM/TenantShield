from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import Response
from typing import Optional

from services.gemini_service import analyze as gemini_analyze
from services.pdf_service import generate_letter_pdf

router = APIRouter()

SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/analyze")
async def analyze_complaint(
    image: Optional[UploadFile] = File(None),
    complaint_text: Optional[str] = Form(None),
    language: str = Form("English"),
    tenant_name: str = Form(""),
    tenant_address: str = Form(""),
    tenant_unit: str = Form(""),
    landlord_name: str = Form(""),
    landlord_address: str = Form(""),
    letter_date: str = Form(""),
):
    if not image and not complaint_text:
        raise HTTPException(
            status_code=400,
            detail="At least one of 'image' or 'complaint_text' must be provided.",
        )

    image_bytes: Optional[bytes] = None
    if image and image.filename:
        if image.content_type not in SUPPORTED_IMAGE_TYPES:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported image type '{image.content_type}'. Use JPEG, PNG, or WebP.",
            )
        image_bytes = await image.read()

    complaint = complaint_text.strip() if complaint_text else None
    if complaint == "":
        complaint = None

    from datetime import date as _date, datetime as _datetime
    raw_date = letter_date.strip()
    try:
        formatted_date = _datetime.strptime(raw_date, "%Y-%m-%d").strftime("%B %d, %Y")
    except ValueError:
        formatted_date = raw_date or _date.today().strftime("%B %d, %Y")

    tenant_info = {
        "tenant_name": tenant_name.strip() or "Tenant",
        "tenant_address": tenant_address.strip() or "Tenant Address",
        "tenant_unit": tenant_unit.strip() or "",
        "landlord_name": landlord_name.strip() or "Landlord",
        "landlord_address": landlord_address.strip() or "Landlord Address",
        "letter_date": formatted_date,
    }

    try:
        analysis = gemini_analyze(
            image_bytes=image_bytes,
            complaint_text=complaint,
            language=language,
            tenant_info=tenant_info,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {exc}")

    try:
        pdf_bytes = generate_letter_pdf(analysis, tenant_info)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {exc}")

    # Include analysis summary in response headers for the frontend to read
    import json, urllib.parse
    summary = {
        "issue_type": analysis["issue_type"],
        "severity": analysis["severity"],
        "severity_reason": analysis["severity_reason"],
        "code_section": analysis["code_section"],
        "code_description": analysis["code_description"],
        "remediation": analysis["remediation"],
    }
    encoded = urllib.parse.quote(json.dumps(summary))

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="tenantshield_letter.pdf"',
            "X-Analysis-Summary": encoded,
            "Access-Control-Expose-Headers": "X-Analysis-Summary",
        },
    )
