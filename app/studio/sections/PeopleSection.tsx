"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  order_index: number | null;
  is_published: boolean | null;
  position: string | null;
  linkedin: string | null;
  instagram: string | null;
  image_url: string | null;
  level: number | null;
};

export default function PeopleSection() {
  const [people, setPeople] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("❌ Error fetching people:", error);
        setLoading(false);
        return;
      }

      // hide admin
      const filtered = data.filter((p) => p.role !== "admin");

      setPeople(filtered);
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  if (loading) return <p className="text-gray-400">Loading team...</p>;

  return (
    <div className="grid md:grid-cols-3 gap-10">
      {people.map((person) => (
        <div key={person.id} className="group">

          {/* IMAGE */}
          <div className="relative overflow-hidden rounded-3xl h-64 bg-white/5">
            <Image
              src={person.image_url || "/placeholder/avatar.png"}
              alt={person.name || "Team Member"}
              width={400}
              height={400}
              className="
                object-cover w-full h-full
                transition-all duration-300
                group-hover:scale-105 group-hover:brightness-75
              "
            />

            {/* HOVER OVERLAY */}
            <div
              className="
                absolute inset-0 rounded-3xl bg-adidaya-red/50
                opacity-0 group-hover:opacity-100
                transition-all duration-300
                flex flex-col justify-center items-center gap-4
              "
            >
              <p className="text-white text-lg font-semibold">
                {person.name}
              </p>

              <div className="flex gap-3">
                {person.linkedin && (
                  <a
                    href={
                      person.linkedin.startsWith("http")
                        ? person.linkedin
                        : `https://linkedin.com/in/${person.linkedin}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-white/20 rounded-full text-sm text-white hover:bg-white/40"
                  >
                    LinkedIn
                  </a>
                )}
                {person.instagram && (
                    <a
                      href={
                        person.instagram.startsWith("http")
                          ? person.instagram
                          : `https://instagram.com/${person.instagram}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-white/20 rounded-full text-sm text-white hover:bg-white/40"
                    >
                      IG
                    </a>
                  )}

                {person.email && (
                  <a
                    href={`mailto:${person.email}`}
                    className="px-3 py-1 bg-white/20 rounded-full text-sm text-white hover:bg-white/40"
                  >
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* NAME + POSITION */}
          <div className="mt-4">
            <p className="font-semibold text-xl text-adidaya-red">
              {person.name}
            </p>
            <p className="text-gray-400 text-sm">
              {person.position}
            </p>
          </div>

        </div>
      ))}
    </div>
  );
}
