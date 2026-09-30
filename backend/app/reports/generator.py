"""
Forensic Report Generator for RealCheck AI
Generates JSON, CSV, and structured printable HTML/PDF report formats.
"""
import io
import csv
import json
from typing import Dict, Any
from ..schemas.forensics import InvestigationResult

class ForensicReportGenerator:
    @staticmethod
    def generate_json(result: InvestigationResult) -> str:
        return result.model_dump_json(indent=2)

    @staticmethod
    def generate_csv(result: InvestigationResult) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(["REALCHECK AI - Digital Media Authenticity Forensic Report"])
        writer.writerow(["Case ID", result.case_id])
        writer.writerow(["Media Type", result.media_type])
        writer.writerow(["File Name", result.file_name])
        writer.writerow(["Authenticity Score", f"{result.authenticity_score}/100"])
        writer.writerow(["Assessment", result.assessment])
        writer.writerow(["Risk Level", result.risk_level])
        writer.writerow(["Confidence", f"{result.confidence_level} ({result.confidence_score * 100:.1f}%)"])
        writer.writerow(["Timestamp", result.timestamp])
        writer.writerow([])
        
        # Evidence signals table
        writer.writerow(["FORENSIC SIGNALS"])
        writer.writerow(["Signal Name", "Category", "Score", "Strength", "Status", "Affected Region/Time", "Explanation"])
        for s in result.signals:
            writer.writerow([s.name, s.category, f"{s.score:.1f}", s.strength, s.status, s.affected_region_or_time or "N/A", s.explanation])
            
        writer.writerow([])
        writer.writerow(["METADATA FINDINGS"])
        writer.writerow(["File Size", result.metadata.file_size_formatted])
        writer.writerow(["MIME Type", result.metadata.mime_type])
        writer.writerow(["SHA256 Hash", result.metadata.hash_sha256])
        writer.writerow(["Software Signature", result.metadata.software_signature or "None"])
        writer.writerow(["EXIF Present", "Yes" if result.metadata.exif_available else "No"])
        writer.writerow(["Metadata Risk Score", f"{result.metadata.metadata_risk_score}/100"])
        
        writer.writerow([])
        writer.writerow(["DISCLAIMER", result.disclaimer])
        return output.getvalue()

    @staticmethod
    def generate_html_docket(result: InvestigationResult) -> str:
        """Structured forensic printable report docket."""
        signals_rows = "".join([
            f"""<tr>
                <td><strong>{s.name}</strong></td>
                <td><span class="badge {s.strength.lower()}">{s.strength}</span></td>
                <td>{s.score:.1f}%</td>
                <td>{s.status}</td>
                <td>{s.explanation}</td>
            </tr>"""
            for s in result.signals
        ])

        return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>REALCHECK AI Forensic Report - {result.case_id}</title>
