'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  label: string;
  type: 'plagiarism' | 'ai' | 'human';
}

export function ScoreGauge({ score, label, type }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = () => {
    if (type === 'human') return '#22c55e';
    if (score >= 70) return '#ef4444';
    if (score >= 40) return '#f97316';
    return '#22c55e';
  };

  const getGlowColor = () => {
    if (type === 'human') return 'rgba(34, 197, 94, 0.2)';
    if (score >= 70) return 'rgba(239, 68, 68, 0.2)';
    if (score >= 40) return 'rgba(249, 115, 22, 0.2)';
    return 'rgba(34, 197, 94, 0.2)';
  };

  const getRiskLabel = () => {
    if (type === 'human') return 'Human Written';
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    if (score >= 20) return 'Low Risk';
    return 'Minimal';
  };

  const color = getColor();
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * animatedScore) / 100;

  return (
    <motion.div
      className="glass rounded-2xl p-6 flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ boxShadow: `0 0 40px ${getGlowColor()}` }}
    >
      {/* SVG Ring */}
      <div className="relative mb-3">
        <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
          {/* Track */}
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e2040" strokeWidth="10" />
          {/* Progress */}
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>
            {Math.round(animatedScore)}%
          </span>
        </div>
      </div>

      <p className="text-ink-200 font-bold text-sm text-center mb-1">{label}</p>
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{ color, background: `${color}18` }}
      >
        {getRiskLabel()}
      </span>
    </motion.div>
  );
}
