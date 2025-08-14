// Physics utilities for Double Slit
export interface DoubleSlitParams {
  wavelength: number; // meters
  slitWidth: number; // meters
  slitSeparation: number; // meters
}

// sinc(x) = sin(x)/x with sinc(0)=1
export function sinc(x: number): number {
  if (Math.abs(x) < 1e-8) return 1;
  return Math.sin(x) / x;
}

// Relative intensity I(theta)
export function doubleSlitIntensity(theta: number, { wavelength, slitWidth, slitSeparation }: DoubleSlitParams): number {
  const k1 = Math.PI * slitSeparation * Math.sin(theta) / wavelength;
  const k2 = Math.PI * slitWidth * Math.sin(theta) / wavelength;
  const interference = Math.cos(k1) ** 2;
  const diffraction = sinc(k2) ** 2;
  return interference * diffraction;
}

// Pre-sample intensity across screen coordinates (-1..1) for visualization
export function sampleIntensity(params: DoubleSlitParams, samples = 512): Float32Array {
  const arr = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * 2 - 1; // normalized screen axis
    const theta = Math.atan2(x, 1); // small angle approx improvement
    arr[i] = doubleSlitIntensity(theta, params);
  }
  // normalize
  let max = 0;
  for (let v of arr) if (v > max) max = v;
  if (max > 0) {
    for (let i = 0; i < arr.length; i++) arr[i] /= max;
  }
  return arr;
}

// Generate a random detection x based on intensity distribution (inverse transform sampling via cumulative array)
export function randomDetection(params: DoubleSlitParams, intensity?: Float32Array): number {
  const dist = intensity || sampleIntensity(params, 1024);
  const cumulative = new Float32Array(dist.length);
  let sum = 0;
  for (let i = 0; i < dist.length; i++) { sum += dist[i]; cumulative[i] = sum; }
  for (let i = 0; i < cumulative.length; i++) cumulative[i] /= sum;
  const r = Math.random();
  let lo = 0, hi = cumulative.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid] < r) lo = mid + 1; else hi = mid;
  }
  return (lo / (dist.length - 1)) * 2 - 1;
}
