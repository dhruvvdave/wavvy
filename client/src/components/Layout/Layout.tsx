import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  );
}
