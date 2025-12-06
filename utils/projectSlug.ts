import { PROJECT_CATEGORIES, PROJECT_SUBCATEGORIES } from "@/data/projectCategories";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function unslugifyCategory(slug: string) {
  return PROJECT_CATEGORIES.find((c) => slugify(c) === slug) || null;
}

export function unslugifySubcategory(slug: string) {
  return PROJECT_SUBCATEGORIES.find((s) => slugify(s) === slug) || null;
}
