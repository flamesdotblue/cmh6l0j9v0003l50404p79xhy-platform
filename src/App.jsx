import React, { useEffect, useMemo, useState } from 'react';
import { Toaster } from 'sonner';
import { PlusCircle, FileDown, X, CreditCard, Package, Truck, CheckCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import HeroSpline from './components/HeroSpline';
import Dashboard from './components/Dashboard';
import OrdersTable from './components/OrdersTable';

const initialOrders = [
  {
    id: '1',
    awb: 'FP00012345',
    service: 'Fast Parcel Standard',
    status: 'Delivered',
    cost: 149.0,
    origin: 'Mumbai, IN',
    destination: 'Bengaluru, IN',
    date: '2025-10-01',
  },
  {
    id: '2',
    awb: 'FP00012346',
    service: 'Fast Parcel Priority',
    status: 'In Transit',
    cost: 249.0,
    origin: 'Delhi, IN',
    destination: 'Pune, IN',
    date: '2025-10-05',
  },
  {
    id: '3',
    awb: 'FP00012347',
    service: 'Fast Parcel Economy',
    status: 'Booked',
    cost: 99.0,
    origin: 'Hyderabad, IN',
    destination: 'Chennai, IN',
    date: '2025-10-07',
  },
];

function App() {
  const [authed, setAuthed] = useState(() => {
    return localStorage.getItem('fp_auth') === '1';
  });
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [orders, setOrders] = useState(initialOrders);
  const [wallet, setWallet] = useState(1200);
  const [transactions, setTransactions] = useState([
    { id: 't1', type: 'Credit', amount: 1000, note: 'Wallet Top-up', date: '2025-09-30' },
    { id: 't2', type: 'Debit', amount: 149, note: 'Order FP00012345', date: '2025-10-01' },
    { id: 't3', type: 'Debit', amount: 249, note: 'Order FP00012346', date: '2025-10-05' },
  ]);

  // Booking Stepper State
  const [bookingOpen, setBookingOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    senderName: '',
    senderAddress: '',
    receiverName: '',
    receiverAddress: '',
    weight: '',
    size: '',
    contents: '',
    declaredValue: '',
    pickupSlot: '',
    service: 'Fast Parcel Standard',
  });

  // Tracking Modal
  const [trackingOrder, setTrackingOrder] = useState(null);

  useEffect(() => {
    if (authed) localStorage.setItem('fp_auth', '1');
    else localStorage.removeItem('fp_auth');
  }, [authed]);

  const counts = useMemo(() => {
    return {
      total: orders.length,
      delivered: orders.filter((o) => o.status === 'Delivered').length,
      inTransit: orders.filter((o) => o.status === 'In Transit' || o.status === 'Picked Up').length,
    };
  }, [orders]);

  function handleLogin(e) {
    e.preventDefault();
    setAuthed(true);
  }

  function handleLogout() {
    setAuthed(false);
    setCurrentTab('Dashboard');
  }

  function resetBooking() {
    setStep(1);
    setBookingData({
      senderName: '',
      senderAddress: '',
      receiverName: '',
      receiverAddress: '',
      weight: '',
      size: '',
      contents: '',
      declaredValue: '',
      pickupSlot: '',
      service: 'Fast Parcel Standard',
    });
  }

  function openBooking() {
    setBookingOpen(true);
    resetBooking();
  }

  function closeBooking() {
    setBookingOpen(false);
    resetBooking();
  }

  function generateAWB() {
    const n = Math.floor(100000 + Math.random() * 900000);
    return `FP${n}`;
  }

  function onShipNow() {
    // Determine cost by service
    const costMap = {
      'Fast Parcel Economy': 99,
      'Fast Parcel Standard': 149,
      'Fast Parcel Priority': 249,
    };
    const cost = costMap[bookingData.service] || 149;
    if (wallet < cost) {
      alert('Insufficient wallet balance. Top up to proceed.');
      return;
    }

    const awb = generateAWB();
    const newOrder = {
      id: crypto.randomUUID(),
      awb,
      service: bookingData.service,
      status: 'Booked',
      cost,
      origin: bookingData.senderAddress || 'Unknown',
      destination: bookingData.receiverAddress || 'Unknown',
      date: new Date().toISOString().slice(0, 10),
    };
    setOrders((prev) => [newOrder, ...prev]);
    setWallet((w) => w - cost);
    setTransactions((tx) => [
      { id: crypto.randomUUID(), type: 'Debit', amount: cost, note: `Order ${awb}`, date: new Date().toISOString().slice(0, 10) },
      ...tx,
    ]);
    setBookingOpen(false);
    resetBooking();
    setCurrentTab('Shipments');
    alert('Shipment Created! Label generated and saved.');
  }

  function handleViewLabel(order) {
    const content = `Fast Parcel\nAWB: ${order.awb}\nService: ${order.service}\nFrom: ${order.origin}\nTo: ${order.destination}\n\n[Barcode Placeholder]`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.awb}-label.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCancelOrder(order) {
    if (order.status !== 'Booked') {
      alert('Only Booked orders can be cancelled.');
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    setWallet((w) => w + order.cost);
    setTransactions((tx) => [
      { id: crypto.randomUUID(), type: 'Credit', amount: order.cost, note: `Refund ${order.awb}`, date: new Date().toISOString().slice(0, 10) },
      ...tx,
    ]);
  }

  function downloadCSV() {
    const header = ['AWB', 'Service', 'Status', 'Cost', 'Origin', 'Destination', 'Date'];
    const rows = orders.map((o) => [o.awb, o.service, o.status, o.cost, o.origin, o.destination, o.date]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Shipping Summary.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authed) {
    return (
      <div className="relative min-h-screen bg-white">
        <div className="absolute inset-0">
          <HeroSpline />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/90 to-white pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-slate-800">Fast Parcel</div>
          <div className="text-sm text-slate-600">Cloud-native Logistics</div>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 pb-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="hidden md:block" />
            <form onSubmit={handleLogin} className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 border border-slate-100">
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Sign in</h2>
              <p className="text-slate-500 mb-6">Access your Fast Parcel dashboard</p>
              <label className="block text-sm text-slate-600 mb-1">Email</label>
              <input type="email" required placeholder="you@company.com" className="w-full mb-4 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <label className="block text-sm text-slate-600 mb-1">Password</label>
              <input type="password" required placeholder="••••••••" className="w-full mb-6 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition">
                <span>Login</span>
              </button>
              <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
                <button type="button" className="underline">Create account</button>
                <button type="button" className="underline">Forgot password</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} onLogout={handleLogout} onNewBooking={openBooking} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentTab === 'Dashboard' && (
          <Dashboard orders={orders} walletBalance={wallet} counts={counts} />
        )}

        {currentTab === 'Shipments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Shipments</h2>
              <button onClick={openBooking} className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
                <PlusCircle size={18} /> New Booking
              </button>
            </div>
            <OrdersTable
              orders={orders}
              onTrack={(o) => setTrackingOrder(o)}
              onViewLabel={handleViewLabel}
              onCancel={handleCancelOrder}
            />
          </div>
        )}

        {currentTab === 'Wallet' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="text-blue-600" />
                  <h3 className="font-semibold text-slate-800">Wallet Balance</h3>
                </div>
                <div className="text-3xl font-bold text-slate-900">₹ {wallet.toFixed(2)}</div>
                <button className="mt-4 w-full border border-blue-200 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50">Top up (demo)</button>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">Transactions</h3>
                </div>
                <div className="divide-y">
                  {transactions.map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-800">{t.note}</div>
                        <div className="text-xs text-slate-500">{t.date}</div>
                      </div>
                      <div className={t.type === 'Credit' ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                        {t.type === 'Credit' ? '+' : '-'}₹ {t.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'KYC' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Business Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Business Name" className="px-3 py-2 rounded-lg border" />
                <input placeholder="Registration Number" className="px-3 py-2 rounded-lg border" />
                <input placeholder="Address Line 1" className="px-3 py-2 rounded-lg border col-span-2" />
                <input placeholder="City" className="px-3 py-2 rounded-lg border" />
                <input placeholder="PIN Code" className="px-3 py-2 rounded-lg border" />
              </div>
              <div className="mt-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" className="rounded" /> I accept terms and conditions
                </label>
              </div>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Submit for Verification</button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-semibold text-slate-800 mb-4">KYC Documents</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-700">GST</label>
                  <input type="file" className="block w-full mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-700">PAN</label>
                  <input type="file" className="block w-full mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-700">IEC</label>
                  <input type="file" className="block w-full mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-700">Aadhaar</label>
                  <input type="file" className="block w-full mt-1" />
                </div>
              </div>
              <div className="mt-6 rounded-lg bg-blue-50 text-blue-800 p-3 text-sm">Status: Pending verification</div>
            </div>
          </div>
        )}

        {currentTab === 'Reports' && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">Reports & Downloads</h3>
                <p className="text-sm text-slate-600">Export your order history and billing summaries.</p>
              </div>
              <button onClick={downloadCSV} className="inline-flex items-center gap-2 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50">
                <FileDown size={18} /> Shipping Summary.csv
              </button>
            </div>
            <div className="mt-6">
              <h4 className="font-medium text-slate-800 mb-2">Invoices</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li><a className="text-blue-600 underline" href="#">INV-1001.pdf</a></li>
                <li><a className="text-blue-600 underline" href="#">INV-1002.pdf</a></li>
              </ul>
            </div>
          </div>
        )}

        {currentTab === 'Admin' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-semibold text-slate-800 mb-2">Metrics</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div>Total shipments: {orders.length}</div>
                <div>Delivered: {counts.delivered}</div>
                <div>Wallet total (demo): ₹ {(wallet + transactions.filter(t=>t.type==='Debit').reduce((a,b)=>a+b.amount,0)).toFixed(2)}</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border p-6 md:col-span-2">
              <h3 className="font-semibold text-slate-800 mb-4">Admin Lists</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-slate-700 mb-2">Users</div>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>alice@acme.com</li>
                    <li>bob@contoso.com</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-slate-700 mb-2">Courier Rate Cards</div>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>Economy: ₹ 99</li>
                    <li>Standard: ₹ 149</li>
                    <li>Priority: ₹ 249</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6">
                <div className="font-medium text-slate-700 mb-2">KYC Verifications</div>
                <div className="flex gap-2">
                  <button className="border px-3 py-1.5 rounded-lg">Approve</button>
                  <button className="border px-3 py-1.5 rounded-lg">Reject</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {bookingOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-end md:items-center justify-center p-0 md:p-6 z-50">
          <div className="bg-white w-full md:max-w-3xl rounded-t-2xl md:rounded-2xl shadow-xl border">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-slate-800">New Booking</h3>
              <button onClick={closeBooking} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
                <span className={step >= 1 ? 'font-semibold text-blue-700' : ''}>1. Parties</span>
                <span>›</span>
                <span className={step >= 2 ? 'font-semibold text-blue-700' : ''}>2. Package</span>
                <span>›</span>
                <span className={step >= 3 ? 'font-semibold text-blue-700' : ''}>3. Pickup</span>
                <span>›</span>
                <span className={step >= 4 ? 'font-semibold text-blue-700' : ''}>4. Options</span>
                <span>›</span>
                <span className={step >= 5 ? 'font-semibold text-blue-700' : ''}>5. Pay</span>
              </div>

              {step === 1 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium text-slate-800 mb-2">Sender</div>
                    <input value={bookingData.senderName} onChange={(e)=>setBookingData({...bookingData, senderName:e.target.value})} placeholder="Name" className="w-full mb-2 px-3 py-2 rounded-lg border" />
                    <textarea value={bookingData.senderAddress} onChange={(e)=>setBookingData({...bookingData, senderAddress:e.target.value})} placeholder="Address" className="w-full px-3 py-2 rounded-lg border min-h-[88px]" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 mb-2">Receiver</div>
                    <input value={bookingData.receiverName} onChange={(e)=>setBookingData({...bookingData, receiverName:e.target.value})} placeholder="Name" className="w-full mb-2 px-3 py-2 rounded-lg border" />
                    <textarea value={bookingData.receiverAddress} onChange={(e)=>setBookingData({...bookingData, receiverAddress:e.target.value})} placeholder="Address" className="w-full px-3 py-2 rounded-lg border min-h-[88px]" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid md:grid-cols-3 gap-4">
                  <input value={bookingData.weight} onChange={(e)=>setBookingData({...bookingData, weight:e.target.value})} placeholder="Weight (kg)" className="px-3 py-2 rounded-lg border" />
                  <input value={bookingData.size} onChange={(e)=>setBookingData({...bookingData, size:e.target.value})} placeholder="Size (cm)" className="px-3 py-2 rounded-lg border" />
                  <input value={bookingData.declaredValue} onChange={(e)=>setBookingData({...bookingData, declaredValue:e.target.value})} placeholder="Declared Value (₹)" className="px-3 py-2 rounded-lg border" />
                  <textarea value={bookingData.contents} onChange={(e)=>setBookingData({...bookingData, contents:e.target.value})} placeholder="Contents" className="md:col-span-3 px-3 py-2 rounded-lg border min-h-[88px]" />
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="font-medium text-slate-800 mb-2">Pickup Slot</div>
                  <div className="grid md:grid-cols-3 gap-3">
                    {['Today 4-6 PM','Tomorrow 10-12 AM','Tomorrow 2-4 PM'].map(slot => (
                      <button key={slot} onClick={()=>setBookingData({...bookingData, pickupSlot: slot})} className={`border px-3 py-2 rounded-lg ${bookingData.pickupSlot===slot? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}>{slot}</button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="grid gap-3">
                  {[
                    {name:'Fast Parcel Economy', eta:'4-6 days', rate:99, desc:'Best value for non-urgent shipments'},
                    {name:'Fast Parcel Standard', eta:'2-4 days', rate:149, desc:'Balanced speed and cost'},
                    {name:'Fast Parcel Priority', eta:'1-2 days', rate:249, desc:'Fastest delivery for urgent packages'},
                  ].map(opt => (
                    <label key={opt.name} className={`flex items-center justify-between gap-3 border rounded-xl p-3 ${bookingData.service===opt.name? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}>
                      <div>
                        <div className="font-medium text-slate-800">{opt.name}</div>
                        <div className="text-sm text-slate-600">ETA {opt.eta} • {opt.desc}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-semibold text-slate-900">₹ {opt.rate}</div>
                        <input type="radio" name="service" checked={bookingData.service===opt.name} onChange={()=>setBookingData({...bookingData, service: opt.name})} />
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {step === 5 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="font-medium text-slate-800 mb-2">Summary</div>
                    <div className="text-sm text-slate-700 space-y-1">
                      <div>From: {bookingData.senderName || '—'}</div>
                      <div>To: {bookingData.receiverName || '—'}</div>
                      <div>Service: {bookingData.service}</div>
                      <div>Pickup: {bookingData.pickupSlot || '—'}</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="font-medium text-slate-800 mb-2">Payment</div>
                    <div className="text-sm text-slate-700">Wallet balance: ₹ {wallet.toFixed(2)}</div>
                    <div className="text-sm text-slate-700 mt-1">Charge: ₹ {bookingData.service==='Fast Parcel Economy'?99:bookingData.service==='Fast Parcel Priority'?249:149}</div>
                    <div className="text-sm text-emerald-700 mt-1">No additional taxes (demo)</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-xs text-slate-600">Step {step} of 5</div>
              <div className="flex items-center gap-2">
                {step > 1 && (
                  <button onClick={()=>setStep(step-1)} className="px-4 py-2 rounded-lg border hover:bg-slate-50">Back</button>
                )}
                {step < 5 && (
                  <button onClick={()=>setStep(step+1)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Continue</button>
                )}
                {step === 5 && (
                  <button onClick={onShipNow} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2">
                    <Package size={18} /> Ship Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {trackingOrder && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-slate-800">Tracking • {trackingOrder.awb}</h3>
              <button onClick={()=>setTrackingOrder(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-slate-700"><CheckCircle className="text-emerald-600" size={18} /> Order booked</div>
              <div className="flex items-center gap-2 text-slate-700"><Truck className="text-blue-600" size={18} /> Picked up</div>
              <div className="flex items-center gap-2 text-slate-700"><Truck className="text-blue-600" size={18} /> In transit</div>
              <div className="flex items-center gap-2 text-slate-700"><CheckCircle className="text-emerald-600" size={18} /> Delivered</div>
            </div>
            <div className="p-4 border-t text-right">
              <button onClick={()=>setTrackingOrder(null)} className="px-4 py-2 rounded-lg border hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}

export default App;
