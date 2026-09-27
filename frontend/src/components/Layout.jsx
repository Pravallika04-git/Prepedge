import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
