import React, { useState, useEffect } from 'react';
import { ShieldAlert, Send, MapPin, Activity } from 'lucide-react';
import EmergencyChat from '../components/EmergencyChat.jsx';

export default function PublicPortal() {
  const [incidentForm, setIncidentForm] = useState({ category: 'medical', type: 'Injury', title: '', description: '', severity: 'high', locationName: '', lat: '', lng: '' });
  const [submitted, setSubmitted] = useState(false);
  const [alerts, setAlerts] = useState([]);
  
  const submitIncident = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: incidentForm.category,
          type: incidentForm.type,
          title: incidentForm.title,
          description: incidentForm.description,
          severity: incidentForm.severity,
          location: {
            name: incidentForm.locationName,
            latitude: Number(incidentForm.lat),
            longitude: Number(incidentForm.lng)
          }
        })
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setIncidentForm({ category: 'medical', type: 'Injury', title: '', description: '', severity: 'high', locationName: '', lat: '', lng: '' });
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetch('/api/incidents')
      .then(r => r.json())
      .then(d => setAlerts(d.data.slice(0, 5)))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="border-b border-white/10 bg-surface-900/50 p-4 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-red-500 w-8 h-8" />
            <h1 className="text-xl font-bold tracking-wider font-display text-white">RESCUE<span className="text-red-500">AI</span> PUBLIC PORTAL</h1>
          </div>
          <a href="/command" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Command Center Login</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <section className="bg-surface-800/30 border border-white/5 rounded-2xl p-6 shadow-panel backdrop-blur-md tech-corners">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Send className="w-5 h-5 text-brand-400"/> Report Emergency</h2>
            {submitted && <div className="bg-green-500/20 text-green-300 p-3 rounded-lg mb-4 text-sm font-medium">Emergency reported successfully. Help is on the way.</div>}
            <form onSubmit={submitIncident} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-sm" value={incidentForm.category} onChange={e => setIncidentForm({...incidentForm, category: e.target.value})}>
                    <option value="medical">Medical</option>
                    <option value="fire">Fire</option>
                    <option value="flood">Flood</option>
                    <option value="collapse">Collapse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Severity</label>
                  <select className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-sm" value={incidentForm.severity} onChange={e => setIncidentForm({...incidentForm, severity: e.target.value})}>
                    <option value="critical">Critical (Life-Threatening)</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Incident Title</label>
                <input required type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-sm" value={incidentForm.title} onChange={e => setIncidentForm({...incidentForm, title: e.target.value})} placeholder="e.g., Trapped in building"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Location Details</label>
                <input required type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-sm mb-2" value={incidentForm.locationName} onChange={e => setIncidentForm({...incidentForm, locationName: e.target.value})} placeholder="Address or landmark"/>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" step="any" className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-sm" value={incidentForm.lat} onChange={e => setIncidentForm({...incidentForm, lat: e.target.value})} placeholder="Latitude (e.g. 18.52)"/>
                  <input required type="number" step="any" className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-sm" value={incidentForm.lng} onChange={e => setIncidentForm({...incidentForm, lng: e.target.value})} placeholder="Longitude (e.g. 73.85)"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <textarea required rows={3} className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-sm" value={incidentForm.description} onChange={e => setIncidentForm({...incidentForm, description: e.target.value})} placeholder="Provide details..."></textarea>
              </div>

              <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-glow-red transition-all active:scale-95 text-sm tracking-widest">
                SUBMIT EMERGENCY
              </button>
            </form>
          </section>
          
          <section className="bg-surface-800/30 border border-white/5 rounded-2xl p-6 shadow-panel backdrop-blur-md tech-corners">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-yellow-400"/> Recent Alerts</h2>
            <div className="space-y-3">
              {alerts.length > 0 ? alerts.map(a => (
                <div key={a.id} className="p-3 bg-slate-900/50 border border-white/10 rounded-lg">
                  <h3 className="text-sm font-bold text-slate-200">{a.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> {a.location?.name}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No active alerts.</p>}
            </div>
          </section>
        </div>

        <div className="h-[700px] flex flex-col space-y-4">
          <EmergencyChat />
        </div>
      </main>
    </div>
  );
}
