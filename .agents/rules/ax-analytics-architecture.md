---
trigger: model_decision
description: Monorepo architecture, dual-storage engines (PostgreSQL + ClickHouse), sticky A/B experimentation, and Node ESM execution guidelines.
---

# AX Analytics Architecture & Backend Guidelines

Follow these core technical patterns when maintaining or extending `ax-analytics`.

## 1. Monorepo Structure (Nx + pnpm)
- **`packages/shared` (`@ax-analytics/shared`):** Readonly TypeScript interfaces, event DTOs, and pure validators.
- **`apps/server` (`ax-analytics-server`):** Node.js Express server exposing `/v1/telemetry/event`, `/v1/experiments/variant`, `/v1/feedback`, and `/v1/analytics/summary`.
- **`apps/admin-ui` (`ax-analytics-admin-ui`):** React + Vite dashboard.

## 2. Dual-Engine Storage Strategy
- **PostgreSQL + pgvector:** Metadata, sticky A/B variant assignment rules (`ab_experiments`, `ab_assignments`), explicit user feedback votes (+1/-1), and reasoning vector embeddings (`vector(1536)`).
- **ClickHouse:** High-throughput time-series telemetry events (`telemetry_events` MergeTree table partitioned by `toYYYYMM(timestamp)`).

## 3. Node v22 ESM & TypeScript Execution
- All `package.json` manifests specify `"type": "module"`.
- Relative imports within TypeScript source files MUST include `.js` file extensions for ESM resolution (`import { foo } from './foo.js'`).
- Use `tsx` for server development execution (`tsx src/main.ts`) to avoid `ERR_UNKNOWN_FILE_EXTENSION` errors under Node v22.

## 4. Sticky A/B Experiment Hashing Algorithm
- Variant assignment is computed deterministically via `hash(entity_id + experiment_id) % 100`.
- Compare score against `split_percentage`: if `< split_percentage` assign Variant `"B"`, else `"A"`.
- Return both camelCase (`assignedVariant`) and snake_case (`assigned_variant`) properties in JSON responses.

## 5. Telemetry Entity Types & User Pageviews
- **Human Site Visitors (`entityType: 'human'` / `user.type: 'human'`):** Represents real human users navigating the web application frontend (`documentLoad` pageview events, route changes, timing, referrer, device desktop vs mobile). Human telemetry is generated exclusively by website visitors, NOT web-crawling AI agents.
- **GenAI Agents (`entityType: 'agent'` / `user.type: 'agent'`):** Represents autonomous AI agents executing backend tools/prompts tracked via OpenTelemetry traces (`tool_call`, `llm_inference`).

