'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface TextInputProps {
  onSubmit: (text: string) => void;
}

const MIN_CHARS = 50;
const MAX_CHARS = 50000;

export function TextInput({ onSubmit }: TextInputProps) {
  const [text, setText] = useState('');
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isValid = chars >= MIN_CHARS && chars <= MAX_CHARS;
  const pct = Math.min(chars / MAX_CHARS, 1);

  return (
    <div>
      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste your text here to check for plagiarism and AI-generated content..."
          className="w-full h-52 bg-ink-900/50 border border-ink-700 focus:border-violet/60 rounded-xl p-4 text-ink-200 placeholder-ink-600 text-sm resize-none outline-none transition-colors leading-relaxed font-mono"
          maxLength={MAX_CHARS}
        />

        {/* Character limit bar */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <div className="w-20 h-1 bg-ink-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pct > 0.9 ? 'bg-red-400' : pct > 0.7 ? 'bg-orange-400' : 'bg-violet'
              }`}
              style={{ width: `${pct * 100}%` }}
            />
          </div>
          <span className="text-ink-600 text-xs font-mono">
            {chars.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-ink-600 text-xs">
          {words > 0 && `${words.toLocaleString()} words · `}
          {chars < MIN_CHARS
            ? `${MIN_CHARS - chars} more characters needed`
            : `${chars.toLocaleString()} / ${MAX_CHARS.toLocaleString()} characters`
          }
        </span>
        {chars > 0 && chars < MIN_CHARS && (
          <span className="text-orange-400 text-xs">Minimum {MIN_CHARS} characters</span>
        )}
      </div>

      {/* Submit */}
      <motion.button
        onClick={() => isValid && onSubmit(text)}
        disabled={!isValid}
        className="w-full mt-4 bg-violet hover:bg-violet-dark disabled:bg-ink-800 disabled:text-ink-600 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-violet/20 hover:shadow-violet/40 disabled:shadow-none disabled:cursor-not-allowed"
        whileHover={isValid ? { scale: 1.01 } : {}}
        whileTap={isValid ? { scale: 0.99 } : {}}
      >
        <Search size={15} className="inline mr-2" />
        Analyze Text
      </motion.button>
    </div>
  );
}
