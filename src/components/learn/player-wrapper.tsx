/**
 * Forces dark mode on the learn page.
 * Video player and PDF viewer security features depend on dark backgrounds.
 * Never add theme-switching logic here.
 */
export function PlayerWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark bg-slate-950 min-h-screen">
      {children}
    </div>
  );
}
