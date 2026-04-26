import os
import json
import re
from pathlib import Path
from typing import Optional

import google.generativeai as genai
from PIL import Image
import io

PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "analyze_prompt.txt"

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-2.5-flash")


def _load_prompt(language: str, tenant_info: dict) -> str:
    template = PROMPT_PATH.read_text(encoding="utf-8")
    prompt = template.replace("{language}", language)
    prompt = prompt.replace("{tenant_name}", tenant_info.get("tenant_name", ""))
    prompt = prompt.replace("{tenant_address}", tenant_info.get("tenant_address", ""))
    prompt = prompt.replace("{tenant_unit}", tenant_info.get("tenant_unit", ""))
    prompt = prompt.replace("{landlord_name}", tenant_info.get("landlord_name", ""))
    prompt = prompt.replace("{landlord_address}", tenant_info.get("landlord_address", ""))
    prompt = prompt.replace("{letter_date}", tenant_info.get("letter_date", ""))
    return prompt


def _extract_json(text: str) -> dict:
    """Strip markdown fences if Gemini wraps the response anyway."""
    text = text.strip()
    # Remove ```json ... ``` or ``` ... ``` wrappers
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text)


def analyze(
    image_bytes: Optional[bytes],
    complaint_text: Optional[str],
    language: str = "English",
    tenant_info: Optional[dict] = None,
) -> dict:
    """
    Send image and/or complaint text to Gemini.
    Returns parsed analysis dict with keys:
      issue_type, severity, severity_reason, code_section,
      code_description, remediation, letter
    """
    if not image_bytes and not complaint_text:
        raise ValueError("At least one of image_bytes or complaint_text must be provided.")

    prompt = _load_prompt(language, tenant_info or {})

    parts: list = [prompt]

    if complaint_text:
        parts.append(f"\nTenant complaint description: {complaint_text}")

    if image_bytes:
        image = Image.open(io.BytesIO(image_bytes))
        parts.append(image)

    response = model.generate_content(parts)
    raw = response.text

    try:
        result = _extract_json(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Gemini returned non-JSON response: {raw[:500]}") from exc

    required_keys = {
        "issue_type", "severity", "severity_reason",
        "code_section", "code_description", "remediation", "letter",
    }
    missing = required_keys - result.keys()
    if missing:
        raise ValueError(f"Gemini response missing fields: {missing}")

    return result
