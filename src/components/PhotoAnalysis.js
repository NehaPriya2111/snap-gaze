import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Divider,
  Container,
  Button,
  Card,
  CardContent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import {
  analyzeBrightness,
  analyzeClarity,
  analyzeColor,
  analyzeComposition
} from '../utils/imageAnalysis';

function PhotoAnalysis({ image, onImageUpload }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [photoType, setPhotoType] = useState(null);

  const technicalSpecs = useMemo(() => ({
    composition: {
      basic: [
        "Apply Rule of Thirds grid for balanced composition",
        "Use leading lines to guide viewer's eye",
        "Create depth with foreground, middle ground, background",
        "Maintain clean edges and frame",
        "Consider visual weight distribution"
      ],
      advanced: [
        "Apply Golden Ratio (1.618:1) for dynamic composition",
        "Use diagonal lines at 45° for tension",
        "Implement negative space effectively",
        "Create visual flow through subject placement",
        "Balance color and tonal weight"
      ],
      technical: `
• Rule of Thirds: Place key elements at 33.3% and 66.6% intersections
• Golden Ratio: Key elements at 38.2% or 61.8% of frame
• Dynamic Symmetry: Use diagonal armatures (14.6°, 45°, 75.4°)
• Visual Weight: Dark elements need 1.5x more negative space
• Aspect Ratios: 3:2 landscape, 4:5 portrait, 16:9 panorama
      `
    },
    'focus & clarity': {
      basic: [
        "Use appropriate autofocus points",
        "Match depth of field to subject",
        "Maintain adequate shutter speed",
        "Control ISO for noise",
        "Keep optics clean",
        "Check focus at 100% zoom",
        "Use focus peaking when available",
        "Consider focus stacking for macro",
        "Stabilize camera properly",
        "Clean lens regularly"
      ],
      advanced: [
        "Calculate hyperfocal distance",
        "Use focus stacking techniques",
        "Master manual focus",
        "Control micro-contrast",
        "Optimize sharpening",
        "Employ selective sharpening",
        "Balance global vs local contrast",
        "Manage atmospheric interference",
        "Account for diffraction limits",
        "Fine-tune autofocus calibration"
      ],
      technical: `
• Minimum Shutter Speed: 1/(focal length × crop factor)
• Hyperfocal Distance: (focal length² ÷ (f-stop × circle of confusion))
• Optimal Aperture: f/8 to f/11 for most lenses
• Focus Stacking: 33% DoF overlap between frames
• Diffraction Limit: 1.22 × wavelength × f-stop
• Circle of Confusion: 0.03mm for full frame
• Focus Breathing: Compensate by 5-10%
• Critical Focus Zone: ±0.5mm at f/2.8
• Focus Shift: +2mm per f-stop closed
• Pixel-level Sharpness: MTF50 > 0.3 cycles/pixel
      `
    },
    exposure: {
      basic: [
        "Use histogram to check distribution",
        "Protect highlight detail",
        "Apply exposure compensation",
        "Understand metering modes",
        "Use bracketing for high contrast"
      ],
      advanced: [
        "Master ETTR technique",
        "Use zone system",
        "Calculate filter factors",
        "Control dynamic range",
        "Balance mixed lighting"
      ],
      technical: `
• Sunny 16 Rule: f/16 at 1/ISO in full sun
• Dynamic Range: 14 stops typical for modern sensors
• ETTR: Place highlights at 95% on histogram
• Zone System: Middle gray at 18% reflectance
• HDR Bracketing: ±2 EV steps for 5 shots
      `
    },
    lighting: {
      basic: [
        "Understand light direction",
        "Use diffusion effectively",
        "Control contrast ratio",
        "Manage shadows",
        "Balance fill light"
      ],
      advanced: [
        "Master inverse square law",
        "Control lighting ratios",
        "Use color temperature",
        "Shape light with modifiers",
        "Create mood through lighting"
      ],
      technical: `
• Key Light: 45° horizontal, 45° vertical
• Fill Ratio: 2:1 standard, 4:1 dramatic
• Color Temperature: 5500K daylight, 3200K tungsten
• Inverse Square Law: Light falls off with 1/distance²
• Golden Hour: Sun at 6° above horizon (±30 minutes)
      `
    },
    creativity: {
      basic: [
        "Explore unique angles",
        "Use creative techniques",
        "Experiment with focal lengths",
        "Try motion effects",
        "Find interesting perspectives"
      ],
      advanced: [
        "Develop personal style",
        "Create visual metaphors",
        "Master advanced techniques",
        "Push technical boundaries",
        "Tell visual stories"
      ],
      technical: `
• Multiple Exposure: 50% power per frame
• Motion Blur: 1/15 sec for flowing water
• Light Painting: f/8, ISO 100, Bulb mode
• Zoom Burst: 1-2 sec exposure
• Panorama: 33% overlap between frames
      `
    },
    presentation: {
      basic: [
        "Calibrate your monitor",
        "Use appropriate color space",
        "Apply selective adjustments",
        "Maintain clean editing",
        "Export with proper settings"
      ],
      advanced: [
        "Master color grading",
        "Use advanced masking",
        "Control local contrast",
        "Optimize output",
        "Create consistent style"
      ],
      technical: `
• Monitor: 120cd/m², 6500K, gamma 2.2
• Print Resolution: 300ppi for photo quality
• Web Export: sRGB, 72ppi, 85% JPEG
• Color Space: ProPhoto RGB for editing
• Sharpening: High Pass 0.3px radius, 15%
      `
    },
    aesthetics: {
      basic: [
        "Create color harmony",
        "Develop visual rhythm",
        "Maintain style consistency",
        "Use negative space",
        "Consider overall mood"
      ],
      advanced: [
        "Apply color theory",
        "Create emotional impact",
        "Control visual hierarchy",
        "Master tonal relationships",
        "Implement design principles"
      ],
      technical: `
• Color Harmony: 60-30-10 rule
• Visual Weight: Heavier elements toward bottom
• Golden Ratio: 1:1.618 for classical proportion
• Tonal Range: 3-7 distinct value groups
• Style: Color temperature within ±500K
      `
    }
  }), []);

  const analysisWeights = useMemo(() => ({
    presentation: {
      weight: 0.20,
      criteria: [
        'Color accuracy and calibration',
        'Post-processing technique',
        'Final impact and polish',
        'Print/display readiness',
        'Technical execution',
        'Editing consistency',
        'Output optimization',
        'Detail preservation'
      ]
    },
    creativity: {
      weight: 0.15,
      criteria: [
        'Unique perspective',
        'Artistic vision',
        'Emotional impact',
        'Originality',
        'Visual storytelling',
        'Innovative technique',
        'Personal style',
        'Creative risk-taking'
      ]
    },
    aesthetics: {
      weight: 0.15,
      criteria: [
        'Visual harmony',
        'Color relationships',
        'Emotional resonance',
        'Style consistency',
        'Design principles',
        'Tonal balance',
        'Compositional flow',
        'Overall impact'
      ]
    },
    composition: {
      weight: 0.15,
      criteria: [
        'Rule of thirds adherence',
        'Balance and symmetry',
        'Subject placement',
        'Visual flow',
        'Use of space',
        'Leading lines',
        'Frame utilization',
        'Geometric harmony'
      ]
    },
    'focus & clarity': {
      weight: 0.20,
      criteria: [
        'Subject sharpness',
        'Depth of field control',
        'Focus accuracy',
        'Detail resolution',
        'Noise management',
        'Overall clarity',
        'Edge definition',
        'Technical precision',
        'Focus point placement',
        'Bokeh quality',
        'Motion stability',
        'Micro contrast',
        'Focus consistency',
        'Atmospheric clarity',
        'Lens performance'
      ]
    },
    exposure: {
      weight: 0.10,
      criteria: [
        'Dynamic range',
        'Highlight retention',
        'Shadow detail',
        'Midtone contrast',
        'Exposure accuracy',
        'Histogram balance',
        'Tonal distribution',
        'Light control'
      ]
    },
    lighting: {
      weight: 0.05,
      criteria: [
        'Light direction',
        'Quality of light',
        'Shadow control',
        'Highlight management',
        'Mood creation',
        'Color temperature',
        'Light balance',
        'Contrast ratio'
      ]
    }
  }), []);

  const cameraSettings = useMemo(() => ({
    landscape: {
      title: "Landscape Photography",
      focalLength: "14-35mm (wide angle)",
      iso: "100-400",
      exposureTime: "1/60 - 1/250",
      additional: [
        "Use smaller apertures (f/8-f/16) for greater depth of field",
        "Consider using ND filters for longer exposures",
        "Use tripod for maximum sharpness"
      ]
    },
    portrait: {
      title: "Portrait Photography",
      focalLength: "50-135mm",
      iso: "100-800",
      exposureTime: "1/125 - 1/250",
      additional: [
        "Use wider apertures (f/1.8-f/4) for background blur",
        "Consider using reflectors for fill light",
        "Focus on the nearest eye"
      ]
    },
    action: {
      title: "Action/Sports Photography",
      focalLength: "70-300mm",
      iso: "400-3200",
      exposureTime: "1/500 - 1/2000",
      additional: [
        "Use continuous autofocus (AI Servo)",
        "Enable high-speed continuous shooting",
        "Consider using monopod for stability"
      ]
    },
    macro: {
      title: "Macro Photography",
      focalLength: "90-180mm macro",
      iso: "100-400",
      exposureTime: "1/60 - 1/250",
      additional: [
        "Use focus stacking for greater depth of field",
        "Consider using ring light or twin flash",
        "Use manual focus for precise control"
      ]
    }
  }), []);

  const determinePhotoType = (imageData, analysisResults) => {
    const { width, height } = imageData;
    const aspectRatio = width / height;
    const { regions } = analysisResults.composition;
    const { averageEdgeStrength } = analysisResults.clarity;
    const { histogram, underexposed, overexposed } = analysisResults.brightness;
    const { colorVariety, averageSaturation } = analysisResults.color;

    // Extract EXIF data from image if available
    const currentSettings = {
      resolution: `${width} × ${height}`,
      aspectRatio: aspectRatio.toFixed(2),
      brightness: `${Math.round((1 - underexposed/100) * 100)}%`,
      sharpness: `${Math.round(averageEdgeStrength)}%`,
      colorSaturation: `${Math.round(averageSaturation * 100)}%`,
      contrast: `${Math.round((1 - Math.abs(underexposed - overexposed)/100) * 100)}%`
    };

    // Analyze characteristics to determine photo type
    let type = {
      name: '',
      confidence: 0,
      settings: {},
      currentSettings: currentSettings  // Add current settings to the type object
    };

    // Check for landscape characteristics
    if (aspectRatio > 1.3 && colorVariety > 0.6) {
      type = {
        name: 'Landscape',
        confidence: 0.8,
        currentSettings,
        settings: {
          focalLength: width > 3000 ? "14-24mm" : "24-35mm",
          iso: underexposed > 30 ? "400-800" : "100-400",
          exposureTime: overexposed > 30 ? "1/1000 - 1/2000" : "1/60 - 1/250",
          aperture: "f/8 - f/16",
          tips: [
            `${underexposed > 30 ? "Consider using HDR for high contrast scenes" : "Good dynamic range maintained"}`,
            `${aspectRatio > 1.5 ? "Wide panoramic composition detected" : "Standard landscape ratio detected"}`,
            `${colorVariety > 0.7 ? "Rich color variety - consider polarizing filter" : "Moderate colors - enhance in post"}`
          ]
        }
      };
    }
    // Check for portrait characteristics
    else if (aspectRatio < 1.2 && averageEdgeStrength > 50) {
      type = {
        name: 'Portrait',
        confidence: 0.85,
        currentSettings,
        settings: {
          focalLength: width > 2500 ? "85-135mm" : "50-85mm",
          iso: averageEdgeStrength < 70 ? "400-800" : "100-400",
          exposureTime: "1/125 - 1/250",
          aperture: "f/1.8 - f/4",
          tips: [
            `${averageEdgeStrength > 80 ? "Sharp focus detected - good eye detail" : "Increase sharpness for better eye detail"}`,
            `${aspectRatio < 0.8 ? "Portrait orientation optimal" : "Consider tighter cropping"}`,
            `${averageSaturation > 0.6 ? "Good skin tone saturation" : "Adjust white balance for better skin tones"}`
          ]
        }
      };
    }
    // Check for action/sports characteristics
    else if (averageEdgeStrength < 40 || (histogram && histogram.some(h => h > 1000))) {
      type = {
        name: 'Action',
        confidence: 0.75,
        currentSettings,
        settings: {
          focalLength: width > 4000 ? "200-400mm" : "70-200mm",
          iso: "800-3200",
          exposureTime: "1/500 - 1/2000",
          aperture: "f/2.8 - f/4",
          tips: [
            `${averageEdgeStrength < 30 ? "Motion blur detected - increase shutter speed" : "Good motion freeze"}`,
            "Enable continuous autofocus (AI Servo)",
            `${width > 4000 ? "Long lens - use monopod for stability" : "Consider closer positioning"}`
          ]
        }
      };
    }
    // Check for macro characteristics
    else if (averageEdgeStrength > 80 && regions.some(r => r.weight > 0.4)) {
      type = {
        name: 'Macro',
        confidence: 0.9,
        currentSettings,
        settings: {
          focalLength: "90-180mm macro",
          iso: averageEdgeStrength > 90 ? "100-200" : "200-400",
          exposureTime: "1/60 - 1/250",
          aperture: "f/8 - f/16",
          tips: [
            `${averageEdgeStrength > 90 ? "Excellent detail - maintain technique" : "Consider focus stacking"}`,
            `${regions.some(r => r.weight > 0.5) ? "Strong subject isolation" : "Improve background separation"}`,
            "Use manual focus for precise control"
          ]
        }
      };
    }
    // Default/General photography
    else {
      type = {
        name: 'General',
        confidence: 0.7,
        currentSettings,
        settings: {
          focalLength: "35-70mm",
          iso: underexposed > 30 ? "400-1600" : "100-400",
          exposureTime: "1/60 - 1/250",
          aperture: "f/4 - f/8",
          tips: [
            `${underexposed > 30 ? "Increase exposure or use artificial lighting" : "Good exposure balance"}`,
            `${averageEdgeStrength < 50 ? "Increase sharpness" : "Good overall sharpness"}`,
            `${colorVariety < 0.4 ? "Consider color composition" : "Good color variety"}`
          ]
        }
      };
    }

    return type;
  };

  useEffect(() => {
    const analyzeImage = async () => {
      setIsAnalyzing(true);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Perform analysis
        const brightnessAnalysis = analyzeBrightness(imageData);
        const clarityAnalysis = analyzeClarity(imageData, canvas.width, canvas.height);
        const colorAnalysis = analyzeColor(imageData);
        const compositionAnalysis = analyzeComposition(imageData, canvas.width, canvas.height);

        const analysisResults = {
          brightness: brightnessAnalysis,
          clarity: clarityAnalysis,
          color: colorAnalysis,
          composition: compositionAnalysis
        };

        // Determine photo type and optimal settings
        const photoTypeInfo = determinePhotoType(
          { width: canvas.width, height: canvas.height },
          analysisResults
        );
        setPhotoType(photoTypeInfo);

        // Calculate scores for each category
        const scores = {
          presentation: (clarityAnalysis.clarityScore + colorAnalysis.colorScore) / 2,
          creativity: colorAnalysis.colorScore,
          aesthetics: (compositionAnalysis.compositionScore + colorAnalysis.colorScore) / 2,
          composition: compositionAnalysis.compositionScore,
          'focus & clarity': clarityAnalysis.clarityScore,
          exposure: brightnessAnalysis.exposureScore,
          lighting: (brightnessAnalysis.exposureScore + colorAnalysis.colorScore) / 2
        };

        // Generate analysis data with weights
        const analysisData = Object.entries(scores).reduce((acc, [category, score]) => {
          acc[category] = {
            score,
            weight: analysisWeights[category].weight,
            feedback: getFeedbackTemplate(category, score),
            criteria: analysisWeights[category].criteria,
            specs: technicalSpecs[category]
          };
          return acc;
        }, {});

        setAnalysis(analysisData);
        setIsAnalyzing(false);
      };

      img.src = image.dataUrl;
    };

    if (image && image.dataUrl) {
      analyzeImage();
    }
  }, [image]);

  const getFeedbackTemplate = (category, score) => {
    const templates = {
      presentation: {
        excellent: [
          "Outstanding presentation with professional-grade polish",
          "Exceptional attention to detail in post-processing",
          "Print-ready quality with perfect color accuracy"
        ],
        good: [
          "Well-presented with good attention to detail",
          "Effective post-processing enhances the image",
          "Good overall polish with minor room for improvement"
        ],
        average: [
          "Decent presentation but lacks refined polish",
          "Basic post-processing could be enhanced",
          "Consider fine-tuning the final output"
        ],
        poor: [
          "Presentation needs significant improvement",
          "Post-processing appears heavy-handed or insufficient",
          "Final impact is diminished by technical issues"
        ],
        critical: [
          "Major presentation issues affect image quality",
          "Post-processing requires complete revision",
          "Technical problems severely impact final output"
        ]
      },
      creativity: {
        excellent: [
          "Highly original and innovative perspective",
          "Strong artistic vision clearly conveyed",
          "Compelling storytelling through composition"
        ],
        good: [
          "Creative approach with good artistic merit",
          "Clear artistic intent in composition",
          "Interesting perspective on the subject"
        ],
        average: [
          "Standard creative approach",
          "Artistic vision could be more defined",
          "Consider more unique perspectives"
        ],
        poor: [
          "Limited creative expression",
          "Artistic vision needs development",
          "Very conventional approach"
        ],
        critical: [
          "Lacks creative input",
          "No clear artistic direction",
          "Extremely conventional composition"
        ]
      },
      aesthetics: {
        excellent: [
          "Exceptional visual harmony and balance",
          "Masterful use of color relationships",
          "Strong emotional resonance through aesthetics"
        ],
        good: [
          "Pleasing aesthetic qualities",
          "Effective color palette choices",
          "Good overall visual appeal"
        ],
        average: [
          "Basic aesthetic principles applied",
          "Color harmony could be improved",
          "Consider strengthening visual impact"
        ],
        poor: [
          "Aesthetic elements need refinement",
          "Color relationships are discordant",
          "Limited visual appeal"
        ],
        critical: [
          "Significant aesthetic issues",
          "Poor color harmony",
          "Lacks visual cohesion"
        ]
      },
      composition: {
        excellent: [
          "Masterful composition with perfect balance",
          "Excellent use of rule of thirds",
          "Strong visual flow and subject placement"
        ],
        good: [
          "Well-composed with good balance",
          "Effective use of compositional rules",
          "Clear subject emphasis"
        ],
        average: [
          "Basic compositional principles applied",
          "Room for improvement in balance",
          "Consider stronger subject placement"
        ],
        poor: [
          "Compositional issues affect impact",
          "Weak visual balance",
          "Unclear subject emphasis"
        ],
        critical: [
          "Major compositional problems",
          "Poor visual balance",
          "No clear subject focus"
        ]
      },
      'focus & clarity': {
        excellent: [
          "Exceptional sharpness with perfect focus placement",
          "Outstanding detail resolution across key elements",
          "Masterful control of depth of field",
          "Professional-level clarity with zero technical issues",
          "Excellent micro-contrast and edge definition"
        ],
        good: [
          "Well-executed focus with good subject definition",
          "Strong detail retention in important areas",
          "Appropriate depth of field for the subject",
          "Minimal noise with good overall clarity",
          "Consistent sharpness across main elements"
        ],
        average: [
          "Acceptable focus but room for improvement",
          "Some areas lack optimal sharpness",
          "Depth of field could be better controlled",
          "Minor issues with noise or clarity",
          "Inconsistent sharpness across the frame"
        ],
        poor: [
          "Noticeable focus issues affecting image quality",
          "Significant lack of sharpness in key areas",
          "Inappropriate depth of field choice",
          "Problematic noise levels or clarity",
          "Technical shortcomings in focus control"
        ],
        critical: [
          "Major focus problems throughout the image",
          "Critical sharpness issues affecting usability",
          "Severe technical deficiencies in clarity",
          "Unacceptable noise or resolution issues",
          "Fundamental problems with focus technique"
        ]
      },
      exposure: {
        excellent: [
          "Perfect exposure with full dynamic range",
          "Excellent highlight and shadow detail",
          "Optimal brightness levels throughout"
        ],
        good: [
          "Well-exposed with good detail retention",
          "Good balance of highlights and shadows",
          "Appropriate overall brightness"
        ],
        average: [
          "Acceptable exposure but could be improved",
          "Some loss of detail in extremes",
          "Consider adjusting brightness levels"
        ],
        poor: [
          "Exposure issues affect image quality",
          "Significant loss of detail",
          "Brightness levels need adjustment"
        ],
        critical: [
          "Major exposure problems",
          "Severe loss of detail",
          "Incorrect brightness levels"
        ]
      },
      lighting: {
        excellent: [
          "Masterful use of lighting",
          "Perfect light direction and quality",
          "Excellent mood creation through lighting"
        ],
        good: [
          "Effective lighting choices",
          "Good direction and quality of light",
          "Appropriate mood setting"
        ],
        average: [
          "Basic lighting principles applied",
          "Room for improvement in light direction",
          "Consider enhancing lighting impact"
        ],
        poor: [
          "Lighting issues affect image quality",
          "Poor light direction or quality",
          "Weak mood creation"
        ],
        critical: [
          "Major lighting problems",
          "Very poor light quality",
          "No effective mood creation"
        ]
      }
    };

    const getFeedbackLevel = (score) => {
      if (score >= 9) return 'excellent';
      if (score >= 7) return 'good';
      if (score >= 5) return 'average';
      if (score >= 3) return 'poor';
      return 'critical';
    };

    const level = getFeedbackLevel(score);
    return templates[category][level];
  };

  const getScoreColor = (score) => {
    if (score >= 9) return 'success';
    if (score >= 7) return 'primary';
    if (score >= 5) return 'warning';
    return 'error';
  };

  const handleNewUpload = () => {
    // Reset states
    setAnalysis(null);
    setIsAnalyzing(true);
    // Clear the current image to show upload component
    onImageUpload(null);
  };

  if (!image) return null;

  if (isAnalyzing) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ 
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            mb: 3 
          }}>
            <Box sx={{
              maxWidth: '600px',
              width: '100%',
              height: '400px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              borderRadius: 2,
              bgcolor: '#f5f5f5'
            }}>
              <img 
                src={image.dataUrl} 
                alt="Uploaded" 
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }} 
              />
            </Box>
          </Box>
          <CircularProgress size={32} />
          <Typography sx={{ mt: 2 }} variant="body1" color="text.secondary">
            Analyzing your photo...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!analysis) return null;

  const overallScore = Object.entries(analysis).reduce((acc, [_, data]) => {
    return acc + (data.score * data.weight);
  }, 0);

  const strengths = Object.entries(analysis)
    .filter(([_, data]) => data.score >= 7)
    .map(([category, data]) => ({
      category,
      score: data.score,
      feedback: data.feedback.slice(0, 2)
    }));

  const improvements = Object.entries(analysis)
    .filter(([_, data]) => data.score < 7)
    .map(([category, data]) => ({
      category,
      score: data.score,
      feedback: data.feedback.slice(0, 2)
    }));

  const renderCameraSettings = () => {
    if (!photoType) return null;

    return (
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            textAlign: 'center',
            mb: 3,
            fontWeight: 500,
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '3px',
              background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)',
              borderRadius: '2px'
            }
          }}
        >
          Camera Settings Analysis
        </Typography>
        <Card 
          sx={{ 
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <CardContent>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 600
                }}
              >
                {photoType.name} Photography
              </Typography>
              <Chip 
                label={`${Math.round(photoType.confidence * 100)}% confidence`}
                color={photoType.confidence > 0.8 ? "success" : "primary"}
                size="small"
              />
            </Box>
            
            <Grid container spacing={3}>
              {/* Current Photo Specifications */}
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Current Photo Specifications
                  </Typography>
                  <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'error.light' }}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Resolution
                      </Typography>
                      <Typography variant="body1">
                        {photoType.currentSettings.resolution}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Aspect Ratio
                      </Typography>
                      <Typography variant="body1">
                        {photoType.currentSettings.aspectRatio}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Brightness
                      </Typography>
                      <Typography variant="body1">
                        {photoType.currentSettings.brightness}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Sharpness
                      </Typography>
                      <Typography variant="body1">
                        {photoType.currentSettings.sharpness}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Color Saturation
                      </Typography>
                      <Typography variant="body1">
                        {photoType.currentSettings.colorSaturation}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Contrast
                      </Typography>
                      <Typography variant="body1">
                        {photoType.currentSettings.contrast}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Recommended Settings */}
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Recommended Settings
                  </Typography>
                  <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'success.light' }}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Focal Length
                      </Typography>
                      <Typography variant="body1">
                        {photoType.settings.focalLength}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        ISO
                      </Typography>
                      <Typography variant="body1">
                        {photoType.settings.iso}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Exposure Time
                      </Typography>
                      <Typography variant="body1">
                        {photoType.settings.exposureTime}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Aperture
                      </Typography>
                      <Typography variant="body1">
                        {photoType.settings.aperture}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              
              {/* Optimization Tips */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Optimization Tips
                </Typography>
                <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'info.light' }}>
                  {photoType.settings.tips.map((tip, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        '&:before': {
                          content: '"•"',
                          mr: 1,
                          color: 'primary.main'
                        }
                      }}
                    >
                      {tip}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Photo Display */}
        <Box sx={{ 
          width: '100%',
          height: '400px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#f5f5f5',
          overflow: 'hidden'
        }}>
          <img 
            src={image.dataUrl} 
            alt="Uploaded" 
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }} 
          />
        </Box>

        {/* Overall Score */}
        <Box sx={{ p: 4, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 500 }}>
            Overall Score: {overallScore.toFixed(1)}/10
          </Typography>
          <Box sx={{ maxWidth: '400px', mx: 'auto' }}>
            <LinearProgress
              variant="determinate"
              value={overallScore * 10}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'rgba(0, 0, 0, 0.08)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: overallScore >= 9 ? '#2E7D32' :
                          overallScore >= 7 ? '#1976D2' :
                          overallScore >= 5 ? '#ED6C02' : '#D32F2F'
                }
              }}
            />
          </Box>
        </Box>

        {/* Analysis Sections */}
        <Box sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {Object.entries(analysis).map(([category, data]) => (
              <Grid item xs={12} key={category}>
                <Accordion 
                  elevation={0} 
                  sx={{ 
                    '&:before': { display: 'none' },
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '8px !important',
                    mb: 1,
                    overflow: 'hidden'
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      bgcolor: 'rgba(0, 0, 0, 0.02)',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 1 
                      }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            textTransform: 'capitalize',
                            fontWeight: 500
                          }}
                        >
                          {category} ({(data.weight * 100).toFixed(0)}%)
                        </Typography>
                        <Typography 
                          sx={{ 
                            fontWeight: 500,
                            color: data.score >= 9 ? '#2E7D32' :
                                   data.score >= 7 ? '#1976D2' :
                                   data.score >= 5 ? '#ED6C02' : '#D32F2F'
                          }}
                        >
                          {data.score.toFixed(1)}/10
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={data.score * 10}
                        sx={{ 
                          height: 4, 
                          borderRadius: 2,
                          bgcolor: 'rgba(0, 0, 0, 0.08)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: data.score >= 9 ? '#2E7D32' :
                                    data.score >= 7 ? '#1976D2' :
                                    data.score >= 5 ? '#ED6C02' : '#D32F2F'
                          }
                        }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 3 }}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                        Evaluation Criteria
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        {data.criteria.map((criterion) => (
                          <Chip
                            key={criterion}
                            label={criterion}
                            size="small"
                            sx={{ 
                              m: 0.5, 
                              bgcolor: 'rgba(0, 0, 0, 0.04)',
                              color: 'text.primary'
                            }}
                          />
                        ))}
                      </Box>

                      <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                        Feedback
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        {data.feedback.map((feedback, index) => (
                          <Typography
                            key={index}
                            variant="body2"
                            sx={{ 
                              mb: 1,
                              color: 'text.primary',
                              pl: 2,
                              position: 'relative',
                              '&:before': {
                                content: '"•"',
                                position: 'absolute',
                                left: 0,
                                color: 'text.secondary'
                              }
                            }}
                          >
                            {feedback}
                          </Typography>
                        ))}
                      </Box>

                      <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                        Technical Guide
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: 'text.secondary' }}>
                          Basic Techniques
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          {data.specs.basic.map((tip, index) => (
                            <Typography
                              key={index}
                              variant="body2"
                              sx={{ 
                                mb: 1,
                                color: 'text.primary',
                                pl: 2,
                                position: 'relative',
                                '&:before': {
                                  content: '"•"',
                                  position: 'absolute',
                                  left: 0,
                                  color: 'text.secondary'
                                }
                              }}
                            >
                              {tip}
                            </Typography>
                          ))}
                        </Box>

                        <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: 'text.secondary' }}>
                          Advanced Techniques
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          {data.specs.advanced.map((tip, index) => (
                            <Typography
                              key={index}
                              variant="body2"
                              sx={{ 
                                mb: 1,
                                color: 'text.primary',
                                pl: 2,
                                position: 'relative',
                                '&:before': {
                                  content: '"•"',
                                  position: 'absolute',
                                  left: 0,
                                  color: 'text.secondary'
                                }
                              }}
                            >
                              {tip}
                            </Typography>
                          ))}
                        </Box>

                        <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: 'text.secondary' }}>
                          Technical Specifications
                        </Typography>
                        <Typography
                          variant="body2"
                          component="pre"
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.02)',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            color: 'text.primary'
                          }}
                        >
                          {data.specs.technical}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>

          {/* Camera Settings Section */}
          {renderCameraSettings()}

          {/* Summary Section */}
          <Box sx={{ 
            p: 4, 
            bgcolor: 'rgba(0, 0, 0, 0.02)', 
            borderTop: '1px solid rgba(0, 0, 0, 0.08)'
          }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 500,
                mb: 3,
                textAlign: 'center',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)',
                  borderRadius: '2px'
                }
              }}
            >
              Analysis Summary
            </Typography>

            <Grid container spacing={4}>
              {/* Strengths Section */}
              <Grid item xs={12} md={6}>
                <Box sx={{
                  height: '100%',
                  p: 3,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid rgba(25, 118, 210, 0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)'
                  }
                }}>
                  <Typography 
                    variant="subtitle1" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      color: '#1976D2',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2
                    }}
                  >
                    <Box 
                      component="span" 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(25, 118, 210, 0.12)',
                        color: '#1976D2',
                        fontSize: '0.875rem',
                        fontWeight: 700
                      }}
                    >
                      {strengths.length}
                    </Box>
                    Key Strengths
                  </Typography>
                  <Box sx={{ 
                    pl: 2, 
                    borderLeft: '2px solid rgba(25, 118, 210, 0.12)'
                  }}>
                    {strengths.length > 0 ? (
                      strengths.map(({ category, score, feedback }, index) => (
                        <Box key={category} sx={{ mb: index !== strengths.length - 1 ? 2 : 0 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: 'text.primary',
                              mb: 0.5
                            }}
                          >
                            {category} ({score.toFixed(1)}/10)
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'text.secondary',
                              lineHeight: 1.5
                            }}
                          >
                            {feedback.join('. ')}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontStyle: 'italic'
                        }}
                      >
                        Keep practicing! Focus on implementing the suggested improvements to enhance your photography skills.
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Areas for Improvement Section */}
              <Grid item xs={12} md={6}>
                <Box sx={{
                  height: '100%',
                  p: 3,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid rgba(211, 47, 47, 0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #D32F2F 0%, #FF5252 100%)'
                  }
                }}>
                  <Typography 
                    variant="subtitle1" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      color: '#D32F2F',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2
                    }}
                  >
                    <Box 
                      component="span" 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(211, 47, 47, 0.12)',
                        color: '#D32F2F',
                        fontSize: '0.875rem',
                        fontWeight: 700
                      }}
                    >
                      {improvements.length}
                    </Box>
                    Areas for Improvement
                  </Typography>
                  <Box sx={{ 
                    pl: 2, 
                    borderLeft: '2px solid rgba(211, 47, 47, 0.12)'
                  }}>
                    {improvements.length > 0 ? (
                      improvements.map(({ category, score, feedback }, index) => (
                        <Box key={category} sx={{ mb: index !== improvements.length - 1 ? 2 : 0 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: 'text.primary',
                              mb: 0.5
                            }}
                          >
                            {category} ({score.toFixed(1)}/10)
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'text.secondary',
                              lineHeight: 1.5
                            }}
                          >
                            {feedback.join('. ')}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontStyle: 'italic'
                        }}
                      >
                        Excellent work! Your photo demonstrates strong technical and artistic qualities across all aspects.
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Upload Another Photo Button */}
            <Box sx={{ 
              mt: 4, 
              pt: 4, 
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <Button
                variant="contained"
                startIcon={<AddPhotoAlternateIcon />}
                onClick={handleNewUpload}
                sx={{
                  bgcolor: '#1976D2',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: '#1565C0'
                  }
                }}
              >
                Analyze Another Photo
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default PhotoAnalysis; 