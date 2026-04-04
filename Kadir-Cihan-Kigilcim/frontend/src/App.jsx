import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Plus, Trash2, Edit } from 'lucide-react';

function App() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newRule, setNewRule] = useState({ ruleName: '', ruleType: 'COMPETITOR_BASED', value: '', unit: 'TRY' });

  // Mock fetch
  const fetchRules = async () => {
    setLoading(true);
    // In a real app: const { data } = await supabase.from('pricing_rules').select('*');
    // We mock data for now
    setTimeout(() => {
      setRules([
        { id: '1', ruleName: 'Rakip altı kal', ruleType: 'COMPETITOR_BASED', value: 1.0, unit: 'TRY' },
        { id: '2', ruleName: 'Minimum kar marjı', ruleType: 'MARGIN_BASED', value: 10.0, unit: '%' }
      ]);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAddRule = async (e) => {
    e.preventDefault();
    const ruleToAdd = { ...newRule, id: Date.now().toString(), value: parseFloat(newRule.value) };
    // In a real app: await supabase.from('pricing_rules').insert([ruleToAdd]);
    setRules([...rules, ruleToAdd]);
    setNewRule({ ruleName: '', ruleType: 'COMPETITOR_BASED', value: '', unit: 'TRY' });
  };

  const handleDeleteRule = async (id) => {
    // In a real app: await supabase.from('pricing_rules').delete().eq('id', id);
    setRules(rules.filter(rule => rule.id !== id));
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-400 mb-2">Dinamik Fiyatlandırma Yönetimi</h1>
        <p className="text-slate-400">Rakip fiyatlarına veya hedef marjlara göre kurallar tanımlayın ve yönetin.</p>
      </header>

      <section className="bg-slate-800 p-6 rounded-lg shadow-lg mb-8 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Yeni Kural Ekle</h2>
        <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="block text-sm text-slate-400 mb-1">Kural Adı</label>
            <input 
              required
              type="text" 
              value={newRule.ruleName}
              onChange={e => setNewRule({...newRule, ruleName: e.target.value})}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500" 
              placeholder="Örn: Rakip altı kal"
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm text-slate-400 mb-1">Kural Tipi</label>
            <select
              value={newRule.ruleType}
              onChange={e => setNewRule({...newRule, ruleType: e.target.value})}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500"
            >
              <option value="COMPETITOR_BASED">Rakip Bazlı</option>
              <option value="MARGIN_BASED">Marj Bazlı</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm text-slate-400 mb-1">Değer</label>
            <input 
              required
              type="number" 
              step="0.01"
              value={newRule.value}
              onChange={e => setNewRule({...newRule, value: e.target.value})}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500" 
              placeholder="1.0"
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm text-slate-400 mb-1">Birim</label>
            <select
              value={newRule.unit}
              onChange={e => setNewRule({...newRule, unit: e.target.value})}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500"
            >
              <option value="TRY">TRY</option>
              <option value="%">%</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={20} /> Ekle
            </button>
          </div>
        </form>
      </section>

      <section className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Aktif Kurallar</h2>
        {loading ? (
          <p className="text-slate-400 text-center py-4">Yükleniyor...</p>
        ) : rules.length === 0 ? (
          <p className="text-slate-500 text-center py-4">Kayıtlı kural bulunmamaktadır.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  <th className="p-3">Kural Adı</th>
                  <th className="p-3">Tip</th>
                  <th className="p-3">Değer</th>
                  <th className="p-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 font-medium text-slate-200">{rule.ruleName}</td>
                    <td className="p-3 text-slate-300">
                      <span className={`px-2 py-1 text-xs rounded-full ${rule.ruleType === 'COMPETITOR_BASED' ? 'bg-purple-900 text-purple-200' : 'bg-green-900 text-green-200'}`}>
                        {rule.ruleType === 'COMPETITOR_BASED' ? 'Rakip' : 'Marj'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{rule.value} {rule.unit}</td>
                    <td className="p-3 flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors" title="Düzenle">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors" 
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}

export default App;
