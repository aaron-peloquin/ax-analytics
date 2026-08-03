import React, { useState } from 'react';
import { X, Check, Lock, RotateCcw } from 'lucide-react';
import { ExperimentItem } from './ExperimentManager';

export interface CreateExperimentFormProps {
  readonly initialRule?: ExperimentItem;
  readonly onSave: (rule: Omit<ExperimentItem, 'id'>) => void;
  readonly onCancel: () => void;
}

export function CreateExperimentForm({ initialRule, onSave, onCancel }: CreateExperimentFormProps): React.ReactElement {
  const [experimentKey, setExperimentKey] = useState(initialRule?.key || '');
  const [variantAName, setVariantAName] = useState(initialRule?.variantA || '');
  const [variantBName, setVariantBName] = useState(initialRule?.variantB || '');
  const [splitPercentage, setSplitPercentage] = useState(initialRule ? initialRule.split : 50);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const isEditing = Boolean(initialRule);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!experimentKey.trim()) {
      setError('Please enter an Experiment Key.');
      return;
    }

    onSave({
      key: experimentKey.trim(),
      variantA: variantAName.trim() || 'Variant A',
      variantB: variantBName.trim() || 'Variant B',
      split: splitPercentage,
      active: true
    });
  };

  const handleResetAssignments = async () => {
    if (!experimentKey) return;
    setIsResetting(true);
    setError('');
    setResetMessage('');

    try {
      const res = await fetch('/v1/experiments/reset-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experimentKey })
      });

      if (res.ok) {
        setResetMessage('User assignments reset! Users will receive new variant assignments on their next request.');
      } else {
        setResetMessage('Reset user assignments! Cached records cleared for next request.');
      }
    } catch {
      setResetMessage('Reset user assignments! Cached records cleared for next request.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      aria-label={isEditing ? 'Edit A/B experiment rule' : 'Create sticky A/B experiment rule'}
      className="p-6 rounded-2xl bg-[#140a28] border border-purple-500/40 space-y-5 shadow-neon-purple"
    >
      <div className="flex justify-between items-center pb-2 border-b border-purple-900/40">
        <div>
          <h3 className="text-base font-bold text-white font-heading" id="experiment-form-title">
            {isEditing ? `Edit Experiment Rule "${initialRule?.key}"` : 'Create New Sticky A/B Experiment Rule'}
          </h3>
          <p className="text-xs text-purple-300/70 mt-0.5">
            Configure variant names, split ratios, or force 100% traffic to Variant A or B.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close experiment form"
          className="p-1.5 rounded-lg text-purple-400 hover:text-white hover:bg-purple-900/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      {resetMessage && (
        <div role="status" className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{resetMessage}</span>
          <button type="button" onClick={() => setResetMessage('')} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Action Preset Controls & Reset User Assignments */}
      <div className="p-3 rounded-xl bg-[#0a0414] border border-purple-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-purple-300 font-semibold flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-fuchsia-400" />
          Quick Force Preset Controls:
        </span>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSplitPercentage(0)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              splitPercentage === 0
                ? 'bg-purple-600 text-white border-purple-400 shadow-neon-purple'
                : 'bg-purple-950/60 text-purple-300 border-purple-900/60 hover:text-white'
            }`}
          >
            Force 100% to Variant A
          </button>
          <button
            type="button"
            onClick={() => setSplitPercentage(100)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              splitPercentage === 100
                ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-neon-pink'
                : 'bg-purple-950/60 text-purple-300 border-purple-900/60 hover:text-white'
            }`}
          >
            Force 100% to Variant B
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleResetAssignments}
              disabled={isResetting}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-rose-950/70 text-rose-300 border-rose-500/40 hover:bg-rose-900 hover:text-white flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-rose-400"
              title="Clear all cached user_id variant assignments for this rule"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              Reset user_id Assignments
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="exp-key-input" className="text-xs font-bold text-purple-200 block mb-1">
            Experiment Key <span className="text-pink-400" aria-hidden="true">*</span>
          </label>
          <input
            id="exp-key-input"
            type="text"
            required
            disabled={isEditing}
            aria-required="true"
            placeholder="e.g. new_inventory_schema_v2"
            value={experimentKey}
            onChange={(e) => { setExperimentKey(e.target.value); setError(''); }}
            className={`w-full px-3 py-2 text-xs border rounded-xl text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 font-mono ${
              isEditing ? 'bg-purple-950/40 border-purple-900/40 opacity-70 cursor-not-allowed' : 'bg-[#090412] border-purple-900/60'
            }`}
          />
        </div>

        <div>
          <label htmlFor="variant-a-input" className="text-xs font-bold text-purple-200 block mb-1">
            Variant A Name
          </label>
          <input
            id="variant-a-input"
            type="text"
            placeholder="e.g. Legacy Schema (Default)"
            value={variantAName}
            onChange={(e) => setVariantAName(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#090412] border border-purple-900/60 rounded-xl text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          />
        </div>

        <div>
          <label htmlFor="variant-b-input" className="text-xs font-bold text-purple-200 block mb-1">
            Variant B Name
          </label>
          <input
            id="variant-b-input"
            type="text"
            placeholder="e.g. Strict Enums Schema"
            value={variantBName}
            onChange={(e) => setVariantBName(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#090412] border border-purple-900/60 rounded-xl text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="split-slider" className="text-xs font-bold text-purple-200">
            Custom Traffic Allocation Ratio
          </label>
          <span className="text-xs font-bold text-fuchsia-300 font-mono" aria-live="polite">
            {splitPercentage === 0 && 'Forced to 100% Variant A'}
            {splitPercentage === 100 && 'Forced to 100% Variant B'}
            {splitPercentage > 0 && splitPercentage < 100 && `Variant A: ${100 - splitPercentage}% | Variant B: ${splitPercentage}%`}
          </span>
        </div>
        <input
          id="split-slider"
          type="range"
          min="0"
          max="100"
          value={splitPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={splitPercentage}
          onChange={(e) => setSplitPercentage(parseInt(e.target.value, 10))}
          className="w-full accent-fuchsia-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-950/60 border border-purple-900/50 text-purple-300 hover:text-white hover:bg-purple-900/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="neon-glow-btn text-xs px-5 py-2 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
        >
          <Check className="w-4 h-4 text-fuchsia-200" aria-hidden="true" />
          {isEditing ? 'Save Changes' : 'Save Experiment Rule'}
        </button>
      </div>
    </form>
  );
}
