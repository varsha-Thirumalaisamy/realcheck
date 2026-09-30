/**
 * Sample Benchmark Investigation Cases for REALCHECK AI
 * Includes both synthetic/manipulated and authentic reference cases across 4 media types.
 */
import { InvestigationResult } from '../types/forensics';

export const SAMPLE_CASES: Record<string, InvestigationResult> = {
  // 1. IMAGE: AI Generated (RC-2026-0042)
  'RC-2026-0042': {
    case_id: 'RC-2026-0042',
    media_type: 'IMAGE',
    file_name: 'synthetic_portrait_v6.png',
    sample_type: 'ai',
    assessment: 'Likely AI-Generated',
    authenticity_score: 23,
    risk_level: 'High Risk',
    confidence_level: 'High',
    confidence_score: 0.91,
    is_demo_analysis: true,
    disclaimer: 'Prototype / Demonstration Analysis. Results are probabilistic forensic indicators, not absolute proof.',
    timestamp: '2026-09-24T08:14:22Z',
    ai_generation_probability: 91.0,
    manipulation_risk: 64.0,
    forensic_anomaly_score: 76.0,
    metadata_risk_score: 18.0,
    signals: [
      {
        name: 'Facial Boundary Continuity',
        category: 'texture',
        score: 89.4,
        weight: 0.25,
        strength: 'Strong',
        status: 'Anomaly Detected',
        explanation: 'The model detected statistical gradient discontinuities and unnatural skin blending along the ear and jawline perimeter.',
        affected_region_or_time: 'Face perimeter (x: 32%, y: 22%)',
        model_contribution_pct: 34.0
      },
      {
        name: 'Fourier High-Frequency Roll-Off',
        category: 'frequency',
        score: 84.2,
        weight: 0.20,
        strength: 'Strong',
        status: 'Suspicious Pattern',
        explanation: 'Azimuthal spectral averaging reveals uncharacteristic high-frequency checkerboard artifacts typical of latent diffusion upsamplers.',
        affected_region_or_time: 'Global frequency domain',
        model_contribution_pct: 26.0
      },
      {
        name: 'Local Noise Residual (PRNU)',
        category: 'texture',
        score: 76.8,
        weight: 0.20,
        strength: 'Moderate',
        status: 'Anomaly Detected',
        explanation: 'Absence of continuous Photo-Response Non-Uniformity (PRNU) sensor fingerprint; synthetic Gaussian noise floor.',
        affected_region_or_time: 'Background & midtones',
        model_contribution_pct: 22.0
      },
      {
        name: 'Corneal Specular Reflection Angle',
        category: 'cv',
        score: 71.5,
        weight: 0.15,
        strength: 'Moderate',
        status: 'Suspicious Pattern',
        explanation: 'Reflection vectors between left and right iris deviate by 42 degrees, indicating contradictory simulated light sources.',
        affected_region_or_time: 'Corneal reflection (Iris L/R)',
        model_contribution_pct: 10.0
      },
      {
        name: 'EXIF & Color Space Metadata',
        category: 'metadata',
        score: 18.0,
        weight: 0.10,
        strength: 'Weak',
        status: 'Inconclusive',
        explanation: 'Header indicates sRGB standard with stripped camera tag. No editing software header detected.',
        affected_region_or_time: 'File Header',
        model_contribution_pct: 8.0
      }
    ],
    evidence_breakdown: [
      {
        title: 'Texture Anomaly',
        status: 'Elevated Risk',
        score: 88.0,
        risk: 'High Risk',
        explanation: 'Micro-texture smoothing detected on facial epidermis with loss of natural pore structures.',
        category: 'texture'
      },
      {
        title: 'Pixel Pattern Anomaly',
        status: 'Elevated Risk',
        score: 82.0,
        risk: 'High Risk',
        explanation: 'Unnatural pixel covariance across 8x8 blocks inconsistent with Bayer filter demosaicing.',
        category: 'pixel'
      },
      {
        title: 'Frequency Signature',
        status: 'Elevated Risk',
        score: 84.0,
        risk: 'High Risk',
        explanation: 'Strong peaks at harmonic frequencies indicative of generative deconvolution grids.',
        category: 'frequency'
      },
      {
        title: 'Noise Pattern',
        status: 'Elevated Risk',
        score: 76.0,
        risk: 'High Risk',
        explanation: 'Synthetic noise residuals failing real silicon sensor photon shot noise models.',
        category: 'noise'
      },
      {
        title: 'Metadata Consistency',
        status: 'Normal / Neutral',
        score: 18.0,
        risk: 'Low Risk',
        explanation: 'Standard web export profile without embedded generative prompts. Metadata is supporting evidence only.',
        category: 'metadata'
      },
      {
        title: 'Manipulation Evidence',
        status: 'Elevated Risk',
        score: 64.0,
        risk: 'Medium Risk',
        explanation: 'Potential inpainting or generative synthesis across central subject bounding box.',
        category: 'manipulation'
      }
    ],
    suspicious_regions: [
      {
        id: 'reg-img-1',
        label: 'FACE REGION',
        confidence: 0.92,
        coordinates: { x: 30.0, y: 18.0, width: 40.0, height: 45.0 },
        anomaly_type: 'Generative Diffusion Artifacts',
        explanation: 'The model detected statistical inconsistencies around facial boundaries and high-frequency texture regions.'
      },
      {
        id: 'reg-img-2',
        label: 'HAIR BOUNDARY',
        confidence: 0.88,
        coordinates: { x: 28.0, y: 12.0, width: 44.0, height: 18.0 },
        anomaly_type: 'Boundary Blending Dissolution',
        explanation: 'Hair strand terminations dissolve into ambient background without physical optical depth attenuation.'
      },
      {
        id: 'reg-img-3',
        label: 'BACKGROUND',
        confidence: 0.74,
        coordinates: { x: 5.0, y: 65.0, width: 90.0, height: 30.0 },
        anomaly_type: 'Depth-of-field Incoherence',
        explanation: 'Synthesized bokeh exhibits sharp geometric anomalies and contradictory blur gradients.'
      }
    ],
    metadata: {
      file_name: 'synthetic_portrait_v6.png',
      file_size_formatted: '2.4 MB',
      mime_type: 'image/png',
      dimensions: '2048 x 2048',
      creation_time: '2026-09-20 14:12:00 UTC',
      software_signature: 'None / Web Re-encoded',
      camera_model: 'Not detected',
      exif_available: false,
      editing_software_indicator: 'None explicit',
      hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      metadata_risk_score: 18.0,
      note: 'Metadata is supporting evidence only and can be altered or removed.'
    },
    why_result_explanation: 'The primary driver for this assessment is the convergence of high-frequency Fourier spectral anomalies and facial boundary gradient tears. The pixel covariance matrix exhibits patterns characteristic of latent diffusion models rather than physical CMOS optical capture.',
    top_contributing_signals: [
      { signal: 'Facial Boundary Inconsistency', impact: 'Strong', weight: '34%' },
      { signal: 'Fourier Spectral Roll-Off', impact: 'Strong', weight: '26%' },
      { signal: 'PRNU Noise Sensor Absence', impact: 'Moderate', weight: '22%' },
      { signal: 'Corneal Reflection Asymmetry', impact: 'Moderate', weight: '10%' },
      { signal: 'EXIF Metadata Absence', impact: 'Weak', weight: '8%' }
    ],
    limitations: 'Analysis is probabilistic. Highly compressed or aggressively filtered authentic photos may produce elevated false positive noise signals.'
  },

  // 2. IMAGE: Authentic Photo (RC-2026-0046)
  'RC-2026-0046': {
    case_id: 'RC-2026-0046',
    media_type: 'IMAGE',
    file_name: 'nikon_d850_outdoor_portrait.jpg',
    sample_type: 'real',
    assessment: 'Likely Authentic',
    authenticity_score: 92,
    risk_level: 'Low Risk',
    confidence_level: 'High',
    confidence_score: 0.94,
    is_demo_analysis: true,
    disclaimer: 'Prototype / Demonstration Analysis. Forensic indicators show high consistency with physical optical capture.',
    timestamp: '2026-09-24T08:55:10Z',
    ai_generation_probability: 6.0,
    manipulation_risk: 9.0,
    forensic_anomaly_score: 11.0,
    metadata_risk_score: 5.0,
    signals: [
      {
        name: 'PRNU Sensor Noise Fingerprint',
        category: 'texture',
        score: 8.0,
        weight: 0.35,
        strength: 'Normal',
        status: 'Within Normal Variance',
        explanation: 'Verified presence of camera sensor photo-response non-uniformity consistent with physical silicon sensor noise.',
        model_contribution_pct: 40.0
      },
      {
        name: 'Optical Bayer Demosaicing Covariance',
        category: 'pixel',
        score: 12.0,
        weight: 0.25,
        strength: 'Normal',
        status: 'Within Normal Variance',
        explanation: 'Sub-pixel interpolation aligns with standard 2x2 Bayer RGB CFA demosaicing algorithms.',
        model_contribution_pct: 25.0
      },
      {
        name: 'EXIF Camera Hardware Profile',
        category: 'metadata',
        score: 5.0,
        weight: 0.20,
        strength: 'Normal',
        status: 'Within Normal Variance',
        explanation: 'Rich EXIF metadata present: Nikon D850, 85mm f/1.4 lens, 1/500s, ISO 100. Serial number matches.',
        model_contribution_pct: 20.0
      },
      {
        name: 'Natural Depth-of-Field Gradient',
        category: 'cv',
        score: 9.0,
        weight: 0.20,
        strength: 'Normal',
        status: 'Within Normal Variance',
        explanation: 'Circle of confusion scales proportionally with optical focal plane distance.',
        model_contribution_pct: 15.0
      }
    ],
    evidence_breakdown: [
      {
        title: 'Sensor Noise Consistency',
        status: 'Verified Natural',
        score: 8.0,
        risk: 'Low Risk',
        explanation: 'Physical photon shot noise and PRNU fingerprints verified across all color channels.',
        category: 'noise'
      },
      {
        title: 'Frequency Distribution',
        status: 'Natural Falloff',
        score: 11.0,
        risk: 'Low Risk',
        explanation: 'Radial Fourier spectrum displays smooth 1/f power law distribution typical of authentic physical scenes.',
        category: 'frequency'
      },
      {
        title: 'Camera EXIF Heritage',
        status: 'Full Heritage Intact',
        score: 5.0,
        risk: 'Low Risk',
        explanation: 'Original camera manufacturer MakerNotes and lens calibration profiles present.',
        category: 'metadata'
      }
    ],
    metadata: {
      file_name: 'nikon_d850_outdoor_portrait.jpg',
      file_size_formatted: '8.4 MB',
      mime_type: 'image/jpeg',
      dimensions: '8256 x 5504',
      creation_time: '2026-09-18 10:15:32 UTC',
      software_signature: 'Nikon D850 Firmware v1.20',
      camera_model: 'Nikon D850 (Nikkor 85mm f/1.4G)',
      exif_available: true,
      editing_software_indicator: 'None / Direct Sensor Capture',
      hash_sha256: '129048a1290371bc89a27891ce3b0c44298fc1c149afbf4c8996fb92427ae41e',
      metadata_risk_score: 5.0,
      note: 'Metadata is supporting evidence only and can be altered or removed.'
    },
    why_result_explanation: 'Physical optical and sensor signatures are completely consistent across all inspection dimensions. Natural Bayer demosaicing patterns, lens chromatic aberration gradients, and camera PRNU noise corroborate authentic capture.',
    top_contributing_signals: [
      { signal: 'PRNU Sensor Noise Fingerprint', impact: 'Strong Support', weight: '40%' },
      { signal: 'Bayer Demosaicing Covariance', impact: 'Moderate Support', weight: '25%' },
      { signal: 'EXIF Camera Hardware Profile', impact: 'Moderate Support', weight: '20%' },
      { signal: 'Optical Depth-of-field Gradient', impact: 'Normal Support', weight: '15%' }
    ],
    limitations: 'Authentic assessment applies to tested image file. Analog manipulation prior to capture cannot be ruled out by digital forensics.'
  },

  // 3. VIDEO: AI Manipulated / Deepfake (RC-2026-0043)
  'RC-2026-0043': {
    case_id: 'RC-2026-0043',
    media_type: 'VIDEO',
    file_name: 'press_statement_clip.mp4',
    sample_type: 'ai',
    assessment: 'Likely AI-Manipulated',
    authenticity_score: 31,
    risk_level: 'High Risk',
    confidence_level: 'High',
    confidence_score: 0.88,
    is_demo_analysis: true,
    disclaimer: 'Prototype / Demonstration Analysis. Probabilistic forensic indicator, not absolute proof.',
    timestamp: '2026-09-24T08:22:15Z',
    ai_generation_probability: 87.0,
    manipulation_risk: 85.0,
    forensic_anomaly_score: 82.0,
    metadata_risk_score: 25.0,
    signals: [
      {
        name: 'Temporal Face Stability',
        category: 'temporal',
        score: 91.0,
        weight: 0.30,
        strength: 'Strong',
        status: 'Anomaly Detected',
        explanation: 'Inter-frame structural warping detected between timestamps 00:08 and 00:11; facial landmark trajectories jitter unnaturally.',
        affected_region_or_time: '00:08 - 00:11',
        model_contribution_pct: 38.0
      },
      {
        name: 'Audio-Visual Lip Synchronization',
        category: 'multimodal',
        score: 84.5,
        weight: 0.25,
        strength: 'Strong',
        status: 'Suspicious Pattern',
        explanation: 'Phoneme-to-viseme temporal offset exceeds human phonetic thresholds by 120ms during accented syllables.',
        affected_region_or_time: '00:09 - 00:14',
        model_contribution_pct: 28.0
      },
      {
        name: 'Facial Boundary Blending',
        category: 'texture',
        score: 79.2,
        weight: 0.20,
        strength: 'Moderate',
        status: 'Anomaly Detected',
        explanation: 'Color transfer artifacts and resolution mismatch between target face bounding box and surrounding neck skin tone.',
        affected_region_or_time: 'Jawline & Neck',
        model_contribution_pct: 20.0
      },
      {
        name: 'Blink & Gaze Micro-Dynamics',
        category: 'cv',
        score: 68.0,
        weight: 0.15,
        strength: 'Moderate',
        status: 'Suspicious Pattern',
        explanation: 'Blink intervals deviate from natural physiological Poisson distribution; micro-saccades absent.',
        affected_region_or_time: 'Ocular region',
        model_contribution_pct: 10.0
      },
      {
        name: 'Video Container & GOP Structure',
        category: 'metadata',
        score: 25.0,
        weight: 0.10,
        strength: 'Weak',
        status: 'Within Normal Variance',
        explanation: 'Standard H.264 / AVC container with regular I-frame intervals. No proprietary editing software tags.',
        affected_region_or_time: 'Global Stream',
        model_contribution_pct: 4.0
      }
    ],
    evidence_breakdown: [
      {
        title: 'Deepfake Risk',
        status: 'Elevated Risk',
        score: 87.0,
        risk: 'High Risk',
        explanation: 'Neural face-swap signatures detected on primary speaker face track.',
        category: 'deepfake'
      },
      {
        title: 'Frame Anomaly',
        status: 'Elevated Risk',
        score: 83.0,
        risk: 'High Risk',
        explanation: 'Unusual pixel variance spikes localized to face bounding box during frames 240-330.',
        category: 'frame'
      },
      {
        title: 'Face Manipulation Risk',
        status: 'Elevated Risk',
        score: 85.0,
        risk: 'High Risk',
        explanation: 'Boundary seam feathering around chin perimeter indicates post-rendered composite overlay.',
        category: 'face'
      },
      {
        title: 'Lip-Sync Risk',
        status: 'Elevated Risk',
        score: 78.0,
        risk: 'High Risk',
        explanation: 'Viseme timing lag suggests synthetic speech re-dubbing or neural mouth synthesis.',
        category: 'lipsync'
      },
      {
        title: 'Temporal Inconsistency',
        status: 'Elevated Risk',
        score: 82.0,
        risk: 'High Risk',
        explanation: 'Frame-to-frame optical flow vectors on cheek textures display non-rigid jitter.',
        category: 'temporal'
      }
    ],
    suspicious_segments: [
      {
        start_time: '00:00',
        end_time: '00:07',
        start_seconds: 0.0,
        end_seconds: 7.0,
        risk_level: 'Normal',
        anomaly_type: 'Baseline Video',
        description: 'Optical flow and facial landmark consistency remain within typical human baseline tolerance.'
      },
      {
        start_time: '00:08',
        end_time: '00:11',
        start_seconds: 8.0,
        end_seconds: 11.0,
        risk_level: 'High',
        anomaly_type: 'Facial Warping & Seam Feathering',
        description: 'Critical suspicion window: high landmark drift, lip-sync misalignment, and boundary blurring.'
      },
      {
        start_time: '00:12',
        end_time: '00:15',
        start_seconds: 12.0,
        end_seconds: 15.0,
        risk_level: 'Amber',
        anomaly_type: 'Residual Lip Incoherence',
        description: 'Mouth shape transitions show slight temporal latency compared to speech waveform peaks.'
      },
      {
        start_time: '00:16',
        end_time: '00:20',
        start_seconds: 16.0,
        end_seconds: 20.0,
        risk_level: 'Normal',
        anomaly_type: 'Normalized Tracking',
        description: 'Landmarks stabilize; minor residual motion blur consistent with camera pan.'
      }
    ],
    metadata: {
      file_name: 'press_statement_clip.mp4',
      file_size_formatted: '14.8 MB',
      mime_type: 'video/mp4',
      dimensions: '1920 x 1080',
      duration: '00:20 (600 frames @ 30fps)',
      creation_time: '2026-09-22 19:40:12 UTC',
      software_signature: 'Lavf58.76.100 (FFmpeg)',
      camera_model: 'Not detectable in stream',
      exif_available: false,
      editing_software_indicator: 'FFmpeg transcode stream detected',
      hash_sha256: '4f8a3c899321ef18b14249a31a980ec89f1092a83e0c012847291a271891b29a',
      metadata_risk_score: 25.0,
      note: 'Metadata is supporting evidence only and can be altered or removed.'
    },
    why_result_explanation: 'Suspicious visual inconsistencies were detected around facial boundaries, specifically during timestamps 00:08 through 00:11. Spatial landmark covariance and phoneme-viseme temporal alignment deviate significantly from authentic human recordings.',
    top_contributing_signals: [
      { signal: 'Temporal Face Landmark Stability', impact: 'Strong', weight: '38%' },
      { signal: 'Audio-Visual Lip Synchronization', impact: 'Strong', weight: '28%' },
      { signal: 'Facial Boundary Blending Seam', impact: 'Moderate', weight: '20%' },
      { signal: 'Blink Micro-Dynamics Distribution', impact: 'Moderate', weight: '10%' },
      { signal: 'Container & GOP Structure', impact: 'Weak', weight: '4%' }
    ],
    limitations: 'Heavy video compression (such as Twitter/WhatsApp re-encoding) can introduce frame drops and compression blocking that resemble temporal anomalies.'
  },

  // 4. VIDEO: Authentic Broadcast (RC-2026-0047)
  'RC-2026-0047': {
    case_id: 'RC-2026-0047',
    media_type: 'VIDEO',
    file_name: 'broadcast_news_camera_raw.mp4',
    sample_type: 'real',
    assessment: 'Likely Authentic',
    authenticity_score: 88,
    risk_level: 'Low Risk',
    confidence_level: 'High',
    confidence_score: 0.90,
    is_demo_analysis: true,
    disclaimer: 'Prototype / Demonstration Analysis. Forensic indicators show continuous spatio-temporal integrity.',
    timestamp: '2026-09-24T08:30:10Z',
    ai_generation_probability: 8.0,
    manipulation_risk: 12.0,
    forensic_anomaly_score: 14.0,
    metadata_risk_score: 8.0,
    signals: [
      {
        name: 'Temporal Face Landmark Stability',
        category: 'temporal',
        score: 10.0,
        weight: 0.35,
        strength: 'Normal',
        status: 'Within Normal Variance',
        explanation: 'Smooth 3D head pose matrix trajectories adhering to biological biomechanics.',
        model_contribution_pct: 40.0
      },
      {
        name: 'Audio-Visual Sync (Phoneme-Viseme)',
        category: 'multimodal',
        score: 8.0,
        weight: 0.30,
        strength: 'Normal',
        status: 'Within Normal Variance',
        explanation: 'Lip closure moments strictly align with bilabial plosives (/p/, /b/, /m/) within +/- 15ms.',
        model_contribution_pct: 35.0
      },
      {
        name: 'Natural Physiological Blink Rate',
        category: 'cv',
        score: 12.0,
        weight: 0.20,
        strength: 'Normal',
        status: 'Within Normal Variance',
        explanation: 'Spontaneous blinks occur at 16 per minute with natural asymmetric lid velocities.',
        model_contribution_pct: 15.0
      }
    ],
    evidence_breakdown: [
      {
        title: 'Temporal Consistency',
        status: 'Smooth Trajectory',
        score: 10.0,
        risk: 'Low Risk',
        explanation: 'No inter-frame landmark jitter or face replacement seam boundary artifacts.',
        category: 'temporal'
      },
      {
        title: 'Lip-Sync Alignment',
        status: 'Precise Human Timing',
        score: 8.0,
        risk: 'Low Risk',
        explanation: 'Acoustic audio waveforms correlate tightly with optical mouth visemes.',
        category: 'lipsync'
      }
    ],
    suspicious_segments: [
      {
        start_time: '00:00',
        end_time: '00:20',
        start_seconds: 0.0,
        end_seconds: 20.0,
        risk_level: 'Normal',
        anomaly_type: 'Authentic Continuous Stream',
        description: 'Consistent optical flow and natural facial illumination throughout full duration.'
      }
    ],
    metadata: {
      file_name: 'broadcast_news_camera_raw.mp4',
      file_size_formatted: '28.2 MB',
      mime_type: 'video/mp4',
      dimensions: '1920 x 1080',
      duration: '00:20 (600 frames @ 29.97fps)',
      creation_time: '2026-09-21 15:10:00 UTC',
      software_signature: 'Sony XDCAM HD422',
      camera_model: 'Sony PXW-Z280',
      exif_available: true,
      editing_software_indicator: 'None / Camera Direct Capture',
      hash_sha256: '9918237190283719827391823719823719827391823719823719823719823719',
      metadata_risk_score: 8.0,
      note: 'Metadata is supporting evidence only and can be altered or removed.'
    },
    why_result_explanation: 'Video sequence displays continuous natural optical flow vectors, tight acoustic-visual synchronization, and physiological ocular micro-saccades.',
    top_contributing_signals: [
      { signal: 'Temporal Landmark Stability', impact: 'Strong Support', weight: '40%' },
      { signal: 'Phoneme-Viseme Synchronization', impact: 'Strong Support', weight: '35%' },
      { signal: 'Natural Blink Frequency', impact: 'Moderate Support', weight: '15%' }
    ],
    limitations: 'Advanced frame-level inpainting restricted to tiny static background areas could be masked by global flow consistency.'
  },

  // 5. AUDIO: AI Generated / Voice Clone (RC-2026-0044)
  'RC-2026-0044': {
    case_id: 'RC-2026-0044',
    media_type: 'AUDIO',
    file_name: 'ceo_voicemail_intercept.wav',
    sample_type: 'ai',
    assessment: 'Likely AI-Generated',
    authenticity_score: 26,
    risk_level: 'High Risk',
    confidence_level: 'High',
    confidence_score: 0.89,
    is_demo_analysis: true,
    disclaimer: 'Prototype / Demonstration Analysis. Probabilistic forensic indicator, not absolute proof.',
    timestamp: '2026-09-24T08:35:50Z',
    ai_generation_probability: 89.0,
    manipulation_risk: 68.0,
    forensic_anomaly_score: 76.0,
    metadata_risk_score: 15.0,
    signals: [
      {
        name: 'Mel-Spectrogram Harmonic Continuity',
        category: 'acoustic',
        score: 92.3,
        weight: 0.35,
        strength: 'Strong',
        status: 'Anomaly Detected',
        explanation: 'Formant transitions between 00:17 and 00:21 exhibit hyper-smooth synthetic interpolations with absence of physiological vocal tract resonance.',
        affected_region_or_time: '00:17 - 00:21',
        model_contribution_pct: 42.0
      },
      {
        name: 'Pitch Micro-Perturbation (Zero Jitter)',
        category: 'acoustic',
        score: 86.0,
        weight: 0.25,
        strength: 'Strong',
        status: 'Suspicious Pattern',
        explanation: 'Human vocal fold vibration typically demonstrates involuntary micro-pitch jitter (0.5%-1.2%). This sample exhibits near-zero stochastic jitter.',
        affected_region_or_time: '00:05 - 00:24',
        model_contribution_pct: 30.0
      },
      {
        name: 'Aspiration & Breath Inhalation Absence',
        category: 'acoustic',
        score: 74.0,
        weight: 0.20,
        strength: 'Moderate',
        status: 'Suspicious Pattern',
        explanation: 'Synthesized speech streams lack spontaneous pulmonary inhalation pauses between consecutive dependent clauses.',
        affected_region_or_time: 'Inter-clause pauses',
        model_contribution_pct: 18.0
      },
      {
        name: 'High-Frequency Phase Incoherence',
        category: 'frequency',
        score: 68.5,
        weight: 0.15,
        strength: 'Moderate',
        status: 'Anomaly Detected',
        explanation: 'Vocoder synthesis artifacts identified above 7.8 kHz, consistent with neural HiFi-GAN/DiffWave audio generation.',
        affected_region_or_time: '7.8 kHz - 16 kHz band',
        model_contribution_pct: 8.0
      }
    ],
    evidence_breakdown: [
      {
        title: 'AI Voice Risk',
        status: 'Elevated Risk',
        score: 89.0,
        risk: 'High Risk',
        explanation: 'Neural text-to-speech / voice conversion acoustic fingerprints identified.',
        category: 'synthetic_voice'
      },
      {
        title: 'Audio Anomaly',
        status: 'Elevated Risk',
        score: 76.0,
        risk: 'High Risk',
        explanation: 'Hyper-regular fundamental pitch contours and non-physiological formant glides.',
        category: 'acoustic'
      },
      {
        title: 'Manipulation Risk',
        status: 'Elevated Risk',
        score: 68.0,
        risk: 'High Risk',
        explanation: 'Splice boundaries and spectral mismatch around 00:17 indicating inserted clone segment.',
        category: 'splice'
      },
      {
        title: 'Voice Consistency',
        status: 'Elevated Risk',
        score: 81.0,
        risk: 'High Risk',
        explanation: 'Speaker embedding vector drifts abruptly at segment boundary 00:17.',
        category: 'biometric'
      }
    ],
    suspicious_segments: [
      {
        start_time: '00:00',
        end_time: '00:16',
        start_seconds: 0.0,
        end_seconds: 16.0,
        risk_level: 'Normal',
        anomaly_type: 'Natural Voice Track',
        description: 'Acoustic harmonics and human breath cadence remain consistent with natural speaker reference.'
      },
      {
        start_time: '00:17',
        end_time: '00:21',
        start_seconds: 17.0,
        end_seconds: 21.0,
        risk_level: 'High',
        anomaly_type: 'Synthetic Voice Cloning Segment',
        description: 'Primary suspicion zone: spectral flattening, neural vocoder phase artifacts, zero jitter.'
      },
      {
        start_time: '00:22',
        end_time: '00:28',
        start_seconds: 22.0,
        end_seconds: 28.0,
        risk_level: 'Normal',
        anomaly_type: 'Returned Baseline',
        description: 'Audio features return to room baseline reverberation parameters.'
      }
    ],
    metadata: {
      file_name: 'ceo_voicemail_intercept.wav',
      file_size_formatted: '4.7 MB',
      mime_type: 'audio/wav',
      duration: '00:28',
      creation_time: '2026-09-23 11:05:00 UTC',
      software_signature: 'Broadcast Wave Format',
      camera_model: undefined,
      exif_available: false,
      editing_software_indicator: 'None detected',
      hash_sha256: '7c5a21808e0a3901bca0921472890471b09280018947291a271891b29a27891c',
      metadata_risk_score: 15.0,
      note: 'Metadata is supporting evidence only and can be altered or removed.'
    },
    why_result_explanation: 'Acoustic analysis reveals characteristic neural vocoder signatures between 00:17 and 00:21. The fundamental frequency (F0) exhibits unnatural pitch rigidity and formants lack natural vocal tract inertia.',
    top_contributing_signals: [
      { signal: 'Mel-Spectrogram Harmonic Continuity', impact: 'Strong', weight: '42%' },
      { signal: 'Pitch Micro-Perturbation (Zero Jitter)', impact: 'Strong', weight: '30%' },
      { signal: 'Absence of Natural Breath Inhalation', impact: 'Moderate', weight: '18%' },
      { signal: 'High-Frequency Vocoder Phase Drift', impact: 'Moderate', weight: '8%' }
    ],
    limitations: 'Telephone band-pass filtering (300Hz-3.4kHz) or lossy MP3 compression can remove natural human vocal subtleties and cause elevated false alarms.'
  },

  // 6. TEXT: AI Assisted (RC-2026-0045)
  'RC-2026-0045': {
    case_id: 'RC-2026-0045',
    media_type: 'TEXT',
    file_name: 'executive_brief_memo.txt',
    sample_type: 'ai',
    assessment: 'Likely AI-Assisted',
    authenticity_score: 38,
    risk_level: 'Medium Risk',
    confidence_level: 'Moderate',
    confidence_score: 0.78,
    is_demo_analysis: true,
    disclaimer: 'Prototype / Demonstration Analysis. AI-writing detection is probabilistic and cannot reliably prove authorship.',
    timestamp: '2026-09-24T08:48:30Z',
    ai_generation_probability: 78.0,
    manipulation_risk: 52.0,
    forensic_anomaly_score: 68.0,
    metadata_risk_score: 10.0,
    signals: [
      {
        name: 'Syntactic Uniformity & Burstiness',
        category: 'stylometric',
        score: 82.0,
        weight: 0.35,
        strength: 'Strong',
        status: 'Anomaly Detected',
        explanation: 'Sentence length variance is abnormally constricted (standard deviation of 2.1 words per sentence), characteristic of LLM temperature smoothing.',
        affected_region_or_time: 'Paragraphs 1-3',
        model_contribution_pct: 38.0
      },
      {
        name: 'Vocabulary Perplexity Profile',
        category: 'nlp',
        score: 76.4,
        weight: 0.30,
        strength: 'Strong',
        status: 'Suspicious Pattern',
        explanation: 'Mean token log-likelihood remains consistently in the top 10% predicted vocabulary with near-zero rare idiomatic expressions.',
        affected_region_or_time: 'Full body',
        model_contribution_pct: 32.0
      },
      {
        name: 'Repetitive Discourse Connectors',
        category: 'stylometric',
        score: 71.0,
        weight: 0.20,
        strength: 'Moderate',
        status: 'Suspicious Pattern',
        explanation: 'High frequency of structured transitional boilerplate phrases (\'Furthermore\', \'In conclusion\', \'It is important to note\', \'Delve into\').',
        affected_region_or_time: 'Transition clauses',
        model_contribution_pct: 20.0
      },
      {
        name: 'Semantic Coherence & Logic Flow',
        category: 'nlp',
        score: 38.0,
        weight: 0.15,
        strength: 'Weak',
        status: 'Within Normal Variance',
        explanation: 'Topic continuity is high and grammatically flawless, displaying no hallucinations.',
        affected_region_or_time: 'Document level',
        model_contribution_pct: 10.0
      }
    ],
    evidence_breakdown: [
      {
        title: 'Uniform Sentence Structure',
        status: 'Elevated Risk',
        score: 82.0,
        risk: 'High Risk',
        explanation: 'Consistent subject-verb-object cadence with unusually repetitive subordinate clause lengths.',
        category: 'syntax'
      },
      {
        title: 'Repetitive Phrasing & Tropes',
        status: 'Elevated Risk',
        score: 75.0,
        risk: 'High Risk',
        explanation: 'Use of canonical LLM transition tropes (\'pivotal role\', \'testament to\', \'beacon of hope\').',
        category: 'stylometry'
      },
      {
        title: 'Unusual Vocabulary Consistency',
        status: 'Elevated Risk',
        score: 78.0,
        risk: 'High Risk',
        explanation: 'Token probability distribution exhibits low entropy without typical human vernacular swings.',
        category: 'vocabulary'
      },
      {
        title: 'Human-like Characteristics',
        status: 'Present',
        score: 32.0,
        risk: 'Low Risk',
        explanation: 'Contains personal contextual references indicating potential human drafting followed by AI polishing.',
        category: 'human_markers'
      },
      {
        title: 'Uncertainty Boundary',
        status: 'Important Note',
        score: 45.0,
        risk: 'Uncertain',
        explanation: 'Stylometric analysis is probabilistic and cannot definitively establish authorship.',
        category: 'uncertainty'
      }
    ],
    metadata: {
      file_name: 'executive_brief_memo.txt',
      file_size_formatted: '4.1 KB',
      mime_type: 'text/plain',
      creation_time: '2026-09-23 16:30:00 UTC',
      software_signature: 'UTF-8 Plain Text',
      camera_model: undefined,
      exif_available: false,
      editing_software_indicator: 'None',
      hash_sha256: '91a47291a271891b29a27891ce3b0c44298fc1c149afbf4c8996fb92427ae41e',
      metadata_risk_score: 10.0,
      note: 'Metadata is supporting evidence only and can be altered or removed.'
    },
    text_metrics: {
      word_count: 642,
      sentence_count: 34,
      avg_sentence_length: 18.8,
      sentence_length_std_dev: 2.1,
      perplexity_score: 14.2,
      burstiness_score: 0.18,
      repeated_phrases_count: 9,
      vocabulary_richness_ttr: 0.48,
      analyzed_text_sample: 'Artificial intelligence represents a transformative paradigm in contemporary digital infrastructure. It is essential to recognize the multifaceted implications this technology presents across diverse enterprise sectors. Furthermore, organizations must meticulously navigate the delicate balance between rapid innovation and ethical governance. In conclusion, adopting a forward-looking posture is paramount.'
    },
    why_result_explanation: 'The text displays an unusually low burstiness score (0.18) and a narrow sentence length standard deviation (2.1), indicating synthetic rhythm regulation. While human editorial intent is present, syntactic predictability aligns with generative AI refinement.',
    top_contributing_signals: [
      { signal: 'Syntactic Uniformity & Low Burstiness', impact: 'Strong', weight: '38%' },
      { signal: 'Vocabulary Perplexity Constriction', impact: 'Strong', weight: '32%' },
      { signal: 'Repetitive Discourse Connectors', impact: 'Moderate', weight: '20%' },
      { signal: 'Semantic Coherence Score', impact: 'Weak', weight: '10%' }
    ],
    limitations: 'Non-native English writing, technical jargon, or strictly standardized business templates can exhibit low burstiness and artificially trigger elevated AI-likelihood indicators.'
  }
};
