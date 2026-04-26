import io
from datetime import date
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    HRFlowable,
    Table,
    TableStyle,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER


SEVERITY_COLORS = {
    "Emergency": colors.HexColor("#DC2626"),
    "High": colors.HexColor("#EA580C"),
    "Medium": colors.HexColor("#D97706"),
    "Low": colors.HexColor("#16A34A"),
}

SEVERITY_BG = {
    "Emergency": colors.HexColor("#FEF2F2"),
    "High": colors.HexColor("#FFF7ED"),
    "Medium": colors.HexColor("#FFFBEB"),
    "Low": colors.HexColor("#F0FDF4"),
}


def generate_letter_pdf(analysis: dict, tenant_info: dict | None = None) -> bytes:
    """
    Render the formal complaint letter + violation summary as a PDF.
    Returns raw PDF bytes.
    """
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=LETTER,
        leftMargin=1 * inch,
        rightMargin=1 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Normal"],
        fontSize=20,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1E3A5F"),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "SubtitleStyle",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica",
        textColor=colors.HexColor("#64748B"),
        spaceAfter=0,
    )
    section_header_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Normal"],
        fontSize=11,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1E3A5F"),
        spaceBefore=14,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "BodyStyle",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica",
        leading=15,
        textColor=colors.HexColor("#1F2937"),
    )
    label_style = ParagraphStyle(
        "LabelStyle",
        parent=styles["Normal"],
        fontSize=9,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#6B7280"),
        spaceAfter=2,
    )
    value_style = ParagraphStyle(
        "ValueStyle",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica",
        textColor=colors.HexColor("#111827"),
        spaceAfter=6,
    )
    letter_style = ParagraphStyle(
        "LetterStyle",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica",
        leading=16,
        textColor=colors.HexColor("#1F2937"),
        spaceAfter=8,
    )

    story = []

    # Header
    story.append(Paragraph("TenantShield", title_style))
    story.append(Spacer(1, 0.05 * inch))
    story.append(Paragraph("Housing Rights Complaint Assistant", subtitle_style))
    story.append(Spacer(1, 0.15 * inch))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1E3A5F")))
    story.append(Spacer(1, 0.15 * inch))

    # Violation Summary Box
    severity = analysis.get("severity", "Unknown")
    sev_color = SEVERITY_COLORS.get(severity, colors.grey)
    sev_bg = SEVERITY_BG.get(severity, colors.white)

    summary_data = [
        [
            Paragraph("VIOLATION SUMMARY", ParagraphStyle(
                "SumHead", parent=styles["Normal"],
                fontSize=9, fontName="Helvetica-Bold",
                textColor=colors.HexColor("#6B7280"),
            )),
            Paragraph(f"SEVERITY: {severity.upper()}", ParagraphStyle(
                "SevHead", parent=styles["Normal"],
                fontSize=9, fontName="Helvetica-Bold",
                textColor=sev_color,
            )),
        ],
        [
            Paragraph(analysis.get("issue_type", ""), ParagraphStyle(
                "IssueType", parent=styles["Normal"],
                fontSize=14, fontName="Helvetica-Bold",
                textColor=colors.HexColor("#1E3A5F"),
            )),
            Paragraph(analysis.get("severity_reason", ""), ParagraphStyle(
                "SevReason", parent=styles["Normal"],
                fontSize=9, fontName="Helvetica",
                textColor=colors.HexColor("#374151"),
                leading=13,
            )),
        ],
    ]

    summary_table = Table(summary_data, colWidths=[2.8 * inch, 3.7 * inch])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), sev_bg),
        ("BOX", (0, 0), (-1, -1), 1.5, sev_color),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEAFTER", (0, 0), (0, -1), 1, sev_color),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 0.1 * inch))

    # Code section
    story.append(Paragraph("NYC Housing Code Violation", section_header_style))
    story.append(Paragraph("Code Section", label_style))
    story.append(Paragraph(analysis.get("code_section", ""), value_style))
    story.append(Paragraph("What the Law Requires", label_style))
    story.append(Paragraph(analysis.get("code_description", ""), value_style))
    story.append(Paragraph("Required Remediation", label_style))
    story.append(Paragraph(analysis.get("remediation", ""), value_style))

    story.append(Spacer(1, 0.1 * inch))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E5E7EB")))

    # Formal Letter
    story.append(Paragraph("Complaint Letter", section_header_style))

    letter_text = analysis.get("letter", "")
    for paragraph in letter_text.split("\n"):
        stripped = paragraph.strip()
        if stripped:
            story.append(Paragraph(stripped, letter_style))
        else:
            story.append(Spacer(1, 0.04 * inch))

    story.append(Spacer(1, 0.2 * inch))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E5E7EB")))
    story.append(Spacer(1, 0.08 * inch))
    story.append(Paragraph(
        f"Generated by TenantShield on {date.today().strftime('%B %d, %Y')} · "
        "For informational purposes only. Not legal advice.",
        ParagraphStyle(
            "Footer", parent=styles["Normal"],
            fontSize=8, fontName="Helvetica",
            textColor=colors.HexColor("#9CA3AF"),
            alignment=TA_CENTER,
        ),
    ))

    doc.build(story)
    return buffer.getvalue()
