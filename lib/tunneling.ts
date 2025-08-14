// Quantum tunneling 1D utilities
// We simulate a Gaussian wave packet evolving under a potential barrier using a split-step Fourier method (simplified)

export interface TunnelingParams {
  barrierHeight: number; // V0 (J arbitrary units)
  barrierWidth: number;  // a (meters arbitrary)
  energy: number;        // particle energy E (same units as V0)
  mass: number;          // mass (set to 1 for dimensionless)
  hbar: number;          // reduced Planck constant
}

export interface SimulationState {
  psiRe: Float32Array;
  psiIm: Float32Array;
  x: Float32Array;
  dx: number;
  N: number;
  time: number;
}

export function gaussianPacket(N: number, dx: number, x0: number, k0: number, sigma: number): { re: Float32Array; im: Float32Array; } {
  const re = new Float32Array(N);
  const im = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const x = (i - N / 2) * dx;
    const gauss = Math.exp(-((x - x0) ** 2) / (2 * sigma * sigma));
    re[i] = gauss * Math.cos(k0 * x);
    im[i] = gauss * Math.sin(k0 * x);
  }
  return { re, im };
}

export function barrierPotential(x: number, width: number, center: number, height: number): number {
  return Math.abs(x - center) < width / 2 ? height : 0;
}

// Transmission coefficient (analytic) for E < V0 rectangular barrier
export function transmissionCoefficient(E: number, V0: number, a: number, m: number, hbar: number): number {
  if (E >= V0) return 1; // placeholder for above-barrier (not handled here)
  const kappa = Math.sqrt(2 * m * (V0 - E)) / hbar;
  return Math.exp(-2 * kappa * a);
}

// A very lightweight pseudo time evolution (NOT physically rigorous): shift packet + apply damping in barrier region for visualization speed.
export function step(state: SimulationState, params: TunnelingParams, dt: number, barrierCenter: number) {
  const { barrierHeight, barrierWidth } = params;
  const attenuation = 0.995;
  const shift = 1; // number of indices to shift right per step (controls velocity)
  for (let s = 0; s < shift; s++) {
    const lastRe = state.psiRe[state.N - 1];
    const lastIm = state.psiIm[state.N - 1];
    for (let i = state.N - 1; i > 0; i--) {
      state.psiRe[i] = state.psiRe[i - 1];
      state.psiIm[i] = state.psiIm[i - 1];
    }
    state.psiRe[0] = lastRe * 0.0;
    state.psiIm[0] = lastIm * 0.0;
  }
  // Apply barrier attenuation
  for (let i = 0; i < state.N; i++) {
    const x = state.x[i];
    if (Math.abs(x - barrierCenter) < barrierWidth / 2) {
      const factor = Math.exp(-0.5 * (barrierHeight) * dt) * attenuation;
      state.psiRe[i] *= factor;
      state.psiIm[i] *= factor;
    }
  }
  state.time += dt;
}

export function probabilityDensity(re: Float32Array, im: Float32Array): Float32Array {
  const N = re.length;
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) out[i] = re[i] * re[i] + im[i] * im[i];
  return out;
}
