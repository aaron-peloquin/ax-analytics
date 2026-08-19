---
trigger: model_decision
description: Refer to this guide while writing react componetry
---

# Atomic Design Hierarchy
Our team has set an Atomic Design categorization of components. These categories give perscriptions for what types of concerns the components should handle for us. This practice helps ensure that we create highly reusable components, and cleanly separate state and networking from our display layer.

- **Providers**: Context controllers that manage network fetch queries and component state. They export a single `Provider` wrapper and a companion `useContext` hook.
- **Templates**: Stateless, high-level layouts that arrange organisms, molecules, and atoms on a page. Templates handle page layouts but delegate data management to Providers.
- **Organisms**: More Complex UI structures (e.g., listing route table or a chat ui) that compose molecules and atoms. Organisms may also read data from Context Providers
- **Molecules**: Combine multiple atoms or UI primitives (e.g., a search bar containing an input and search button). Fairly Reusable.
- **Atoms**: Wrap a single UI primitive to provide a clean, typed contract. Do not combine structural components at this level. Extremely reusable
