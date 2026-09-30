try:
    import c2pa
except ImportError:
    c2pa = None
import json
import logging
from typing import Dict, Any, Tuple

logger = logging.getLogger(__name__)

class C2PAVerifier:
    """
    Enterprise engine for verifying Cryptographic Content Credentials (C2PA).
    Separates hard cryptographic proof from heuristic AI forensics.
    """
    
    @staticmethod
    def _determine_mime(file_name: str) -> str:
        ext = file_name.split('.')[-1].lower() if '.' in file_name else ''
        if ext in ['jpg', 'jpeg']:
            return "image/jpeg"
        elif ext == 'png':
            return "image/png"
        elif ext == 'webp':
            return "image/webp"
        elif ext == 'mp4':
            return "video/mp4"
        elif ext == 'wav':
            return "audio/wav"
        elif ext == 'mp3':
            return "audio/mpeg"
        return "application/octet-stream"

    @staticmethod
    def verify(file_path: str, file_name: str) -> Dict[str, Any]:
        mime_type = C2PAVerifier._determine_mime(file_name)
        
        result = {
            "status": "NO_C2PA",
            "has_c2pa": False,
            "manifest": {},
            "provenance": {},
            "actions": [],
            "verification": {},
            "warnings": []
        }

        if c2pa is None:
            return result

        try:
            with open(file_path, "rb") as f:
                try:
                    # Attempt to parse C2PA
                    reader = c2pa.Reader(mime_type, f)
                except Exception as e:
                    error_str = str(e)
                    if "unsupported" in error_str.lower() or "not found" in error_str.lower() or "missing" in error_str.lower():
                        return result
                    elif "NotSupported" in error_str:
                        result["status"] = "UNSUPPORTED"
                        result["warnings"].append(error_str)
                        return result
                    else:
                        result["status"] = "VERIFICATION_ERROR"
                        result["warnings"].append(error_str)
                        return result
                
                # If we get here, it parsed.
                try:
                    manifest_str = reader.json()
                    manifest = json.loads(manifest_str) if manifest_str else {}
                    
                    if not manifest:
                        return result

                    result["has_c2pa"] = True
                    result["manifest"] = manifest
                    
                    is_valid = reader.is_valid() if hasattr(reader, 'is_valid') else False
                    result["status"] = "VALID" if is_valid else "INVALID"
                    
                    val_results = reader.get_validation_results() if hasattr(reader, 'get_validation_results') else []
                    result["verification"] = {
                        "is_valid": is_valid,
                        "details": val_results
                    }
                    
                    # Extract high-level provenance
                    # E.g. assertions
                    active_manifest = manifest.get("active_manifest")
                    if active_manifest:
                        # Extract claims
                        assertions = manifest.get("manifests", {}).get(active_manifest, {}).get("assertions", [])
                        
                        for assertion in assertions:
                            label = assertion.get("label", "")
                            data = assertion.get("data", {})
                            
                            # Actions
                            if "c2pa.actions" in label:
                                result["actions"] = data.get("actions", [])
                            
                            # Software agent / device
                            if "stds.schema-org.CreativeWork" in label:
                                authors = data.get("author", [])
                                if authors and isinstance(authors, list):
                                    result["provenance"]["software_agent"] = authors[0].get("name")
                            
                            if "c2pa.created" in label:
                                result["provenance"]["created_at"] = data.get("date")

                    return result

                except Exception as e:
                    result["status"] = "VERIFICATION_ERROR"
                    result["warnings"].append(f"Error parsing manifest: {str(e)}")
                    return result
        except Exception as e:
            result["status"] = "VERIFICATION_ERROR"
            result["warnings"].append(f"Error reading file: {str(e)}")
            return result
