import { Outlet } from 'react-router-dom';
import Header from './Header';
import ParticleBackground from '../Background/ParticleBackground';

export default function Layout() {
  return (
    <div className="min-h-screen bg-dark relative">
      <ParticleBackground />
      <div className="relative z-10">
        <Header />
        <main className="pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
