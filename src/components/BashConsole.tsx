import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Shield, Cpu, Radio, Send } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export const BashConsole: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'fallback'>('connecting');
  const [inputVal, setInputVal] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const termInstanceRef = useRef<Terminal | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: 13,
      theme: {
        background: '#090d16',
        foreground: '#e2e8f0',
        cursor: '#38bdf8',
        selectionBackground: '#334155',
        black: '#000000',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#38bdf8',
        white: '#f1f5f9',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    termInstanceRef.current = term;

    term.writeln('\x1b[1;32mHECTRON-OMEGA Real-Time Terminal Pipeline v2.0\x1b[0m');
    term.writeln('\x1b[38;5;244mConectando al servidor mediante WebSockets (Socket.IO)...\x1b[0m\r\n');

    // Connect Socket.IO
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus('connected');
      term.writeln('\x1b[1;36m[System] Canal de WebSocket establecido con éxito.\x1b[0m\r\n');
    });

    socket.on('terminal-output', (data: string) => {
      term.write(data);
    });

    socket.on('disconnect', () => {
      setStatus('fallback');
      term.writeln('\r\n\x1b[1;33m[Notice] WebSocket desconectado. Pasando a modo consola HTTP síncrono.\x1b[0m\r\n');
    });

    socket.on('connect_error', () => {
      setStatus('fallback');
    });

    // Capture user keyboard input on xterm.js directly
    term.onData((data) => {
      if (socket.connected) {
        socket.emit('terminal-input', data);
      }
    });

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (e) {
        // ignore fit error
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.disconnect();
      term.dispose();
    };
  }, []);

  const handleFallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isExecuting) return;

    const cmd = inputVal.trim();
    setInputVal('');
    setIsExecuting(true);

    if (termInstanceRef.current) {
      termInstanceRef.current.writeln(`\r\n\x1b[1;32mroot@hectron-omega:~$\x1b[0m ${cmd}`);
    }

    if (socketRef.current?.connected) {
      socketRef.current.emit('terminal-input', cmd + '\n');
      setIsExecuting(false);
      return;
    }

    try {
      const res = await fetch('/api/console/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      if (termInstanceRef.current) {
        if (data.stdout) termInstanceRef.current.write(data.stdout.replace(/\n/g, '\r\n'));
        if (data.stderr) termInstanceRef.current.write(`\x1b[31m${data.stderr.replace(/\n/g, '\r\n')}\x1b[0m`);
        if (data.error && !data.stderr) termInstanceRef.current.write(`\x1b[31m${data.error}\x1b[0m\r\n`);
      }
    } catch (err: any) {
      if (termInstanceRef.current) {
        termInstanceRef.current.writeln(`\x1b[31mError de conexión: ${err.message}\x1b[0m`);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[440px] bg-[#090d16] border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-2xl relative">
      {/* Console Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-200 font-bold uppercase tracking-wider text-xs">
            Terminal Unix / Node Real-Time Shell
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold border flex items-center gap-1 ${
            status === 'connected' 
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
              : 'bg-amber-950/80 text-amber-300 border-amber-800'
          }`}>
            <Radio className="w-3 h-3 animate-pulse" />
            {status === 'connected' ? 'WebSocket (Pty/Bash Active)' : 'HTTP Shell Mode'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Linux Container
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Secure Sandbox
          </span>
        </div>
      </div>

      {/* xterm.js Terminal Container */}
      <div className="flex-1 p-3 bg-[#090d16] overflow-hidden min-h-[340px]" ref={terminalRef} />

      {/* Input Fallback Bar */}
      <form onSubmit={handleFallbackSubmit} className="border-t border-slate-800 bg-slate-950 p-2.5 flex items-center gap-2 shrink-0">
        <span className="text-emerald-400 font-bold whitespace-nowrap pl-1">root@hectron-omega:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isExecuting}
          placeholder="Escribe comandos aquí (ej: ls, python3 -c 'print(42)', uname -a, date)..."
          className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-600 text-xs"
        />
        <button
          type="submit"
          disabled={isExecuting || !inputVal.trim()}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-sans text-xs rounded-lg transition-colors flex items-center gap-1 font-semibold"
        >
          <Send className="w-3 h-3" />
          <span>Enviar</span>
        </button>
      </form>
    </div>
  );
};
