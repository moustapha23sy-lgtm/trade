export function buildTree(categories, parentId = null) {
  return categories
    .filter((c) => c.parent_id === parentId)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name))
    .map((c) => ({
      ...c,
      children: buildTree(categories, c.id),
    }));
}

export function getDepth(category, categories) {
  let depth = 0;
  let current = category;
  while (current?.parent_id) {
    depth += 1;
    current = categories.find((c) => c.id === current.parent_id);
  }
  return depth;
}

export function getCategoryPath(category, categories) {
  const parts = [category.name];
  let current = category;
  while (current?.parent_id) {
    const parent = categories.find((c) => c.id === current.parent_id);
    if (!parent) break;
    parts.unshift(parent.name);
    current = parent;
  }
  return parts.join(' › ');
}

export function getLeafCategories(categories) {
  const parentIds = new Set(
    categories.filter((c) => c.parent_id != null).map((c) => c.parent_id)
  );
  return categories.filter((c) => c.parent_id != null && !parentIds.has(c.id));
}

export function getParentOptions(categories) {
  const poles = categories.filter((c) => c.parent_id == null);
  const options = [];

  poles.forEach((pole) => {
    options.push({ id: pole.id, label: pole.name, depth: 0, type: 'pole' });
    categories
      .filter((c) => c.parent_id === pole.id)
      .forEach((group) => {
        const hasGrandchildren = categories.some((c) => c.parent_id === group.id);
        if (hasGrandchildren) {
          options.push({ id: group.id, label: group.name, depth: 1, type: 'group', poleName: pole.name });
        }
      });
  });

  return options;
}

export function getLevelLabel(category, categories) {
  const depth = getDepth(category, categories);
  if (depth === 1) {
    const hasChildren = categories.some((c) => c.parent_id === category.id);
    return hasChildren ? 'Catégorie' : 'Sous-catégorie';
  }
  if (depth === 2) return 'Sous-catégorie';
  return 'Catégorie';
}
