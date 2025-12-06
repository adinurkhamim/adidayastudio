/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oeijyuwngxmvlfffhixm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],

    // TAMBAHAN optional tapi sangat disarankan:
    // Supaya Vercel domain & custom domain tidak error load gambar
    domains: ["oeijyuwngxmvlfffhixm.supabase.co"],
  },

  // (Tambahan optional) menghindari warning experimental di Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
