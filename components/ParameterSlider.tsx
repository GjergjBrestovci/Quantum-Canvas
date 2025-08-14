import React from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  info?: string;
  onInfo?: () => void;
}

export function ParameterSlider({ label, min, max, step, value, onChange, info, onInfo }: SliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-400">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-accent font-mono">{value.toFixed(3)}</span>
          {info && <button onClick={onInfo} className="text-accent2 hover:underline" title={info}>i</button>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-accent"
      />
    </div>
  );
}
