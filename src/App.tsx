/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, Divide, Equal, Minus, Plus, X, RotateCcw, Percent, History, Trash2, Sun, Moon, Coins, ArrowRightLeft, RefreshCw } from 'lucide-react';

// AdMob Configuration
const AD_IDS = {
  APP: 'ca-app-pub-3612651275940744~5017751557',
  TOP_BANNER: 'ca-app-pub-3612651275940744/3490953449',
  BOTTOM_BANNER: 'ca-app-pub-3612651275940744/1131415810'
};

/**
 * Mock AdMob Service
 * When converting to a real mobile app (Capacitor/React Native),
 * replace these calls with the actual AdMob SDK methods.
 */
const AdMobService = {
  showBanner: (position: 'top' | 'bottom') => {
    console.log(`[AdMob] Showing ${position} banner: ${position === 'top' ? AD_IDS.TOP_BANNER : AD_IDS.BOTTOM_BANNER}`);
  }
};

const AdPlaceholder = ({ position, id }: { position: 'top' | 'bottom'; id: string }) => {
  const unitId = position === 'top' ? AD_IDS.TOP_BANNER : AD_IDS.BOTTOM_BANNER;
  
  useEffect(() => {
    AdMobService.showBanner(position);
  }, [position]);

  return (
    <div 
      id={id}
      className="w-full bg-neutral-900 border-y border-neutral-800 flex items-center justify-center text-neutral-500 text-[10px] font-mono py-2 transition-all hover:bg-neutral-800 group"
    >
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="bg-neutral-700 text-white px-1 rounded-[2px] text-[8px] font-bold">AD</span>
          <span className="uppercase tracking-widest">{position} Banner</span>
        </div>
        <span className="text-[7px] opacity-20 group-hover:opacity-40 select-all transition-opacity">{unitId}</span>
      </div>
    </div>
  );
};

