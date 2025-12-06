"use client";

import Link from "next/link";

type Project = {
  id?: string;
  slug?: string;
  project_name?: string | null;
  hero_image?: string | null;
  categories?: string[] | null;
  subcategories?: string[] | null;
  city?: string | null;
  country?: string | null;
};

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const title = project.project_name || "Untitled";
  const hero = project.hero_image || "";

  const categories = project.categories || [];
  const subcategories = project.subcategories || [];

  const cat = categories[0] || "";
  const sub = subcategories[0] || "";

  const city = project.city || "";
  const country = project.country || "";

  let location = "";
  if (country.toLowerCase() === "indonesia") {
    location = city;
  } else if (city && country) {
    location = `${city}, ${country}`;
  } else {
    location = city || country;
  }

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="block break-inside-avoid"
    >
      <div className="overflow-hidden rounded-[32px] bg-neutral-900 border border-neutral-800">

        {/* IMAGE */}
        {hero ? (
          <img
            src={hero}
            alt={title}
            className="w-full h-auto object-cover rounded-[32px]"
          />
        ) : (
          <div className="h-60 bg-neutral-800 rounded-[32px]" />
        )}

        {/* TEXT */}
        <div className="px-4 py-6">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>

          <p className="text-gray-400 text-sm">
            {cat}
            {sub && ` | ${sub}`}
          </p>

          {location && (
            <p className="text-gray-400 text-sm">{location}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
