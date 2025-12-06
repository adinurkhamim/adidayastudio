export default function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-3xl md:text-4xl font-semibold mb-10 flex items-center gap-2">
      <span className="text-red-500">*</span>
      {title}
    </h2>
  );
}
