import React, { useMemo, useState } from 'react';
import { Filter, Search, Eye, MapPin, XCircle } from 'lucide-react';

export default function OrdersTable({ orders, onTrack, onViewLabel, onCancel }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchQ = q.trim() === '' || o.awb.toLowerCase().includes(q.toLowerCase()) || o.destination.toLowerCase().includes(q.toLowerCase());
      const matchS = status === 'All' || o.status === status;
      return matchQ && matchS;
    });
  }, [orders, q, status]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border">
      <div className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search AWB or destination" className="pl-9 pr-3 py-2 rounded-lg border text-sm w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="px-3 py-2 text-sm rounded-lg border">
              {['All','Booked','Picked Up','In Transit','Delivered'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="text-xs text-slate-500">{filtered.length} results</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-t border-b bg-slate-50">
              <th className="py-2.5 px-4">AWB</th>
              <th className="py-2.5 px-4">Service</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4">Cost</th>
              <th className="py-2.5 px-4">Route</th>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="py-3 px-4 font-medium text-slate-800">{o.awb}</td>
                <td className="py-3 px-4 text-slate-700">{o.service}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                    o.status === 'In Transit' ? 'bg-amber-50 text-amber-700' :
                    o.status === 'Picked Up' ? 'bg-indigo-50 text-indigo-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>{o.status}</span>
                </td>
                <td className="py-3 px-4 text-slate-800">₹ {o.cost.toFixed(2)}</td>
                <td className="py-3 px-4 text-slate-700 inline-flex items-center gap-1"><MapPin size={14} className="text-slate-400" /> {o.origin} → {o.destination}</td>
                <td className="py-3 px-4 text-slate-700">{o.date}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={()=>onViewLabel(o)} className="px-2 py-1.5 text-xs rounded-lg border hover:bg-slate-50 inline-flex items-center gap-1"><Eye size={14}/> Label</button>
                    <button onClick={()=>onTrack(o)} className="px-2 py-1.5 text-xs rounded-lg border hover:bg-slate-50">Track</button>
                    <button onClick={()=>onCancel(o)} className="px-2 py-1.5 text-xs rounded-lg border hover:bg-rose-50 text-rose-700 inline-flex items-center gap-1"><XCircle size={14}/> Cancel</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
