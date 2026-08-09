import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { DateRangeState } from '../utils/filterEventsByDateRange';
import { calculatePrefabDateRange } from '../utils/calculatePrefabDateRange';

export interface DateRangePickerProps {
  readonly range: DateRangeState;
  readonly onChange: (range: DateRangeState) => void;
}

type Preset = DateRangeState['preset'];

interface PresetOption {
  readonly value: Preset;
  readonly label: string;
  readonly short: string;
}

const PRESETS: readonly PresetOption[] = [
  { value: '24h', label: 'Last 24 Hours', short: 'Last 24h' },
  { value: '7d',  label: 'Last 7 Days',   short: 'Last 7d'  },
  { value: '30d', label: 'Last 30 Days',  short: 'Last 30d' },
  { value: 'all', label: 'All Time',      short: 'All Time' },
  { value: 'custom', label: 'Custom Range', short: 'Custom' },
];

const formatDateLabel = (range: DateRangeState): string => {
  if (range.preset !== 'custom') {
    return PRESETS.find(p => p.value === range.preset)?.label ?? 'All Time';
  }
  if (range.startDate && range.endDate) {
    const fmt = (d: string) => {
      const date = new Date(d + 'T00:00:00');
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    return `${fmt(range.startDate)} – ${fmt(range.endDate)}`;
  }
  if (range.startDate) return `From ${range.startDate}`;
  if (range.endDate)   return `Until ${range.endDate}`;
  return 'Custom Range';
};

export function DateRangePicker({ range, onChange }: DateRangePickerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<Preset>(range.preset);
  const [pendingStart, setPendingStart] = useState(range.startDate ?? '');
  const [pendingEnd, setPendingEnd]   = useState(range.endDate   ?? '');
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync pending state when external range changes
  useEffect(() => {
    setPendingPreset(range.preset);
    setPendingStart(range.startDate ?? '');
    setPendingEnd(range.endDate ?? '');
  }, [range]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  const handlePresetClick = useCallback((preset: Preset) => {
    setPendingPreset(preset);
    if (preset !== 'custom') {
      const dates = calculatePrefabDateRange(preset);
      setPendingStart(dates.startDate ?? '');
      setPendingEnd(dates.endDate ?? '');
    }
  }, []);

  const handleApply = useCallback(() => {
    if (pendingPreset === 'custom') {
      onChange({ preset: 'custom', startDate: pendingStart, endDate: pendingEnd });
    } else {
      const dates = calculatePrefabDateRange(pendingPreset);
      onChange({ preset: pendingPreset, startDate: dates.startDate, endDate: dates.endDate });
    }
    setOpen(false);
  }, [pendingPreset, pendingStart, pendingEnd, onChange]);

  const handleCancel = useCallback(() => {
    // Reset pending back to committed state
    setPendingPreset(range.preset);
    setPendingStart(range.startDate ?? '');
    setPendingEnd(range.endDate ?? '');
    setOpen(false);
  }, [range]);

  const label = formatDateLabel(range);

  return (
    <div ref={containerRef} className="relative">
      {/* Collapsed Pill Button */}
      <button
        id="global-date-range-pill"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Date range: ${label}. Click to change`}
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer select-none
          ${open
            ? 'bg-fuchsia-950/70 border-fuchsia-500/70 text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.25)]'
            : 'bg-[#140a28] border-purple-900/60 text-purple-200 hover:border-fuchsia-500/50 hover:text-fuchsia-200 hover:bg-fuchsia-950/40'
          }`}
      >
        <Calendar className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" aria-hidden="true" />
        <span>{label}</span>
        <ChevronDown
          className={`w-3 h-3 text-purple-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Floating Dropdown Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Date range selector"
          className="absolute top-full left-0 mt-2 z-50 flex rounded-2xl border border-purple-800/60 bg-[#0e0720]/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(139,92,246,0.25)] overflow-hidden"
          style={{ minWidth: '420px' }}
        >
          {/* Left: Preset List */}
          <div
            role="listbox"
            aria-label="Date range presets"
            className="flex flex-col py-2 border-r border-purple-900/50"
            style={{ minWidth: '180px' }}
          >
            <p className="px-4 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-purple-500">
              Preset
            </p>
            {PRESETS.map(preset => {
              const isSelected = pendingPreset === preset.value;
              return (
                <button
                  key={preset.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handlePresetClick(preset.value)}
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left transition-colors duration-100 cursor-pointer
                    ${isSelected
                      ? 'bg-fuchsia-900/40 text-fuchsia-200 font-semibold'
                      : 'text-purple-200 hover:bg-purple-900/30 hover:text-white'
                    }`}
                >
                  <span>{preset.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          {/* Right: Custom Date Inputs + Apply/Cancel */}
          <div className="flex flex-col flex-1 p-4 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-500 mb-3">
                Custom Dates
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="date-picker-start"
                    className={`text-xs font-semibold transition-colors ${pendingPreset === 'custom' ? 'text-fuchsia-300' : 'text-purple-600'}`}
                  >
                    Start date
                  </label>
                  <input
                    id="date-picker-start"
                    type="date"
                    value={pendingStart}
                    disabled={pendingPreset !== 'custom'}
                    onChange={e => { setPendingPreset('custom'); setPendingStart(e.target.value); }}
                    aria-label="Custom start date"
                    className={`bg-[#0c051a] font-mono text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-fuchsia-400 transition-opacity
                      ${pendingPreset === 'custom'
                        ? 'text-fuchsia-300 border-purple-700/60 opacity-100'
                        : 'text-purple-700 border-purple-900/40 opacity-40 cursor-not-allowed'
                      }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="date-picker-end"
                    className={`text-xs font-semibold transition-colors ${pendingPreset === 'custom' ? 'text-fuchsia-300' : 'text-purple-600'}`}
                  >
                    End date
                  </label>
                  <input
                    id="date-picker-end"
                    type="date"
                    value={pendingEnd}
                    disabled={pendingPreset !== 'custom'}
                    onChange={e => { setPendingPreset('custom'); setPendingEnd(e.target.value); }}
                    aria-label="Custom end date"
                    className={`bg-[#0c051a] font-mono text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-fuchsia-400 transition-opacity
                      ${pendingPreset === 'custom'
                        ? 'text-fuchsia-300 border-purple-700/60 opacity-100'
                        : 'text-purple-700 border-purple-900/40 opacity-40 cursor-not-allowed'
                      }`}
                  />
                </div>
              </div>

              {pendingPreset !== 'custom' && (
                <p className="mt-3 text-[11px] text-purple-600 italic">
                  Select "Custom Range" above to enter dates manually.
                </p>
              )}
            </div>

            {/* Apply / Cancel */}
            <div className="flex gap-2 mt-auto pt-2 border-t border-purple-900/40">
              <button
                onClick={handleCancel}
                className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-purple-800/60 text-purple-300 hover:bg-purple-900/30 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                id="date-picker-apply"
                onClick={handleApply}
                className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-fuchsia-700 hover:bg-fuchsia-600 text-white transition-colors shadow-[0_0_10px_rgba(217,70,239,0.3)]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
