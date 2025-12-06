"use client";

import { useEffect, useState } from "react";
import {
  PROJECT_CATEGORIES,
  PROJECT_SUBCATEGORIES,
} from "@/data/projectCategories";

export type Filter = {
  category: string | null;
  subcategory: string | null;
};

type FilterBarProps = {
  onFilterChange: (filter: Filter) => void;
  initialFilter?: Filter;
};

export default function FilterBar({ onFilterChange, initialFilter }: FilterBarProps) {
  const [category, setCategory] = useState<string>("All");
  const [subcategory, setSubcategory] = useState<string>("All");

  useEffect(() => {
    onFilterChange({
      category: category === "All" ? null : category,
      subcategory: subcategory === "All" ? null : subcategory,
    });
  }, [category, subcategory, onFilterChange]);

  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.category) setCategory(initialFilter.category);
      if (initialFilter.subcategory) setSubcategory(initialFilter.subcategory);
    }
  }, [initialFilter]);

  const categoriesWithAll = ["All", ...PROJECT_CATEGORIES];
  const subcategoriesWithAll = ["All", ...PROJECT_SUBCATEGORIES];

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="border border-adidaya-red rounded-full p-2 flex gap-3 overflow-x-auto no-scrollbar max-w-full">
        {categoriesWithAll.map((cat) => {
          const isActive = category === cat;

          return (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setSubcategory("All");
              }}
              className={`px-6 py-2 rounded-full text-sm transition-all
                ${isActive
                  ? "bg-adidaya-red text-white font-semibold"
                  : "bg-gray-200 text-gray-800 hover:bg-adidaya-red hover:text-white"
                }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-6 text-sm mt-2">
        {subcategoriesWithAll.map((sub) => {
          const isActive = subcategory === sub;

          return (
            <button
              key={sub}
              onClick={() => setSubcategory(sub)}
              className={`
                transition-all
                ${isActive
                  ? "text-white font-semibold"
                  : "text-gray-400 hover:text-adidaya-red"
                }
              `}
            >
              {sub}
            </button>
          );
        })}
      </div>
    </div>
  );
}
