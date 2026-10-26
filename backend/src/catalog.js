import Category from './models/Category.js';

export const slugify = value => String(value)
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

export async function syncCategories(categoryInventory) {
  for (const [name, subcategories] of Object.entries(categoryInventory)) {
    const existing = await Category.findOne({ name });
    const merged = subcategories.map(subcategory => ({
      name: subcategory,
      slug: slugify(subcategory),
    }));
    await Category.updateOne(
      { name },
      { $setOnInsert: { name, slug: slugify(name) }, $set: { subcategories: merged, isActive: true } },
      { upsert: true },
    );
  }
  await Category.updateMany(
    { name: { $nin: Object.keys(categoryInventory) } },
    { $set: { isActive: false } },
  );
}
