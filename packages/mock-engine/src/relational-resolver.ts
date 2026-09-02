import { MockdownSchema, SchemaTable } from '@mockdown/schema';

export function resolveDependencies(schema: MockdownSchema): SchemaTable[] {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize graph
  schema.tables.forEach(table => {
    graph.set(table.name, []);
    inDegree.set(table.name, 0);
  });

  // Build graph
  schema.tables.forEach(table => {
    table.columns.forEach(col => {
      if (col.isForeign && col.referenceTable && graph.has(col.referenceTable)) {
        // referenceTable must be generated BEFORE table
        graph.get(col.referenceTable)!.push(table.name);
        inDegree.set(table.name, inDegree.get(table.name)! + 1);
      }
    });
  });

  // Topological Sort (Kahn's Algorithm)
  const queue: string[] = [];
  inDegree.forEach((degree, name) => {
    if (degree === 0) queue.push(name);
  });

  const sortedOrder: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sortedOrder.push(current);

    const neighbors = graph.get(current) || [];
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (sortedOrder.length !== schema.tables.length) {
    throw new Error('Circular dependency detected in schema tables.');
  }

  return sortedOrder.map(name => schema.tables.find(t => t.name === name)!);
}
