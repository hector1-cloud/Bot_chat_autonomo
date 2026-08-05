import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Shield, Cpu, Activity, ChevronRight, XCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'command' | 'stdout' | 'stderr' | 'system';
  content: string;
}

export const BashConsole: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      type: 'system',
      content: 'HECTRON-OMEGA Security Shell v1.0.0 (Restricted Environment)'
    },
    {
      id: '2',
      timestamp: new Date().toISOString(),
      type: 'system',
      content: 'System ready. Type "help" to see allowed commands.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const appendLog = (type: LogEntry['type'], content: string) => {
    if (!content.trim() && type !== 'command') return;
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type,
      content
    }]);
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputValue.trim();
    if (!cmd) return;

    setInputValue('');
    appendLog('command', cmd);

    if (cmd.toLowerCase() === 'clear') {
      setLogs([]);
      return;
    }
    
    if (cmd.toLowerCase() === 'help') {
      appendLog('stdout', 'Available commands:\n- ls [dir]\n- pwd\n- date\n- uptime\n- whoami\n- echo [text]\n- python [script.py]\n- node [script.js]\n- clear\n\n*This is a restricted execution environment. Unauthorized commands will be blocked and audited.*');
      return;
    }

    setIsExecuting(true);
    try {
      const response = await fetch('/api/console/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });

      const data = await response.json();

      if (response.status === 403) {
        appendLog('stderr', data.error);
        appendLog('system', '[AUDIT] Unauthorized command attempt logged.');
      } else {
        if (data.stdout) appendLog('stdout', data.stdout);
        if (data.stderr) appendLog('stderr', data.stderr);
        if (data.error && !data.stderr) appendLog('stderr', data.error);
        if (data.exitCode !== 0) {
          appendLog('system', `Process exited with code ${data.exitCode}`);
        }
      }
    } catch (error: any) {
      appendLog('stderr', `Connection Error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] border border-slate-800 rounded-xl overflow-hidden font-mono text-sm relative shadow-2xl">
      {/* Console Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-bold text-xs uppercase tracking-wider">System Console</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400/80 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
            <Shield className="w-3 h-3" /> Restricted Mode
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3 h-3" /> vCore: Active
          </span>
        </div>
      </div>

      {/* Logs Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 bg-black/50">
        {logs.map((log) => (
          <div key={log.id} className="whitespace-pre-wrap word-break">
            {log.type === 'command' && (
              <div className="flex items-start text-slate-300 mt-2">
                <span className="text-emerald-500 font-bold mr-2">root@hectron-omega:~$</span>
                <span>{log.content}</span>
              </div>
            )}
            {log.type === 'stdout' && (
              <div className="text-slate-400 pl-2">
                {log.content}
              </div>
            )}
            {log.type === 'stderr' && (
              <div className="text-red-400 pl-2">
                {log.content}
              </div>
            )}
            {log.type === 'system' && (
              <div className="text-blue-400/80 text-xs italic mt-1 mb-1">
                -- {log.content} --
              </div>
            )}
          </div>
        ))}
        {isExecuting && (
          <div className="flex items-center gap-2 text-emerald-500/60 mt-2 pl-2 text-xs animate-pulse">
            <Activity className="w-3 h-3" /> Executing...
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleCommand} className="border-t border-slate-800 bg-slate-950 p-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 font-bold whitespace-nowrap pl-2">root@hectron-omega:~$</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isExecuting}
            className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-700 w-full"
            placeholder={isExecuting ? "Executing..." : "Enter command..."}
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </form>
    </div>
  );
};
