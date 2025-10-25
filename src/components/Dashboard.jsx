import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, Wallet } from 'lucide-react';

export default function Dashboard({ orders, walletBalance, counts }) {
  const [series, setSeries] = useState(() => Array.from({ length: 24 }, () => Math.random() * 100));

  useEffect(() => {
    const id = setInterval(() => {
      setSeries((s) => {
        const next = s.slice(1);
        next.push(Math.random() * 100);
        return next;
      });
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={<Package className="text-blue-600" />} label="Total Orders" value={counts.total} />
        <StatCard icon={<CheckCircle2 className="text-emerald-600" />} label="Delivered" value={counts.delivered} />
        <StatCard icon={<Truck className="text-amber-600" />} label="In Transit" value={counts.inTransit} />
        <StatCard icon={<Wallet className="text-indigo-600" />} label="Wallet" value={`₹ ${walletBalance.toFixed(2)}`} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Realtime Analytics (demo)</h3>
            <div className="text-xs text-slate-500">orders/min</div>
          </div>
          <div className="h-40 flex items-end gap-1">
            {series.map((v, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/30 to-blue-600/70 rounded-t" style={{ height: `${20 + v * 0.8}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Create new shipment</li>
            <li>• Download last invoice</li>
            <li>• Invite a team member</li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border rounded-2xl p-6">
        <div className="font-medium text-slate-800">Tip</div>
        <div className="text-sm text-slate-700">Use Wallet to prepay shipments and speed up checkout.</div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5">
      <div className="flex items-center gap-3">
        {icon}
        <div className="text-sm text-slate-600">{label}</div>
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
