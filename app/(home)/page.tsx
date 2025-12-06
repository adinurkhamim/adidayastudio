import { getHomeHero } from "@/lib/getHomeHero";

// supaya selalu fetch terbaru dari Supabase (no cache)
export const revalidate = 0;

export default async function HomePage() {
  let heroImage = "/placeholder-home-hero.png";

  try {
    const hero = await getHomeHero();
    if (hero?.image_url) {
      heroImage = hero.image_url;
    }
  } catch (err) {
    console.error("Failed to load home hero:", err);
  }

  return (
    <div className="relative w-full min-h-screen text-white -mt-20">
      {/* BACKGROUND FULL PAGE */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImage}
          alt="Adidaya Hero"
          className="w-full h-full object-cover"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* MAIN HERO CONTENT */}
      <div className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-28 min-h-screen">
        <p className="text-sm tracking-widest text-red-400 mb-4">
          FROM ADIDAYA
        </p>

        <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6">
          Framing the Flow to Feel
        </h1>

        <p className="max-w-xl text-gray-200 text-md md:text-md leading-relaxed mb-10">
          We craft spaces that follow the quiet flow of life—framed with intention
          and shaped to evoke feeling.
          <br />
          To us, architecture is a journey: of light
          in motion, of human presence, and of spaces that breathe with time.
          <br />
          <br />
          Step inside and discover how each project grows from context, intuition,
          and sensitivity.
        </p>

        {/* DISCOVER BUTTON */}
        <a
          href="/projects"
          className="
            px-8 py-3 rounded-full border border-white/30 
            bg-white/10 backdrop-blur-md
            transition-all font-medium tracking-wide
            hover:bg-adidaya-red hover:border-adidaya-red hover:text-white
          "
        >
          Discover More →
        </a>
      </div>
    </div>
  );
}
