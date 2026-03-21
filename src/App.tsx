/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, Divide, Equal, Minus, Plus, X, RotateCcw, Percent } from 'lucide-react';

// Mock Ad Component for demonstration
const AdPlaceholder = ({ position, id }: { position: 'top' | 'bottom'; id: string }) => (
  <div 
    id={id}
    className={`w-full bg-neutral-800/50 border border-neutral-700/50 rounded-lg flex items-center justify-center text-neutral-500 text-xs font-mono py-4 my-4 transition-all hover:bg-neutral-800`}
  >
    <div className="flex flex-col items-center gap-1">
      <span className="uppercase tracking-widest opacity-50">Advertisement</span>
      <span className="text-[10px]">{position.toUpperCase()} BANNER UNIT</span>
    </div>
  </div>
);

export default function App() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [calcCount, setCalcCount] = useState(0);
  const [showInterstitial, setShowInterstitial] = useState(false);

  // Ad Integration Logic
  const triggerInterstitialAd = useCallback(() => {
    console.log('AdSense: Triggering Interstitial Ad Unit...');
    // In a real scenario, you would call your ad provider's SDK here
    // e.g., window.adsbygoogle.push({ ... });
    setShowInterstitial(true);
  }, []);

  useEffect(() => {
    // Trigger ad every 5-10 calculations (using 5 for demo)
    if (calcCount > 0 && calcCount % 5 === 0) {
      triggerInterstitialAd();
    }
  }, [calcCount, triggerInterstitialAd]);

  const handleNumber = (num: string) => {
    if (display === '0' || lastResult !== null) {
      setDisplay(num);
      setLastResult(null);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
    setLastResult(null);
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      // Using Function constructor as a safer alternative to eval for simple math
      // In production, a math parser library like mathjs is preferred
      const result = new Function(`return ${fullEquation.replace('×', '*').replace('÷', '/')}`)();
      
      const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, '');
      
      setDisplay(formattedResult);
      setEquation('');
      setLastResult(result);
      setCalcCount(prev => prev + 1);
    } catch (error) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setLastResult(null);
  };

  const toggleSign = () => {
    setDisplay((parseFloat(display) * -1).toString());
  };

  const handlePercent = () => {
    setDisplay((parseFloat(display) / 100).toString());
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-orange-500/30 flex flex-col items-center justify-center p-4">
      
      {/* Top Ad Unit */}
      <div className="w-full max-w-md">
        <AdPlaceholder position="top" id="top-banner-ad" />
      </div>

      {/* Main Calculator Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1C1C1E] rounded-[40px] p-6 shadow-2xl border border-white/5 relative overflow-hidden"
      >
        {/* Display Area */}
        <div className="flex flex-col items-end justify-end h-48 mb-6 px-4">
          <div className="text-neutral-500 text-xl font-light h-8 overflow-hidden text-ellipsis whitespace-nowrap">
            {equation}
          </div>
          <motion.div 
            key={display}
            initial={{ scale: 0.95, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-light tracking-tighter overflow-hidden text-ellipsis w-full text-right"
          >
            {display}
          </motion.div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* Row 1 */}
          <CalcButton label="AC" onClick={clear} variant="secondary" />
          <CalcButton label="+/-" onClick={toggleSign} variant="secondary" />
          <CalcButton label="%" onClick={handlePercent} variant="secondary" icon={<Percent size={20} />} />
          <CalcButton label="÷" onClick={() => handleOperator('÷')} variant="accent" icon={<Divide size={24} />} />

          {/* Row 2 */}
          <CalcButton label="7" onClick={() => handleNumber('7')} />
          <CalcButton label="8" onClick={() => handleNumber('8')} />
          <CalcButton label="9" onClick={() => handleNumber('9')} />
          <CalcButton label="×" onClick={() => handleOperator('×')} variant="accent" icon={<X size={24} />} />

          {/* Row 3 */}
          <CalcButton label="4" onClick={() => handleNumber('4')} />
          <CalcButton label="5" onClick={() => handleNumber('5')} />
          <CalcButton label="6" onClick={() => handleNumber('6')} />
          <CalcButton label="-" onClick={() => handleOperator('-')} variant="accent" icon={<Minus size={24} />} />

          {/* Row 4 */}
          <CalcButton label="1" onClick={() => handleNumber('1')} />
          <CalcButton label="2" onClick={() => handleNumber('2')} />
          <CalcButton label="3" onClick={() => handleNumber('3')} />
          <CalcButton label="+" onClick={() => handleOperator('+')} variant="accent" icon={<Plus size={24} />} />

          {/* Row 5 */}
          <CalcButton label="0" onClick={() => handleNumber('0')} className="col-span-2 text-left pl-8" />
          <CalcButton label="." onClick={() => handleNumber('.')} />
          <CalcButton label="=" onClick={calculate} variant="accent" icon={<Equal size={24} />} />
        </div>
      </motion.div>

      {/* Bottom Ad Unit */}
      <div className="w-full max-w-md">
        <AdPlaceholder position="bottom" id="bottom-banner-ad" />
      </div>

      {/* Interstitial Ad Overlay (Mock) */}
      <AnimatePresence>
        {showInterstitial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6"
          >
            <div className="max-w-lg w-full bg-[#1C1C1E] rounded-3xl p-8 border border-white/10 relative">
              <button 
                onClick={() => setShowInterstitial(false)}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <RotateCcw size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Interstitial Ad Unit</h2>
                  <p className="text-neutral-400">This is a placeholder for your interstitial advertisement. It triggers every 5 calculations to maximize revenue.</p>
                </div>
                <div className="w-full aspect-video bg-neutral-800 rounded-xl flex items-center justify-center border border-dashed border-neutral-600">
                  <span className="text-neutral-500 font-mono text-sm">AD CONTENT AREA</span>
                </div>
                <button 
                  onClick={() => setShowInterstitial(false)}
                  className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Close Advertisement
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-8 text-neutral-600 text-[10px] uppercase tracking-[0.2em]">
        ProCalc v1.0 • Ad-Supported Professional Tool
      </footer>
    </div>
  );
}

interface CalcButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'number' | 'accent' | 'secondary';
  icon?: React.ReactNode;
  className?: string;
}

function CalcButton({ label, onClick, variant = 'number', icon, className = '' }: CalcButtonProps) {
  const baseStyles = "h-16 rounded-full flex items-center justify-center text-2xl font-medium transition-all active:scale-95 select-none";
  
  const variants = {
    number: "bg-[#333333] hover:bg-[#444444] text-white",
    accent: "bg-[#FF9F0A] hover:bg-[#FFB340] text-white",
    secondary: "bg-[#A5A5A5] hover:bg-[#D4D4D2] text-black",
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {icon || label}
    </button>
  );
}
