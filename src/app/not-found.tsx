export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#0B0E11]">
      <div className="text-center space-y-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Tradeon</p>
        <h1 className="text-5xl font-bold text-gold">404</h1>
        <p className="text-muted-foreground">This page does not exist.</p>
        <a
          href="/dashboard"
          className="inline-block mt-4 px-4 py-2 rounded-md bg-gold text-black text-sm font-medium hover:bg-gold-bright transition-colors"
        >
          Back to dashboard
        </a>
      </div>
    </div>
  );
}
