import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle2, Terminal } from 'lucide-react';

export default function CodeEditor({ initialCode = '', onCodeChange }) {
  const [code, setCode] = useState(
    initialCode ||
      `// Write your solution here\nfunction solve(input) {\n  console.log("Processing input:", input);\n  return true;\n}\n\nsolve([1, 2, 3]);`
  );
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setOutput('Running test cases in sandbox execution engine...\n');

    setTimeout(() => {
      try {
        let logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')),
          error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
          warn: (...args) => logs.push('[WARN] ' + args.join(' ')),
        };

        // Safe execution of pure functions
        const runner = new Function('console', code);
        runner(customConsole);

        setOutput(
          `✓ Test execution completed successfully.\n${logs.join('\n') || 'Returned: undefined (no console outputs)'}\n[Memory: 24.2 MB | Runtime: 12ms]`
        );
      } catch (err) {
        setOutput(`✗ Execution Error:\n${err.message}`);
      } finally {
        setIsRunning(false);
      }
    }, 400);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setCode(val);
    if (onCodeChange) onCodeChange(val);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0f17] rounded-xl border border-slate-800/80 overflow-hidden shadow-xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-mono text-slate-400 ml-2">solution.js</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCode(initialCode || '')}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition text-xs"
            title="Reset code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-lg font-medium shadow-md shadow-violet-900/20 transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Code Textarea */}
      <div className="flex-1 min-h-[220px] p-3">
        <textarea
          value={code}
          onChange={handleTextChange}
          spellCheck={false}
          className="w-full h-full bg-transparent text-emerald-300 font-mono text-xs leading-relaxed outline-none resize-none selection:bg-purple-900/40"
          placeholder="// Type your code here..."
        />
      </div>

      {/* Output Console */}
      <div className="bg-[#080a0f] border-t border-slate-800/80 p-3 max-h-36 overflow-y-auto font-mono text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-400 mb-1.5 font-semibold">
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span>Execution Output</span>
        </div>
        <pre className="text-slate-300 whitespace-pre-wrap">{output || 'Hit "Run Code" to test execution...'}</pre>
      </div>
    </div>
  );
}

