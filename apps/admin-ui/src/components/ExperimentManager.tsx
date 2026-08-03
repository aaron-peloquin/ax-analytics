import React, { useState } from 'react';
import { CreateExperimentForm } from './CreateExperimentForm';
import { Plus, Edit2, Sliders } from 'lucide-react';

export interface ExperimentItem {
  readonly id: string;
  readonly key: string;
  readonly variantA: string;
  readonly variantB: string;
  readonly split: number;
  readonly active: boolean;
}

export function ExperimentManager(): React.ReactElement {
  const [experiments, setExperiments] = useState<readonly ExperimentItem[]>([
    { id: '1', key: 'new_inventory_schema_v2', variantA: 'Legacy Schema (Variant A)', variantB: 'Strict Enums (Variant B)', split: 50, active: true },
    { id: '2', key: 'proactive_microcopy_tools', variantA: 'Passive Tool Descriptions (Variant A)', variantB: 'Proactive Guidance Microcopy (Variant B)', split: 100, active: true }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const handleSaveRule = (ruleData: Omit<ExperimentItem, 'id'>) => {
    if (editingRuleId) {
      setExperiments(prev => prev.map(exp => exp.id === editingRuleId ? { ...exp, ...ruleData } : exp));
      setEditingRuleId(null);
    } else {
      const newRule: ExperimentItem = {
        id: String(Date.now()),
        ...ruleData
      };
      setExperiments(prev => [newRule, ...prev]);
      setShowCreateForm(false);
    }
  };

  const editingRule = experiments.find(exp => exp.id === editingRuleId);

  return (
    <section aria-label="A/B Experiment Rule Manager" className="neon-panel p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            Sticky A/B Experiment Manager
            <Sliders className="w-5 h-5 text-fuchsia-400" aria-hidden="true" />
          </h2>
          <p className="text-xs text-purple-300/70 mt-1">
            Rules evaluated deterministically via <code className="text-fuchsia-300 font-mono">hash(entity_id + experiment_id) % 100</code>
          </p>
        </div>

        {!showCreateForm && !editingRuleId && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="neon-glow-btn text-xs px-4 py-2 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          >
            <Plus className="w-4 h-4 text-fuchsia-200" aria-hidden="true" />
            + Create Rule
          </button>
        )}
      </div>

      {/* Creation / Edit Form */}
      {(showCreateForm || editingRule) && (
        <CreateExperimentForm
          initialRule={editingRule}
          onSave={handleSaveRule}
          onCancel={() => { setShowCreateForm(false); setEditingRuleId(null); }}
        />
      )}

      {/* Rule List */}
      <div className="space-y-4">
        {experiments.map(exp => (
          <div key={exp.id} className="p-4 rounded-2xl border border-purple-900/60 bg-[#140a28]/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-purple-500/40 transition-colors">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-fuchsia-300">{exp.key}</span>
                {exp.split === 0 && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                    Forced to Variant A (100% A)
                  </span>
                )}
                {exp.split === 100 && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40">
                    Forced to Variant B (100% B)
                  </span>
                )}
                {exp.split > 0 && exp.split < 100 && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Split ({100 - exp.split}% A / {exp.split}% B)
                  </span>
                )}
              </div>
              <div className="text-xs text-purple-300/80 mt-1.5 space-x-4">
                <span>Variant A: <strong className="text-purple-100">{exp.variantA}</strong></span>
                <span>Variant B: <strong className="text-purple-100">{exp.variantB}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-xs text-purple-300/70 block">Current Traffic Assignment</span>
                <span className="text-sm font-bold text-fuchsia-300 font-mono">
                  {exp.split === 0 ? '100% Variant A' : exp.split === 100 ? '100% Variant B' : `${exp.split}% to Variant B`}
                </span>
              </div>

              <button
                onClick={() => { setShowCreateForm(false); setEditingRuleId(exp.id); }}
                aria-label={`Edit experiment rule ${exp.key}`}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-950/80 text-purple-200 border border-purple-500/40 hover:bg-purple-900/60 hover:text-white flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              >
                <Edit2 className="w-3.5 h-3.5 text-fuchsia-300" aria-hidden="true" />
                Edit Rule
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