<style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #e2e8f0; padding: 40px; margin: 0; }}
    .report-container {{ max-width: 900px; margin: 0 auto; background: #111827; border: 1px solid #1e293b; border-radius: 8px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
    .header {{ border-bottom: 2px solid #06b6d4; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }}
    .logo {{ font-size: 24px; font-weight: 800; letter-spacing: 2px; color: #38bdf8; }}
    .case-id {{ font-family: monospace; font-size: 16px; color: #94a3b8; }}
    .verdict-box {{ background: #1e293b; border-radius: 6px; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; border-left: 6px solid {'#ef4444' if result.authenticity_score <= 30 else ('#f59e0b' if result.authenticity_score <= 60 else '#10b981')}; }}
    .verdict-title {{ font-size: 14px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }}
    .verdict-assessment {{ font-size: 26px; font-weight: 700; color: #f8fafc; margin-top: 4px; }}
    .score-badge {{ font-size: 32px; font-weight: 800; font-family: monospace; color: #38bdf8; text-align: right; }}
    .section-title {{ font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8; margin: 24px 0 12px; border-bottom: 1px solid #334155; padding-bottom: 6px; }}
    table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }}
    th, td {{ padding: 10px 12px; text-align: left; border-bottom: 1px solid #1e293b; }}
    th {{ background: #1e293b; color: #94a3b8; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }}
    .badge {{ display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }}
    .badge.strong {{ background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }}
    .badge.moderate {{ background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }}
    .badge.normal {{ background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }}
    .metadata-grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 13px; }}
    .meta-item {{ background: #1e293b; padding: 10px 14px; border-radius: 4px; }}
    .meta-label {{ color: #94a3b8; font-size: 11px; text-transform: uppercase; }}
    .meta-val {{ font-family: monospace; color: #f1f5f9; margin-top: 2px; word-break: break-all; }}
    .footer {{ margin-top: 36px; padding-top: 16px; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; text-align: center; }}
    @media print {{ body {{ background: white; color: black; padding: 0; }} .report-container {{ border: none; box-shadow: none; color: black; background: white; }} td, th {{ color: black !important; }} }}
</style>
</head>
<body>
<div class="report-container">
    <div class="header">
        <div>
            <div class="logo">REALCHECK AI</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Digital Media Authenticity & Forensic Analysis Platform</div>
        </div>
        <div style="text-align: right;">
            <div class="case-id">CASE: {result.case_id}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Generated: {result.timestamp}</div>
        </div>
    </div>

    <div class="verdict-box">
        <div>
            <div class="verdict-title">Model-Based Authenticity Assessment</div>
            <div class="verdict-assessment">{result.assessment}</div>
            <div style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Risk Level: <strong>{result.risk_level}</strong> | Confidence: <strong>{result.confidence_level} ({result.confidence_score * 100:.0f}%)</strong></div>
        </div>
        <div>
            <div class="score-badge">{result.authenticity_score} <span style="font-size: 14px; color: #64748b;">/ 100</span></div>
            <div style="font-size: 11px; color: #64748b; text-align: right; text-transform: uppercase;">Authenticity Index</div>
        </div>
    </div>

    <div class="section-title">Probabilistic Metrics Matrix</div>
    <div class="metadata-grid">
        <div class="meta-item"><div class="meta-label">AI Generation Probability</div><div class="meta-val" style="color: #f87171;">{result.ai_generation_probability:.1f}%</div></div>
        <div class="meta-item"><div class="meta-label">Manipulation Risk</div><div class="meta-val" style="color: #fbbf24;">{result.manipulation_risk:.1f}%</div></div>
        <div class="meta-item"><div class="meta-label">Forensic Anomaly Score</div><div class="meta-val">{result.forensic_anomaly_score:.1f}%</div></div>
        <div class="meta-item"><div class="meta-label">Metadata Risk Score</div><div class="meta-val">{result.metadata_risk_score:.1f}%</div></div>
    </div>

    <div class="section-title">Forensic Signals & Evidence Breakdown</div>
    <table>
        <thead>
            <tr>
                <th>Signal</th>
                <th>Strength</th>
                <th>Anomaly Score</th>
                <th>Status</th>
                <th>Forensic Explanation</th>
            </tr>
        </thead>
        <tbody>
            {signals_rows}
        </tbody>
    </table>

    <div class="section-title">Executive Interpretation</div>
    <div style="background: #1e293b; padding: 14px; border-radius: 6px; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">
        {result.why_result_explanation}
    </div>

    <div class="section-title">File & Cryptographic Provenance</div>
    <div class="metadata-grid">
        <div class="meta-item"><div class="meta-label">Target File Name</div><div class="meta-val">{result.file_name}</div></div>
        <div class="meta-item"><div class="meta-label">Media Type</div><div class="meta-val">{result.media_type}</div></div>
        <div class="meta-item"><div class="meta-label">File Size</div><div class="meta-val">{result.metadata.file_size_formatted}</div></div>
        <div class="meta-item"><div class="meta-label">MIME Container</div><div class="meta-val">{result.metadata.mime_type}</div></div>
        <div class="meta-item" style="grid-column: span 2;"><div class="meta-label">SHA-256 Checksum</div><div class="meta-val">{result.metadata.hash_sha256}</div></div>
    </div>

    <div class="section-title">Forensic Limitations & Methodology Notice</div>
    <div style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 16px;">
        {result.limitations}
    </div>

    <div class="footer">
        REALCHECK AI Forensic Verification Suite &bull; AI-assisted forensic assessment &mdash; not definitive proof &bull; {result.disclaimer}
    </div>
</div>
</body>
</html>"""
