import React, { useState } from 'react';

export interface ScratcherDrop {
  prob: number;
  points: number;
}

interface ScratcherProps {
  drops: ScratcherDrop[];
  onScratch: (points: number) => void;
  className?: string;
  buttonLabel?: string;
}

const Scratcher: React.FC<ScratcherProps> = ({ drops, onScratch, className = '', buttonLabel = 'Scratch!' }) => {
  const [scratched, setScratched] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const handleScratch = () => {
    if (scratched) return;
    let total = 0;
    const r = Math.random();
    for (const d of drops) {
      total += d.prob;
      if (r < total) {
        setResult(d.points);
        onScratch(d.points);
        break;
      }
    }
    setScratched(true);
  };

  return (
    <div className={`mt-4 p-4 bg-yellow-100 rounded text-center ${className}`}>
      <button className="px-4 py-2 bg-amber-500 text-black rounded" onClick={handleScratch} disabled={scratched}>
        {buttonLabel}
      </button>
      {scratched && <div className="mt-2 text-lg font-bold">You won {result} bonus points!</div>}
    </div>
  );
};

export default Scratcher;
