"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Logo } from '../../components/Logo';
import { ParameterSlider } from '../../components/ParameterSlider';
import { QuantumTutorSidebar } from '../../components/QuantumTutorSidebar';
import { gaussianPacket, probabilityDensity, barrierPotential, transmissionCoefficient, step } from '../../lib/tunneling';
import Link from 'next/link';

export default function TunnelingPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [barrierHeight, setBarrierHeight] = useState(5);
  const [barrierWidth, setBarrierWidth] = useState(1);
  const [energy, setEnergy] = useState(2);
  const mass = 1; const hbar = 1;
  const [running, setRunning] = useState(true);
  const [state, setState] = useState(() => {
    const N = 600;
    const dx = 0.05;
    const x = new Float32Array(N);
    for (let i=0;i<N;i++) x[i] = (i - N/2)*dx;
    const g = gaussianPacket(N, dx, -8, 2.5, 1.2);
    return { psiRe: g.re, psiIm: g.im, x, dx, N, time: 0 };
  });

  useEffect(() => {
    let anim: number;
    function loop() {
      if (running) {
        step(state, { barrierHeight, barrierWidth, energy, mass, hbar }, 0.02, 0);
        draw();
      }
      anim = requestAnimationFrame(loop);
    }
    anim = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(anim);
  }, [running, barrierHeight, barrierWidth, energy, state]);

  function draw() {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    const W = canvas.width = canvas.clientWidth; const H = canvas.height = canvas.clientHeight;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H);
    const prob = probabilityDensity(state.psiRe, state.psiIm);
    const maxP = Math.max(...prob);
    ctx.strokeStyle = '#00ffff';
    ctx.beginPath();
    for (let i=0;i<state.N;i++) {
      const x = ((state.x[i] - state.x[0]) / (state.x[state.N-1] - state.x[0])) * W;
      const y = H - (prob[i]/maxP) * (H*0.6) - 40;
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    // barrier
    ctx.fillStyle = '#bb86fc55';
    const bw = barrierWidth / (state.x[state.N-1]-state.x[0]) * W;
    const bx = ((0 - barrierWidth/2) - state.x[0])/(state.x[state.N-1]-state.x[0]) * W;
    ctx.fillRect(bx, 0, bw, H);
  }

  const T = transmissionCoefficient(energy, barrierHeight, barrierWidth, mass, hbar);

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="flex gap-6 text-sm">
              <Link href="/" className="hover:text-accent">Home</Link>
              <Link href="/double-slit" className="hover:text-accent">Double Slit</Link>
              <Link href="/duality" className="hover:text-accent">Duality</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setRunning(r => !r)} className="px-3 py-1 rounded bg-accent2/20 text-accent2 text-xs hover:bg-accent2/30">{running?'Pause':'Resume'}</button>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col w-80 p-4 gap-4 border-r border-gray-800 bg-[#181818] text-sm">
            <ParameterSlider label="Barrier Height V₀" min={1} max={10} step={0.1} value={barrierHeight} onChange={setBarrierHeight} info="Higher barrier reduces transmission" />
            <ParameterSlider label="Barrier Width a" min={0.5} max={3} step={0.1} value={barrierWidth} onChange={setBarrierWidth} info="Wider barrier reduces transmission" />
            <ParameterSlider label="Energy E" min={0.5} max={9} step={0.1} value={energy} onChange={setEnergy} info="Higher energy increases transmission" />
            <div className="text-xs text-gray-400 leading-relaxed pt-2 space-y-1">
              <div>T ≈ exp(-2κa), κ = sqrt(2m(V₀ - E))/ħ</div>
              <div>Current T estimate: <span className="text-accent font-mono">{T.toFixed(3)}</span></div>
            </div>
          </div>
          <div className="flex-1 relative">
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="absolute bottom-2 left-2 text-[10px] text-gray-500">t = {state.time.toFixed(2)}</div>
          </div>
          <QuantumTutorSidebar context={`Tunneling; barrierHeight=${barrierHeight}, barrierWidth=${barrierWidth}, energy=${energy}`} />
        </div>
      </div>
    </div>
  );
}
