export default function NoAccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-gray-400">You do not have permission to view this page.</p>
      </div>
    </div>
  );
}