export default function App() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [history, setHistory] = useState<{ equation: string; result: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showCurrency, setShowCurrency] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loadingRates, setLoadingRates] = useState(false);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const fetchRates = useCallback(async (base: string) => {
    setLoadingRates(true);
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      const data = await response.json();
      if (data.rates) {
        setExchangeRates(data.rates);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    if (showCurrency) {
      fetchRates(baseCurrency);
    }
  }, [showCurrency, baseCurrency, fetchRates]);

  const convertCurrency = () => {
    const amount = parseFloat(display);
    if (isNaN(amount) || !exchangeRates[targetCurrency]) return '0';
    const result = amount * exchangeRates[targetCurrency];
    return result.toFixed(2);
  };

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
      if (!fullEquation.trim()) return;

      // Check for division by zero explicitly in the string to be more proactive
      // though JS returns Infinity, we want a friendly message
      const sanitizedEquation = fullEquation.replace('×', '*').replace('÷', '/');
      
      const result = new Function(`return ${sanitizedEquation}`)();
      
      if (!isFinite(result)) {
        if (isNaN(result)) {
          setDisplay('Invalid Input');
        } else {
          setDisplay('Division by Zero');
        }
        setEquation('');
        setLastResult(null);
        return;
      }

      const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, '');
      
      // Add to history
      setHistory(prev => [{ equation: fullEquation, result: formattedResult }, ...prev].slice(0, 50));
      
      setDisplay(formattedResult);
      setEquation('');
      setLastResult(result);
    } catch (error) {
      setDisplay('Invalid Expression');
      setEquation('');
      setLastResult(null);
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
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-900'} font-sans selection:bg-orange-500/30 flex flex-col items-center justify-between`}>
      
      {/* Top Ad Unit */}
      <div className="w-full">
        <AdPlaceholder position="top" id="ca-app-pub-3612651275940744/3490953449" />
      </div>

      {/* Main Calculator Container */}
      <main className="flex-1 flex items-center justify-center w-full max-w-md px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full ${theme === 'dark' ? 'bg-[#1C1C1E] border-white/5' : 'bg-white border-neutral-200'} rounded-[40px] p-6 shadow-2xl border relative overflow-hidden transition-colors duration-300`}
          style={{ height: '618px', backgroundColor: '#000000' }}
        >
        {/* Top Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <div className="flex gap-1">
            <button 
              onClick={() => setShowHistory(true)}
              className="p-[6px] text-neutral-500 hover:text-orange-500 transition-colors ml-0 text-justify font-normal text-[11px] leading-[11px] flex items-center justify-center"
              style={{ width: '27px', height: '35px' }}
              title="View History"
            >
              <History size={24} />
            </button>
            <button 
              onClick={() => setShowCurrency(true)}
              className="p-2 text-neutral-500 hover:text-emerald-500 transition-colors"
              title="Currency Converter"
            >
              <Coins size={20} />
            </button>
          </div>

          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-neutral-800 text-yellow-400 hover:bg-neutral-700' : 'bg-neutral-100 text-indigo-600 hover:bg-neutral-200'}`}
            style={{ backgroundColor: '#000000' }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
          </button>
        </div>

        {/* Display Area */}
        <div className="flex flex-col items-end justify-end mb-6 px-4" style={{ width: '290px', height: '178px' }}>
          <div className={`${theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'} text-xl font-light h-8 overflow-hidden text-ellipsis whitespace-nowrap`}>
            {equation}
          </div>
          <motion.div 
            key={display}
            initial={{ scale: 0.95, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-light tracking-tighter overflow-hidden text-ellipsis w-full text-right font-serif"
            style={{ color: theme === 'dark' ? '#04fffe' : '#027b82', fontFamily: 'Georgia' }}
          >
            {display}
          </motion.div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-3" style={{ width: '286px', height: '370px' }}>
          {/* Row 1 */}
          <CalcButton label="AC" onClick={clear} variant="secondary" theme={theme} className="!bg-[#b3d4e1]" />
          <CalcButton label="+/-" onClick={toggleSign} variant="secondary" theme={theme} className="!bg-[#929eff]" />
          <CalcButton label="%" onClick={handlePercent} variant="secondary" theme={theme} icon={<Percent size={20} />} className="!bg-[#5dbde7]" />
          <CalcButton label="÷" onClick={() => handleOperator('÷')} variant="accent" theme={theme} icon={<Divide size={24} />} className="!bg-[#1f2c52]" />

          {/* Row 2 */}
          <CalcButton label="7" onClick={() => handleNumber('7')} theme={theme} className="!bg-[#027b82]" />
          <CalcButton label="8" onClick={() => handleNumber('8')} theme={theme} className="!bg-[#007777]" />
          <CalcButton label="9" onClick={() => handleNumber('9')} theme={theme} className="!bg-[#006969]" />
          <CalcButton label="×" onClick={() => handleOperator('×')} variant="accent" theme={theme} icon={<X size={24} />} className="!bg-[#232f62]" />

          {/* Row 3 */}
          <CalcButton label="4" onClick={() => handleNumber('4')} theme={theme} className="!bg-[#017772]" />
          <CalcButton label="5" onClick={() => handleNumber('5')} theme={theme} className="!bg-[#005959]" />
          <CalcButton label="6" onClick={() => handleNumber('6')} theme={theme} className="!bg-[#00686d]" />
          <CalcButton label="-" onClick={() => handleOperator('-')} variant="accent" theme={theme} icon={<Minus size={24} />} className="!bg-[#2b2b5c]" />

          {/* Row 4 */}
          <CalcButton label="1" onClick={() => handleNumber('1')} theme={theme} className="!bg-[#007664]" />
          <CalcButton label="2" onClick={() => handleNumber('2')} theme={theme} className="!bg-[#00594a]" />
          <CalcButton label="3" onClick={() => handleNumber('3')} theme={theme} className="!bg-[#004e46]" />
          <CalcButton label="+" onClick={() => handleOperator('+')} variant="accent" theme={theme} icon={<Plus size={24} />} className="!bg-[#162c59]" />

          {/* Row 5 */}
          <CalcButton label="0" onClick={() => handleNumber('0')} theme={theme} className="col-span-2 text-left pl-8 !bg-[#0c4c70]" />
          <CalcButton label="." onClick={() => handleNumber('.')} theme={theme} className="!bg-[#01526a]" />
          <CalcButton label="=" onClick={calculate} variant="accent" theme={theme} icon={<Equal size={24} className="border-solid" />} className="!bg-[#386c10]" />
        </div>
      </motion.div>
      </main>

      {/* Bottom Ad Section */}
      <div className="w-full">
        <AdPlaceholder position="bottom" id="ca-app-pub-3612651275940744/1131415810" />
      </div>

      <div className={`mt-4 text-[8px] ${theme === 'dark' ? 'text-neutral-800' : 'text-neutral-300'} font-mono opacity-50`}>
        APP ID: {AD_IDS.APP}
      </div>

      {/* Currency Converter Overlay */}
      <AnimatePresence>
        {showCurrency && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCurrency(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-x-0 bottom-0 z-50 w-full max-w-md mx-auto ${theme === 'dark' ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-neutral-200'} border-t rounded-t-[40px] shadow-2xl p-8 flex flex-col transition-colors duration-300`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Coins size={24} className="text-emerald-500" />
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>Currency</h2>
                </div>
                <button 
                  onClick={() => setShowCurrency(false)}
                  className="p-2 text-neutral-500 hover:text-emerald-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">From</label>
                    <select 
                      value={baseCurrency}
                      onChange={(e) => setBaseCurrency(e.target.value)}
                      className={`w-full p-4 rounded-2xl ${theme === 'dark' ? 'bg-neutral-800 text-white border-white/5' : 'bg-neutral-100 text-neutral-900 border-neutral-200'} border outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none font-medium`}
                    >
                      {['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'CNY'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mt-6">
                    <ArrowRightLeft size={20} className="text-neutral-600" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">To</label>
                    <select 
                      value={targetCurrency}
                      onChange={(e) => setTargetCurrency(e.target.value)}
                      className={`w-full p-4 rounded-2xl ${theme === 'dark' ? 'bg-neutral-800 text-white border-white/5' : 'bg-neutral-100 text-neutral-900 border-neutral-200'} border outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none font-medium`}
                    >
                      {Object.keys(exchangeRates).length > 0 ? (
                        Object.keys(exchangeRates).sort().map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))
                      ) : (
                        ['EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'CNY'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className={`p-8 rounded-[32px] ${theme === 'dark' ? 'bg-neutral-900/50' : 'bg-neutral-50'} border ${theme === 'dark' ? 'border-white/5' : 'border-neutral-100'} flex flex-col items-center gap-2`}>
                  <div className="text-neutral-500 text-sm font-light">
                    {display} {baseCurrency} =
                  </div>
                  <div className="text-4xl font-bold text-emerald-500 flex items-center gap-2">
                    {loadingRates ? (
                      <RefreshCw size={32} className="animate-spin opacity-50" />
                    ) : (
                      <>
                        {convertCurrency()}
                        <span className="text-xl font-medium opacity-60">{targetCurrency}</span>
                      </>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setDisplay(convertCurrency());
                    setShowCurrency(false);
                  }}
                  disabled={loadingRates}
                  className="w-full py-5 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  Apply Result to Calculator
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* History Overlay */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 right-0 z-50 w-full max-w-xs ${theme === 'dark' ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-neutral-200'} border-l shadow-2xl p-6 flex flex-col transition-colors duration-300`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <History size={20} className="text-orange-500" />
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>History</h2>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 text-neutral-500 hover:text-orange-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-4">
                    <History size={48} strokeWidth={1} />
                    <p className="text-sm">No history yet</p>
                  </div>
                ) : (
                  history.map((item, index) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={index} 
                      className={`flex flex-col items-end gap-1 group cursor-pointer border-b ${theme === 'dark' ? 'border-white/5' : 'border-neutral-100'} pb-4 last:border-0`}
                      onClick={() => {
                        setDisplay(item.result);
                        setShowHistory(false);
                      }}
                    >
                      <span className={`${theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'} text-sm font-light group-hover:text-orange-500 transition-colors`}>
                        {item.equation} =
                      </span>
                      <span className={`text-xl font-medium ${theme === 'dark' ? 'text-[#04fffe]' : 'text-[#027b82]'} group-hover:scale-105 transition-transform origin-right`}>
                        {item.result}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
              
              {history.length > 0 && (
                <button 
                  onClick={() => setHistory([])}
                  className="mt-6 py-4 flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors border-t border-white/5"
                >
                  <Trash2 size={16} />
                  Clear History
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* History Overlay */}

      <footer className={`mt-8 ${theme === 'dark' ? 'text-neutral-600' : 'text-neutral-400'} text-[10px] uppercase tracking-[0.2em]`}>
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
  theme?: 'dark' | 'light';
}

function CalcButton({ label, onClick, variant = 'number', icon, className = '', theme = 'dark' }: CalcButtonProps) {
  const baseStyles = "h-16 rounded-full flex items-center justify-center text-2xl font-medium transition-all active:scale-95 select-none";
  
  const variants = {
    number: theme === 'dark' ? "bg-[#333333] hover:bg-[#444444] text-white" : "bg-neutral-200 hover:bg-neutral-300 text-neutral-900",
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
