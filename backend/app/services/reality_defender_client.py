"""
Reality Defender API Client for REALCHECK AI.
Integrates the official Reality Defender Deepfake & Synthetic Media Detection Platform.
(https://api.prd.realitydefender.xyz).
Securely interacts via X-API-KEY without logging or exposing secrets.
"""

import os
import logging
from typing import Dict, Any, Optional

from realitydefender import RealityDefender, RealityDefenderError
from ..core.config import settings

logger = logging.getLogger(__name__)


class RealityDefenderConfigurationError(ValueError):
    """Raised when REALITY_DEFENDER_API_KEY is missing or invalid."""
    pass


class RealityDefenderAuthenticationError(PermissionError):
    """Raised when Reality Defender rejects authentication (HTTP 401/403)."""
    pass


class RealityDefenderRateLimitError(RuntimeError):
    """Raised when Reality Defender rate limits or quota are exhausted (HTTP 429)."""
    pass


class RealityDefenderTimeoutError(TimeoutError):
    """Raised when the analysis times out."""
    pass


class RealityDefenderAPIError(RuntimeError):
    """Raised when Reality Defender returns an API or server error."""
    def __init__(self, message: str, status_code: Optional[int] = None, error_code: Optional[str] = None):
        super().__init__(message)
        self.status_code = status_code
        self.error_code = error_code


class RealityDefenderClient:
    """
    Client for interacting with the official Reality Defender detection platform.
    Encapsulates SDK instantiation, error mapping, and key protection.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout_seconds: int = 60
    ):
        self._api_key = (api_key or "").strip()
        self.base_url = (base_url or settings.REALITY_DEFENDER_API_URL or "https://api.prd.realitydefender.xyz").strip()
        self.timeout_seconds = timeout_seconds

    @property
    def effective_api_key(self) -> str:
        """Dynamically resolves API key from explicit arg, settings, or .env file."""
        if self._api_key:
            return self._api_key
        if settings.REALITY_DEFENDER_API_KEY and settings.REALITY_DEFENDER_API_KEY.strip():
            return settings.REALITY_DEFENDER_API_KEY.strip()
        env_key = os.getenv("REALITY_DEFENDER_API_KEY", "").strip()
        if env_key:
            return env_key
        try:
            from dotenv import load_dotenv
            load_dotenv(override=True)
            return os.getenv("REALITY_DEFENDER_API_KEY", "").strip()
        except Exception:
            return ""

    @property
    def is_configured(self) -> bool:
        """Returns True if a non-empty Reality Defender key is present."""
        key = self.effective_api_key
        return bool(key and len(key) > 5)

    def detect_file(self, file_path: str) -> Dict[str, Any]:
        """
        Uploads and detects a media file using official Reality Defender SDK.

        Args:
            file_path: Absolute local path to the media file

        Returns:
            Dict containing request_id, status, score, models, heatmaps
        """
        if not self.is_configured:
            raise RealityDefenderConfigurationError(
                "AI model is not configured. Add REALITY_DEFENDER_API_KEY to backend/.env."
            )

        if not file_path or not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            # Initialize SDK with isolated key (never logged)
            rd = RealityDefender(
                api_key=self.effective_api_key,
                base_url=self.base_url
            )
            raw_result = rd.detect_file(file_path=file_path)
            
            if not isinstance(raw_result, dict):
                raise RealityDefenderAPIError("Invalid response format received from Reality Defender.")

            return raw_result

        except RealityDefenderError as rde:
            err_code = getattr(rde, "code", "") or ""
            msg = str(rde.message) if hasattr(rde, "message") else str(rde)

            if "unauthorized" in err_code.lower() or "invalid api key" in msg.lower():
                raise RealityDefenderAuthenticationError(
                    "AI API authentication failed. Check REALITY_DEFENDER_API_KEY in backend/.env."
                )
            elif "rate_limit" in err_code.lower() or "429" in msg:
                raise RealityDefenderRateLimitError(
                    "AI API rate limit reached. Try again later."
                )
            elif "timeout" in err_code.lower():
                raise RealityDefenderTimeoutError(
                    "Unable to reach AI inference service: Reality Defender analysis timed out."
                )
            elif "invalid_file" in err_code.lower():
                raise ValueError(f"Invalid image/request format: {msg}")
            else:
                raise RealityDefenderAPIError(
                    f"Reality Defender error ({err_code}): {msg}",
                    error_code=err_code
                )
        except Exception as e:
            if isinstance(e, (RealityDefenderConfigurationError, RealityDefenderAuthenticationError, RealityDefenderRateLimitError, RealityDefenderTimeoutError, ValueError, FileNotFoundError)):
                raise e
            raise RealityDefenderAPIError(f"Reality Defender connection failure: {str(e)}")
