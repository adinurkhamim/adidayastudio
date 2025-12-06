export default function ProjectSectionHeader({ title }: { title: string }) {
  return (
    <h1 className="text-center text-5xl font-bold mb-12 tracking-tight">
      <span className="text-adidaya-red">*</span> {title}
    </h1>
  );
}
