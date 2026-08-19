import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';

export interface CodeSnippetBoxProps {
  readonly code: string;
  readonly fileName?: string;
  readonly badgeLabel?: string;
  readonly badgeClass?: string;
}

export function CodeSnippetBox({
  code,
  fileName,
  badgeLabel,
  badgeClass = 'bg-purple-950 text-fuchsia-300 border-purple-800'
}: CodeSnippetBoxProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-purple-900/60 bg-[#0c0517]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#130a24] border-b border-purple-900/50">
        <div className="flex items-center gap-2">
          {fileName && (
            <>
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-mono text-purple-300 font-semibold">{fileName}</span>
            </>
          )}
          {badgeLabel && (
            <span className={`text-[11px] px-2 py-0.5 rounded border font-mono ${badgeClass}`}>
              {badgeLabel}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-700/40 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-purple-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-purple-100 overflow-x-auto leading-relaxed max-h-96">
        <code>{code}</code>
      </pre>
    </div>
  );
}
