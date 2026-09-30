"""
Walter Writes AI API Client
Integrates external AI text detection service via secure API key authorization.
"""
import logging
from typing import Dict, Any, Optional
import requests

from ...core.config import settings

logger = logging.getLogger(__name__)

class WalterWritesClient:
    """
    Client for interacting with Walter Writes AI text detection API.
    Uses 'X-API-Key' authentication header and parses detection probabilities.
    """
    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        timeout_seconds: int = 6
    ):
        self.api_key = settings.WALTER_API_KEY if api_key is None else api_key
        self.api_url = settings.WALTER_API_URL if api_url is None else api_url
        self.timeout_seconds = timeout_seconds

    @property
    def is_configured(self) -> bool:
        """Returns True if a valid-looking API key is configured."""
        return bool(self.api_key and len(self.api_key.strip()) > 8)

    def detect_ai(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Sends text content to the Walter Writes AI detector endpoint.
        Returns parsed AI probability and metadata, or None if unavailable/offline.
        """
        if not self.is_configured:
            return None

        # Walter Writes detector API requires a minimum of 50 words
        words = text.strip().split()
        if len(words) < 50:
            return None

        headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key.strip(),
            "User-Agent": "REALCHECK-AI-Forensics/3.0"
        }

        payload = {
            "content": text.strip()
        }

        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=self.timeout_seconds
            )

            if response.status_code == 200:
                data = response.json()
                # Parse standard fields from Walter Writes detector response
                ai_score = data.get("ai_score") or data.get("ai_probability") or data.get("score")
                if ai_score is None and "data" in data and isinstance(data["data"], dict):
                    ai_score = data["data"].get("ai_score") or data["data"].get("ai_probability")

                # Normalize to 0-100 percentage
                if isinstance(ai_score, (int, float)):
                    if 0.0 <= ai_score <= 1.0 and ai_score > 0:
                        ai_score = ai_score * 100.0
                    ai_score = round(float(ai_score), 2)
                else:
                    ai_score = None

                verdict = data.get("verdict") or data.get("status") or ("AI-Generated" if (ai_score and ai_score > 50) else "Human-Written")

                return {
                    "source": "Walter Writes AI",
                    "ai_score": ai_score,
                    "verdict": verdict,
                    "raw_response": data,
                    "status": "SUCCESS"
                }
            elif response.status_code in (401, 403):
                logger.warning("Walter Writes API authorization failed. Check WALTER_API_KEY.")
                return {"source": "Walter Writes AI", "status": "AUTH_ERROR", "error": "Invalid API key"}
            else:
                logger.warning("Walter Writes API responded with status %d: %s", response.status_code, response.text[:120])
                return None

        except requests.exceptions.Timeout:
            logger.warning("Walter Writes API timed out after %ds; falling back to local heuristics.", self.timeout_seconds)
            return None
        except requests.exceptions.RequestException as exc:
            logger.warning("Walter Writes API request failed: %s; falling back to local heuristics.", exc)
            return None
