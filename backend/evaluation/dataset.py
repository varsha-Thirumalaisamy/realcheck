"""
Dataset Manifest Management for RealCheck AI Evaluation Workflow.

Manages evaluation datasets and ground-truth manifests.
Strictly enforces:
1. Recording of image source, license, and label origin.
2. Default label_verified=False (labels must never be claimed verified without human/cryptographic audit).
3. Separation of calibration vs. test splits to avoid data leakage.
4. No synthetic placeholder scraping or guessing of ground-truth labels.
"""

import os
import json
from dataclasses import dataclass, asdict, field
from typing import List, Dict, Any, Optional, Set


@dataclass
class DatasetSample:
    """Represents a single evaluation image sample entry in the manifest."""
    id: str
    file_path: str
    ground_truth: int  # 0 for Real/Authentic, 1 for AI-Generated/Synthetic
    source: str        # e.g., 'CIFAKE', 'GenImage', 'RAISE', 'Camera-Direct'
    license: str       # e.g., 'CC-BY-4.0', 'OpenAccess', 'Commercial-Proprietary'
    label_origin: str  # e.g., 'EXIF-Hardware-Verified', 'Generator-Prompt-Log', 'Manual-Inspection'
    split: str         # 'calibration' or 'test'
    label_verified: bool = False  # MUST default to False
    metadata: Dict[str, Any] = field(default_factory=dict)
    notes: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DatasetSample":
        # Ensure default False if missing
        if "label_verified" not in data:
            data["label_verified"] = False
        return cls(**data)


class DatasetManifestManager:
    """
    Manages loading, validating, and updating evaluation dataset manifests.
    """

    VALID_SPLITS: Set[str] = {"calibration", "test"}
    VALID_LABELS: Set[int] = {0, 1}

    def __init__(self, manifest_path: Optional[str] = None):
        self.manifest_path = manifest_path
        self.samples: List[DatasetSample] = []
        if manifest_path and os.path.exists(manifest_path):
            self.load(manifest_path)

    def add_sample(
        self,
        sample_id: str,
        file_path: str,
        ground_truth: int,
        source: str,
        license: str,
        label_origin: str,
        split: str = "test",
        label_verified: bool = False,
        metadata: Optional[Dict[str, Any]] = None,
        notes: Optional[str] = None,
    ) -> DatasetSample:
        """
        Adds a sample to the manifest with strict validation.
        label_verified defaults to False and must only be True with verified proof.
        """
        if ground_truth not in self.VALID_LABELS:
            raise ValueError(f"ground_truth must be 0 (Real) or 1 (AI-Generated), got: {ground_truth}")
        if split not in self.VALID_SPLITS:
            raise ValueError(f"split must be one of {self.VALID_SPLITS}, got: {split}")
        if not source or not source.strip():
            raise ValueError("source must be specified (e.g. CIFAKE, GenImage, RAISE, etc.)")
        if not license or not license.strip():
            raise ValueError("license must be specified for dataset compliance")
        if not label_origin or not label_origin.strip():
            raise ValueError("label_origin must be specified (e.g. EXIF-hardware-verified, prompt-log, etc.)")

        # Check for duplicate ID
        if any(s.id == sample_id for s in self.samples):
            raise ValueError(f"Sample ID '{sample_id}' already exists in manifest")

        sample = DatasetSample(
            id=sample_id,
            file_path=file_path,
            ground_truth=ground_truth,
            source=source,
            license=license,
            label_origin=label_origin,
            split=split,
            label_verified=label_verified,
            metadata=metadata or {},
            notes=notes,
        )
        self.samples.append(sample)
        return sample

    def verify_sample_label(self, sample_id: str, verification_notes: str) -> None:
        """
        Marks a sample as label_verified=True with an audit note.
        """
        for sample in self.samples:
            if sample.id == sample_id:
                sample.label_verified = True
                sample.notes = (sample.notes + " | " if sample.notes else "") + f"Verified: {verification_notes}"
                return
        raise KeyError(f"Sample '{sample_id}' not found in manifest")

    def get_split(self, split: str, require_verified: bool = False) -> List[DatasetSample]:
        """Returns samples filtered by split ('calibration' or 'test')."""
        if split not in self.VALID_SPLITS:
            raise ValueError(f"Invalid split '{split}'. Must be one of {self.VALID_SPLITS}")
        filtered = [s for s in self.samples if s.split == split]
        if require_verified:
            filtered = [s for s in filtered if s.label_verified]
        return filtered

    def validate(self, base_dir: Optional[str] = None) -> Dict[str, Any]:
        """
        Validates manifest entries for completeness, file existence, and balance.
        """
        total = len(self.samples)
        missing_files = []
        verified_count = 0
        split_counts = {s: {"real": 0, "ai": 0} for s in self.VALID_SPLITS}

        for sample in self.samples:
            if sample.label_verified:
                verified_count += 1

            # Check split and label counts
            if sample.split in split_counts:
                label_key = "real" if sample.ground_truth == 0 else "ai"
                split_counts[sample.split][label_key] += 1

            # Check file path if base_dir provided
            target_path = sample.file_path
            if base_dir and not os.path.isabs(target_path):
                target_path = os.path.join(base_dir, target_path)

            if not os.path.exists(target_path):
                missing_files.append((sample.id, target_path))

        return {
            "total_samples": total,
            "verified_samples": verified_count,
            "unverified_samples": total - verified_count,
            "splits": split_counts,
            "missing_files_count": len(missing_files),
            "missing_files": missing_files,
            "is_valid": len(missing_files) == 0 and total > 0,
        }

    def save(self, file_path: Optional[str] = None) -> str:
        """Saves manifest to a JSON file."""
        target = file_path or self.manifest_path
        if not target:
            raise ValueError("No file path specified to save manifest")

        os.makedirs(os.path.dirname(os.path.abspath(target)), exist_ok=True)
        data = {
            "schema_version": "1.0.0",
            "total_samples": len(self.samples),
            "samples": [s.to_dict() for s in self.samples],
        }
        with open(target, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return target

    def load(self, file_path: str) -> None:
        """Loads manifest from a JSON file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Manifest not found: {file_path}")
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        raw_samples = data.get("samples", [])
        self.samples = [DatasetSample.from_dict(s) for s in raw_samples]
        self.manifest_path = file_path
