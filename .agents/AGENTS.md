# AGENTS.md — AX Analytics Engineering Standards

Welcome to the **AX Analytics** (`ax-analytics`) codebase. All agent actions, pull requests, and refactoring efforts MUST strictly adhere to the project rules located in [.agents/rules/](file:///c:/Users/aaron/Documents/code/my-repos/ax-analytics/.agents/rules):

1. **[programming-style-functional.md](file:///c:/Users/aaron/Documents/code/my-repos/ax-analytics/.agents/rules/programming-style-functional.md):** Functional programming standards, immutability by default (`readonly`), pure functions, 1 function per file rule, and no classes for logic.
2. **[ax-analytics-architecture.md](file:///c:/Users/aaron/Documents/code/my-repos/ax-analytics/.agents/rules/ax-analytics-architecture.md):** Monorepo structure, dual-engine PostgreSQL (pgvector) + ClickHouse strategy, sticky A/B hashing, and Node v22 ESM execution rules.
3. **[ax-analytics-ui-standards.md](file:///c:/Users/aaron/Documents/code/my-repos/ax-analytics/.agents/rules/ax-analytics-ui-standards.md):** Cyberpunk Neon Purple design system, collapsible sidebar navigation, Apache ECharts Sankey & Sunburst standards (with 8% threshold grouping), AG Grid datatables, and clean domain terminology.
