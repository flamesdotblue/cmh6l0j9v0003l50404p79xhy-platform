import React from 'react';
import { PackageSearch, Wallet, FileBarChart2, Settings, LogOut, ShieldCheck, LayoutDashboard } from 'lucide-react';

const tabs = [
  { key: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'Shipments', label: 'Orders', icon: PackageSearch },
  { key: 'Wallet', label: 'Wallet', icon: Wallet },
  { key: 'KYC', label: 'KYC', icon: ShieldCheck },
  { key: 'Reports', label: 'Reports', icon: FileBarChart2 },
  { key: 'Admin', label: 'Admin', icon: Settings },
];

export default function Navbar({ currentTab, setCurrentTab, onLogout, onNewBooking }) {
  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="text-xl font-bold tracking-tight text-slate-900">Fast Parcel</div>
          <nav className="hidden md:flex items-center gap-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = currentTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setCurrentTab(t.key)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-slate-700 hover:bg-slate-50 border-transparent'}`}
                >
                  <Icon size={16} /> {t.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onNewBooking} className="hidden md:inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
            New Booking
          </button>
          <button onClick={onLogout} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-slate-50">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
      {/* Mobile Nav */}
      <div className="md:hidden border-t">
        <div className="flex overflow-x-auto no-scrollbar gap-2 p-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = currentTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setCurrentTab(t.key)}
                className={`flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-slate-700 hover:bg-slate-50 border-transparent'}`}
              >
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
          <button onClick={onNewBooking} className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg">
            New
          </button>
        </div>
      </div>
    </header>
  );
}
