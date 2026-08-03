export interface SankeyLink {
  readonly source: string;
  readonly target: string;
  readonly value: number;
}

/**
 * Sanitizes Sankey links to ensure a valid Directed Acyclic Graph (DAG),
 * filtering out self-loops and back-edges that create cycles.
 */
export function sanitizeSankeyLinks(rawLinks: readonly SankeyLink[]): readonly SankeyLink[] {
  const validLinks: SankeyLink[] = [];
  const adj = new Map<string, Set<string>>();

  const createsCycle = (u: string, v: string): boolean => {
    if (u === v) return true;
    
    const visited = new Set<string>();
    const stack = [v];

    while (stack.length > 0) {
      const curr = stack.pop()!;
      if (curr === u) return true;
      
      if (!visited.has(curr)) {
        visited.add(curr);
        const neighbors = adj.get(curr);
        if (neighbors) {
          for (const nextNode of neighbors) {
            stack.push(nextNode);
          }
        }
      }
    }

    return false;
  };

  for (const link of rawLinks) {
    if (!link.source || !link.target || link.source === link.target) {
      continue;
    }

    if (!createsCycle(link.source, link.target)) {
      validLinks.push(link);
      if (!adj.has(link.source)) {
        adj.set(link.source, new Set());
      }
      adj.get(link.source)!.add(link.target);
    }
  }

  return validLinks;
}
