"use client";

import Image from "next/image";

export default function ProfileSection() {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-start">

      <div className="rounded-3xl overflow-hidden bg-black border-black">
        <Image
          src="/adidaya-gel.png"
          alt="Studio"
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />
      </div>

     <p className="text-gray-300 leading-relaxed text-md">
        Adidaya Studio sees architecture as an ongoing conversation—between people,
        place, and the quiet rhythms that shape life within. We design by listening:
        <span className="italic">
          {" "}
          to the land that murmurs, to users who carry stories, to light that chooses
          how a room should feel.
        </span>
        <br />
        <br />
        Guided by{" "}
        <span className="text-adidaya-red font-semibold">“Framing the Flow to Feel”</span>, 
        we shape movement into moments—spaces that are honest, warm, and enduring.
        Each project becomes an attempt to weave aesthetics, function, and systems into
        experiences that unfold naturally.
      </p>

    </div>
  );
}
