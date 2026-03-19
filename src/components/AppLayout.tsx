import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Leaf, ArrowLeftRight, Heart, MapPin, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/catalogo', icon: Leaf, label: 'Catálogo' },
  { to: '/estoque', icon: ArrowLeftRight, label: 'Estoque' },
  { to: '/doacoes', icon: Heart, label: 'Doações' },
  { to: '/plantio', icon: MapPin, label: 'Plantio' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Leaf className="h-6 w-6" />
          <span className="hidden sm:inline">Controle de Mudas</span>
          <span className="sm:hidden">Mudas</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="md:hidden p-1">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <nav className="hidden md:flex gap-1">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.to
                  ? 'bg-primary-foreground/20'
                  : 'hover:bg-primary-foreground/10'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden bg-card border-b p-2 flex flex-col gap-1 z-40">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.to
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
