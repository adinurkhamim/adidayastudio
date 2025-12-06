"use client";

export default function PillarsSection() {
  const pillars = [
    {
      title: "Context-Led",
      desc: "Every design begins by honoring the land and the stories already living there.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 stroke-adidaya-red"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path d="M3 5.5l9-3 9 3M3 5.5v6.92c0 1.12.59 2.16 1.55 2.74L12 19.5l7.45-4.34A3.18 3.18 0 0021 12.42V5.5" />
          <path d="M12 19.5V9" />
        </svg>
      ),
    },
    {
      title: "Experience First",
      desc: "Spaces are shaped to be felt—through light, rhythm, sound, and human presence.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 stroke-adidaya-red"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path d="M12 3v2" />
          <path d="M5.64 5.64l1.41 1.41" />
          <path d="M3 12h2" />
          <path d="M5.64 18.36l1.41-1.41" />
          <path d="M12 19v2" />
          <path d="M18.36 18.36l-1.41-1.41" />
          <path d="M19 12h2" />
          <path d="M18.36 5.64l-1.41 1.41" />
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      ),
    },
    {
      title: "Integrated Systems",
      desc: "Architecture, structure, and technology move as one cohesive system.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 stroke-adidaya-red"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="18" r="3" />
          <path d="M9 6h6" />
          <path d="M6 9v6" />
          <path d="M9 18h6" />
          <path d="M18 9v6" />
        </svg>
      ),
    },
    {
      title: "Adaptive Future",
      desc: "Designs that evolve gracefully as needs shift and time unfolds.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 stroke-adidaya-red"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path d="M2 12a10 10 0 0118-6" />
          <path d="M22 12A10 10 0 014 18" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      title: "Enduring Values",
      desc: "Guided by durability, efficiency, and a responsibility toward the environment.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 stroke-adidaya-red"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path d="M12 22C7.58 16.62 5 13 5 9a7 7 0 0114 0c0 4-2.58 7.62-7 13z" />
          <path d="M12 12a3 3 0 000-6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col place-items-center mt-10">
      <p className="text-gray-300 max-w-3xl text-center leading-relaxed mb-16">
        At Adidaya, our work is anchored in principles that frame how spaces
        take shape, how systems connect, and how architecture becomes an
        experience to feel.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 w-full max-w-7xl px-6">
        {pillars.map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-3xl bg-[#101010] backdrop-blur-sm mb-5 flex items-center justify-center overflow-hidden">
              {item.icon}
            </div>

            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
