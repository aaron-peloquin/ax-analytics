import React from 'react';
import { CodeSnippetBox } from '../atoms/CodeSnippetBox.js';
import {
  curlLlmInferenceCode,
  curlSpanCode,
  curlCustomEventCode,
  curlPageViewCode,
  curlABCode,
  curlFeedbackCode
} from '../snippets/curlSnippets.js';

export function CurlEndpointsList(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-fuchsia-300 font-mono">1. Agent Tool Call Telemetry (POST /v1/telemetry/event)</h4>
        <p className="text-xs text-purple-300">Emitted when an AI agent reasons and executes an autonomous tool call.</p>
        <CodeSnippetBox code={curlSpanCode} badgeLabel="POST /v1/telemetry/event" badgeClass="bg-purple-950 text-fuchsia-300 border-purple-800" />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-fuchsia-300 font-mono">2. Non-Tool LLM Inference (POST /v1/telemetry/event)</h4>
        <p className="text-xs text-purple-300">Emitted for general LLM completions, turn summarizations, or pure reasoning steps.</p>
        <CodeSnippetBox code={curlLlmInferenceCode} badgeLabel="POST /v1/telemetry/event" badgeClass="bg-purple-950 text-fuchsia-300 border-purple-800" />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-cyan-300 font-mono">3. Human Web Interaction (POST /v1/telemetry/event)</h4>
        <p className="text-xs text-purple-300">Emitted for user UI actions such as button clicks and form submissions.</p>
        <CodeSnippetBox code={curlCustomEventCode} badgeLabel="POST /v1/telemetry/event" badgeClass="bg-cyan-950 text-cyan-300 border-cyan-800" />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-cyan-300 font-mono">4. Human Pageview via OpenTelemetry (POST /v1/traces)</h4>
        <p className="text-xs text-purple-300">Standard OTLP resourceSpans payload for frontend web routing and timing.</p>
        <CodeSnippetBox code={curlPageViewCode} badgeLabel="POST /v1/traces" badgeClass="bg-cyan-950 text-cyan-300 border-cyan-800" />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-purple-300 font-mono">5. Sticky A/B Experiment Variant (POST /v1/experiments/variant)</h4>
        <p className="text-xs text-purple-300">Determines deterministic Variant A vs B assignment for a given entity.</p>
        <CodeSnippetBox code={curlABCode} badgeLabel="POST /v1/experiments/variant" badgeClass="bg-purple-950 text-purple-300 border-purple-800" />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-emerald-300 font-mono">6. Session User Feedback (POST /v1/feedback)</h4>
        <p className="text-xs text-purple-300">Records explicit user votes (+1/-1) and optional comments linked to a session.</p>
        <CodeSnippetBox code={curlFeedbackCode} badgeLabel="POST /v1/feedback" badgeClass="bg-emerald-950 text-emerald-300 border-emerald-800" />
      </div>
    </div>
  );
}
