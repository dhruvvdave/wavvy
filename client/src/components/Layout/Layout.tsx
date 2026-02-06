import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030712] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(59,130,246,0.42)_0%,rgba(14,116,144,0.24)_22%,rgba(8,47,73,0.14)_38%,rgba(2,6,23,0.96)_62%,rgba(2,6,23,1)_82%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light [background-image:radial-gradient(rgba(255,255,255,0.7)_0.5px,transparent_0.5px)] [background-size:3px_3px]" />
      <div className="relative z-10">
        <Header />
        <main className="pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
