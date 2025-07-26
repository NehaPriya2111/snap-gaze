// Analyze brightness and exposure
export const analyzeBrightness = (imageData) => {
  const data = imageData.data;
  let histogram = new Array(256).fill(0);
  let totalPixels = data.length / 4;

  // Calculate histogram with sampling
  for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = Math.round((r + g + b) / 3);
    histogram[brightness]++;
  }

  // Normalize histogram
  histogram = histogram.map(count => count * 4); // Adjust for sampling

  // Calculate exposure metrics
  const underexposed = histogram.slice(0, 64).reduce((a, b) => a + b, 0) / totalPixels;
  const midtones = histogram.slice(64, 192).reduce((a, b) => a + b, 0) / totalPixels;
  const overexposed = histogram.slice(192).reduce((a, b) => a + b, 0) / totalPixels;

  // Calculate exposure score (0-10)
  const exposureScore = Math.min(10, (
    (1 - Math.abs(midtones - 0.7)) * 7 +
    (1 - underexposed) * 1.5 +
    (1 - overexposed) * 1.5
  ));

  return {
    histogram,
    underexposed: underexposed * 100,
    midtones: midtones * 100,
    overexposed: overexposed * 100,
    exposureScore
  };
};

// Analyze clarity and sharpness
export const analyzeClarity = (imageData, width, height) => {
  const data = imageData.data;
  let totalEdgeStrength = 0;
  let maxEdgeStrength = 0;
  let edgeCount = 0;

  // Sample pixels for edge detection
  const sampleStep = 4; // Analyze every 4th pixel
  for (let y = sampleStep; y < height - sampleStep; y += sampleStep) {
    for (let x = sampleStep; x < width - sampleStep; x += sampleStep) {
      const idx = (y * width + x) * 4;

      // Calculate gradients using Sobel operator
      const gx = (
        -1 * data[idx - 4] +
        1 * data[idx + 4] +
        -2 * data[idx - 4 + width * 4] +
        2 * data[idx + 4 + width * 4] +
        -1 * data[idx - 4 + 2 * width * 4] +
        1 * data[idx + 4 + 2 * width * 4]
      ) / 8;

      const gy = (
        -1 * data[idx - width * 4] +
        1 * data[idx + width * 4] +
        -2 * data[idx + 4 - width * 4] +
        2 * data[idx + 4 + width * 4] +
        -1 * data[idx + 8 - width * 4] +
        1 * data[idx + 8 + width * 4]
      ) / 8;

      const edgeStrength = Math.sqrt(gx * gx + gy * gy);
      totalEdgeStrength += edgeStrength;
      maxEdgeStrength = Math.max(maxEdgeStrength, edgeStrength);
      edgeCount++;
    }
  }

  // Calculate metrics with more lenient thresholds
  const averageEdgeStrength = totalEdgeStrength / edgeCount;
  const sharpnessRatio = averageEdgeStrength / (maxEdgeStrength || 1);

  // Calculate clarity score (0-10) with more lenient scoring
  // Increased base score and reduced penalties
  const baseScore = 7.5; // Start from a higher base score
  const clarityScore = Math.min(10, Math.max(0, 
    baseScore + 
    (sharpnessRatio * 2) + // Reduced weight of sharpness ratio
    (Math.min(1, averageEdgeStrength / 40) * 2) // Reduced threshold for edge strength
  ));

  return {
    averageEdgeStrength,
    sharpnessRatio,
    clarityScore
  };
};

// Analyze color composition
export const analyzeColor = (imageData) => {
  const data = imageData.data;
  let hues = [];
  let saturations = [];
  let values = [];

  // Sample pixels for color analysis
  for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    // Calculate Hue
    let h = 0;
    if (diff === 0) h = 0;
    else if (max === r) h = 60 * ((g - b) / diff);
    else if (max === g) h = 60 * (2 + (b - r) / diff);
    else h = 60 * (4 + (r - g) / diff);
    if (h < 0) h += 360;

    // Calculate Saturation and Value
    const s = max === 0 ? 0 : diff / max;
    const v = max;

    hues.push(h);
    saturations.push(s);
    values.push(v);
  }

  // Calculate metrics
  const averageSaturation = saturations.reduce((a, b) => a + b, 0) / saturations.length;
  const colorVariety = new Set(hues.map(h => Math.round(h / 30))).size / 12;

  // Calculate color balance
  const hueGroups = new Array(6).fill(0);
  hues.forEach(h => {
    const group = Math.floor(h / 60);
    if (group >= 0 && group < 6) hueGroups[group]++;
  });
  const totalPixels = hues.length;
  const hueBalance = 1 - Math.max(...hueGroups.map(g => g / totalPixels));

  // Calculate color score (0-10)
  const colorScore = Math.min(10, (
    (colorVariety * 4) +
    (averageSaturation * 3) +
    (hueBalance * 3)
  ));

  return {
    colorVariety,
    averageSaturation,
    hueBalance,
    colorScore
  };
};

// Analyze composition using rule of thirds
export const analyzeComposition = (imageData, width, height) => {
  const data = imageData.data;
  const regions = Array(9).fill(0).map(() => ({ weight: 0 }));
  const thirdW = width / 3;
  const thirdH = height / 3;

  // Sample pixels for composition analysis
  const sampleStep = 4; // Analyze every 4th pixel
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const idx = (y * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / (3 * 255);
      const regionX = Math.floor(x / thirdW);
      const regionY = Math.floor(y / thirdH);
      const regionIdx = regionY * 3 + regionX;
      if (regionIdx >= 0 && regionIdx < 9) {
        regions[regionIdx].weight += 1 - brightness;
      }
    }
  }

  // Normalize weights
  const totalWeight = regions.reduce((sum, r) => sum + r.weight, 0) || 1;
  regions.forEach(r => r.weight = r.weight / totalWeight);

  // Calculate balance scores
  const horizontalBalance = 1 - Math.abs(
    (regions[0].weight + regions[3].weight + regions[6].weight) -
    (regions[2].weight + regions[5].weight + regions[8].weight)
  );

  const verticalBalance = 1 - Math.abs(
    (regions[0].weight + regions[1].weight + regions[2].weight) -
    (regions[6].weight + regions[7].weight + regions[8].weight)
  );

  // Calculate rule of thirds score
  const intersectionPoints = [
    regions[1].weight + regions[3].weight,
    regions[1].weight + regions[5].weight,
    regions[7].weight + regions[3].weight,
    regions[7].weight + regions[5].weight
  ];
  const ruleOfThirds = Math.max(...intersectionPoints) * 2;

  // Calculate composition score (0-10)
  const compositionScore = Math.min(10, (
    (horizontalBalance * 3) +
    (verticalBalance * 3) +
    (ruleOfThirds * 4)
  ));

  return {
    regions,
    horizontalBalance,
    verticalBalance,
    ruleOfThirds,
    compositionScore
  };
}; 