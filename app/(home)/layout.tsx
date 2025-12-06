export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-0 bg-transparent">
      {children}
    </div>
  );
}
