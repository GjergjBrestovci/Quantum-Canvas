"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Logo } from '../../components/Logo';
import { ParameterSlider } from '../../components/ParameterSlider';
import { QuantumTutorSidebar } from '../../components/QuantumTutorSidebar';
import { sampleIntensity, randomDetection } from '../../lib/doubleSlit';
import Link from 'next/link';

export default function DualityPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wavelength, setWavelength] = useState(0.5);
  const [slitWidth, setSlitWidth] = useState(0.2);
  const [slitSeparation, setSlitSeparation] = useState(0.6);
  const [mode, setMode] = useState<'wave' | 'particle'>('wave');
  const intensityRef = useRef<Float32Array | null>(null);
  const [detections, setDetections] = useState<number[]>([]);

  useEffect(() => {
    intensityRef.current = sampleIntensity({ wavelength, slitWidth, slitSeparation }, 800);
  }, [wavelength, slitWidth, slitSeparation]);

  useEffect(() => {
    let anim: number;
    function loop() {
      if (mode === 'wave') drawWave();
      else {
        const det = randomDetection({ wavelength, slitWidth, slitSeparation }, intensityRef.current || undefined);
        setDetections(d => [...d, det]);
        drawParticles();
      }
      anim = requestAnimationFrame(loop);
    }
    anim = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(anim);
  }, [mode, wavelength, slitWidth, slitSeparation]);

  function drawWave() {
    const canvas = canvasRef.current; if (!canvas || !intensityRef.current) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    const W = canvas.width = canvas.clientWidth; const H = canvas.height = canvas.clientHeight;
    const data = intensityRef.current; ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H);
    for (let x=0;x<W;x++) {
      const idx = Math.floor((x/(W-1))*(data.length-1));
      const val = data[idx];
      ctx.fillStyle = `rgba(187,134,252,${val*0.6})`;
      ctx.fillRect(x,0,1,H);
    }
  }
  function drawParticles() {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    const W = canvas.width = canvas.clientWidth; const H = canvas.height = canvas.clientHeight;
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#bb86fc';
    for (let d of detections) {
      const x = ((d+1)/2)*W; const y = Math.random()*H;
      ctx.fillRect(x,y,2,2);
    }
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="flex gap-6 text-sm">
              <Link href="/" className="hover:text-accent">Home</Link>
              <Link href="/double-slit" className="hover:text-accent">Double Slit</Link>
              <Link href="/tunneling" className="hover:text-accent">Tunneling</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMode(m => m==='wave' ? 'particle':'wave')} className="px-3 py-1 rounded bg-accent/20 text-accent text-xs hover:bg-accent/30">Toggle Mode</button>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col w-80 p-4 gap-4 border-r border-gray-800 bg-[#181818] text-sm">
            <ParameterSlider label="Wavelength λ" min={0.2} max={1.0} step={0.01} value={wavelength} onChange={setWavelength} info="Changes fringe spacing" />
            <ParameterSlider label="Slit Width a" min={0.05} max={0.6} step={0.01} value={slitWidth} onChange={setSlitWidth} info="Changes envelope width" />
            <ParameterSlider label="Slit Separation d" min={0.2} max={1.2} step={0.01} value={slitSeparation} onChange={setSlitSeparation} info="Changes fringe density" />
            <div className="text-xs text-gray-400 leading-relaxed pt-2">Wave–Particle duality: same probability distribution underlies both views.</div>
          </div>
          <div className="flex-1 relative">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
          <QuantumTutorSidebar context={`Duality; wavelength=${wavelength}, slitWidth=${slitWidth}, slitSeparation=${slitSeparation}, mode=${mode}`} />
        </div>
      </div>
    </div>
  );
}
