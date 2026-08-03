---
trigger: model_decision
description: AX Analytics Admin UI design system, ECharts Sankey & Sunburst standards, AG Grid tables, and Left Sidebar Navigation guidelines.
---

# AX Analytics Admin UI Design & Visualization Guidelines

Enforce the following design and component standards across the `ax-analytics-admin-ui` dashboard.

## 1. Aesthetic Theme & Colors
- **Color Palette:** Cyberpunk Neon Purple theme (`#07030d` base background, `#a855f7` neon purple, `#d946ef` fuchsia/magenta, `#06b6d4` cyan, `#130a24` card panel).
- **Glassmorphism Panels:** Multi-layered semi-transparent panels (`rgba(19, 10, 36, 0.75)` with `backdrop-filter: blur(20px)` and subtle purple border outlines).
- **Typography:** Google Fonts `Outfit` for headings, `Plus Jakarta Sans` for UI text, and `JetBrains Mono` for code/IDs.
- **Clean Terminology:** Never use raw library names in user-facing headers/badges (e.g. use "Telemetry Data Listing" instead of "AG Grid", and "Trajectory Flow Diagram" instead of "Apache ECharts").

## 2. Layout & Navigation
- **Left Sidebar Navigation:** Collapsible left sidebar (`w-56` when expanded, `w-16` icon-only rail when collapsed). Top bar and content canvas must dynamically adjust left padding (`pl-56` vs `pl-16`).
- **Global Top Bar:** Includes Date Range Picker (`24h`, `7d`, `30d`, `all`), live ingested event counter, and refresh button.

## 3. Visual Chart Standards
- **Sankey Flow Diagrams (`type: 'sankey'`):** Use Apache ECharts Sankey diagrams for tool call trajectories and user page flows (`previousToolName` -> `invokedToolName`).
- **Tool Sunburst Inspector (`type: 'sunburst'`):**
  - Inner Ring (Hub): Parameter Name.
  - Outer Ring (Hub): Parameter Value.
  - Render side-by-side charts for **Successful Invocations** vs **Failed Invocations**.
  - Apply the **8% Share Threshold Rule**: Parameter values with $\ge 8\%$ share of occurrences are rendered individually; values $< 8\%$ share are aggregated into a `"mixed"` outer node.
- **AG Grid Data Tables:** Use `ag-grid-react` with `ag-theme-alpine-dark` styling for telemetry span listings, supporting server-side capabilities, sorting, and filtering.
