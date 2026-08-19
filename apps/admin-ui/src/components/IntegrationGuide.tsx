import React, { useState } from 'react';
import { IntegrationModeToggle, IntegrationViewMode } from './integration/molecules/IntegrationModeToggle.js';
import { LanguageTabSelector, SupportedLanguage } from './integration/molecules/LanguageTabSelector.js';
import { CurlEndpointsList } from './integration/molecules/CurlEndpointsList.js';
import { CodeSnippetBox } from './integration/atoms/CodeSnippetBox.js';
import { tsTypesCode, pythonTypesCode, kotlinTypesCode, goTypesCode } from './integration/snippets/typeSnippets.js';
import { curlSkillMarkdown } from './integration/snippets/skillDocSnippet.js';
import { Layers, Bot, Globe, ShieldCheck } from 'lucide-react';

export function IntegrationGuide(): React.ReactElement {
  const [viewMode, setViewMode] = useState<IntegrationViewMode>('api');
  const [typeLanguage, setTypeLanguage] = useState<SupportedLanguage>('ts');

  const getLanguageDetails = () => {
    switch (typeLanguage) {
      case 'ts':
        return { code: tsTypesCode, fileName: 'telemetry.ts', badge: 'TypeScript (_v1)', badgeClass: 'bg-purple-950 text-fuchsia-300 border-purple-800' };
      case 'python':
        return { code: pythonTypesCode, fileName: 'models.py', badge: 'Python Pydantic (_v1)', badgeClass: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'kotlin':
        return { code: kotlinTypesCode, fileName: 'TelemetryContracts.kt', badge: 'Kotlin (_v1)', badgeClass: 'bg-sky-950 text-sky-300 border-sky-800' };
      case 'go':
        return { code: goTypesCode, fileName: 'telemetry.go', badge: 'Go Structs (_v1)', badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
    }
  };

  const selectedLang = getLanguageDetails();

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#130a24] to-[#1f0f3d] border border-purple-800/60 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-fuchsia-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Telemetry Ingestion & Integration Guide</h2>
            <p className="text-xs text-purple-300">
              Integrate your GenAI Agent harnesses and web frontends with AX Analytics using HTTP APIs, typed DTOs, or agent skills.
            </p>
          </div>
        </div>

        {/* 3-Tier Taxonomy Quick Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-[#0c0517]/80 border border-purple-900/50 space-y-1">
            <div className="flex items-center gap-1.5 text-fuchsia-300 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>1. Journey Scope</span>
            </div>
            <p className="text-[11px] text-purple-300 font-mono">sessionId</p>
            <p className="text-[11px] text-purple-400">Binds multi-turn interactions across time.</p>
          </div>

          <div className="p-3 rounded-xl bg-[#0c0517]/80 border border-purple-900/50 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-semibold">
              <Bot className="w-3.5 h-3.5" />
              <span>2. Multi-Agent Scope</span>
            </div>
            <p className="text-[11px] text-cyan-300 font-mono">multiagentIdentity</p>
            <p className="text-[11px] text-purple-400">Groups orchestrators & worker pipelines.</p>
          </div>

          <div className="p-3 rounded-xl bg-[#0c0517]/80 border border-purple-900/50 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3. Agent Entity Scope</span>
            </div>
            <p className="text-[11px] text-emerald-300 font-mono">entityId</p>
            <p className="text-[11px] text-purple-400">Identifies the specific persona or worker.</p>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <IntegrationModeToggle viewMode={viewMode} onToggleMode={setViewMode} />

      {viewMode === 'api' ? (
        <div className="space-y-8">
          {/* Language Type DTOs */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">Client Data Transfer Objects (DTOs)</h3>
                <p className="text-xs text-purple-300">Strict readonly schemas for typing telemetry payloads in your services.</p>
              </div>
              <LanguageTabSelector selectedLanguage={typeLanguage} onSelectLanguage={setTypeLanguage} />
            </div>

            <CodeSnippetBox
              code={selectedLang.code}
              fileName={selectedLang.fileName}
              badgeLabel={selectedLang.badge}
              badgeClass={selectedLang.badgeClass}
            />
          </div>

          {/* cURL HTTP API Endpoints */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-white">cURL Ingestion Endpoints</h3>
              <p className="text-xs text-purple-300">Ready-to-run cURL snippets for testing ingestion against your local server.</p>
            </div>
            <CurlEndpointsList />
          </div>
        </div>
      ) : (
        /* Agent Skill View */
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white">Agent Telemetry Skill Specification</h3>
            <p className="text-xs text-purple-300">Markdown skill file for autonomous agents with telemetry conventions and schemas.</p>
          </div>
          <CodeSnippetBox
            code={curlSkillMarkdown}
            fileName="ax-analytics-telemetry.SKILL.md"
            badgeLabel="SKILL.md"
            badgeClass="bg-purple-950 text-fuchsia-300 border-purple-800"
          />
        </div>
      )}
    </div>
  );
}
