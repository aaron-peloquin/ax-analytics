import React from 'react';
import { SlidersHorizontal, Check } from 'lucide-react';
import { ALL_RAW_COLUMNS } from '../utils/getRawSpanColumnDefs.js';

export interface ColumnPickerModalProps {
  readonly show: boolean;
  readonly onClose: () => void;
  readonly onToggleShow: () => void;
  readonly visibleColKeys: ReadonlySet<string>;
  readonly onToggleColumn: (key: string) => void;
}

export function ColumnPickerModal({
  show,
  onClose,
  onToggleShow,
  visibleColKeys,
  onToggleColumn
}: ColumnPickerModalProps): React.ReactElement {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggleShow}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-700/50 text-xs font-medium transition-all shadow-sm"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-fuchsia-400" />
        <span>Column Picker ({visibleColKeys.size}/{ALL_RAW_COLUMNS.length})</span>
      </button>

      {show && (
        <div className="absolute right-0 mt-2 w-64 p-3 bg-[#130a24] border border-purple-700/60 rounded-xl shadow-2xl z-50 text-xs space-y-2 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
            <span className="font-semibold text-fuchsia-300">Visible Columns</span>
            <button
              type="button"
              onClick={onClose}
              className="text-purple-400 hover:text-white text-xs"
            >
              Close
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {ALL_RAW_COLUMNS.map((col) => {
              const isChecked = visibleColKeys.has(col.key);
              return (
                <label
                  key={col.key}
                  onClick={() => onToggleColumn(col.key)}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-purple-900/40 cursor-pointer text-purple-200 select-none"
                >
                  <span>{col.label}</span>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'border-purple-800 bg-purple-950/50'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
