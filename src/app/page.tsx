'use client';

export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { Search, Trophy, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  level: string;
  grade: string;
  rewardPoints: number;
  penaltyPoints: number;
}

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const updatePoints = async (id: number, type: 'reward' | 'penalty') => {
    setUpdatingId(`${id}-${type}`);
    try {
      const res = await fetch('/api/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type }),
      });
      if (res.ok) {
        await fetchStudents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setUpdatingId(null), 500);
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    const scoreA = a.rewardPoints - a.penaltyPoints;
    const scoreB = b.rewardPoints - b.penaltyPoints;
    return scoreB - scoreA || a.name.localeCompare(b.name);
  });

  const top5 = sortedStudents.slice(0, 5);
  const bottom5 = sortedStudents.slice(-5).reverse();

  const filteredSearch = students.filter(s => 
    s.name.includes(search) || s.level.includes(search) || s.grade.includes(search)
  ).slice(0, 10);

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Search Header */}
      <section className="mb-12">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="학생 이름 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
          {search && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {filteredSearch.map(s => (
                <div key={s.id} className="px-4 py-3 hover:bg-slate-50 flex justify-between items-center border-b last:border-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{s.name}</span>
                    <span className="text-xs text-slate-400">{s.level} {s.grade} · {s.rewardPoints - s.penaltyPoints}점</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updatePoints(s.id, 'reward')}
                      disabled={!!updatingId}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => updatePoints(s.id, 'penalty')}
                      disabled={!!updatingId}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredSearch.length === 0 && <div className="px-4 py-3 text-slate-500 text-sm">검색 결과가 없습니다.</div>}
            </div>
          )}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top 5 Section */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-green-500" size={24} />
            <h2 className="text-xl font-bold text-slate-800">상위 5명</h2>
          </div>
          <div className="space-y-3">
            {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />) :
              top5.map((s, idx) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-4">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'}`}>
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-700">{s.name}</span>
                    <span className="text-xs text-slate-400">{s.level} {s.grade}</span>
                  </div>
                  <span className="font-bold text-green-600">+{s.rewardPoints - s.penaltyPoints}</span>
                </div>
              ))
            }
          </div>
        </section>

        {/* Bottom 5 Section */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="text-red-500" size={24} />
            <h2 className="text-xl font-bold text-slate-800">하위 5명</h2>
          </div>
          <div className="space-y-3">
            {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />) :
              bottom5.map((s, idx) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-4">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-600 text-xs font-bold">
                      {sortedStudents.length - idx}
                    </span>
                    <span className="font-semibold text-slate-700">{s.name}</span>
                    <span className="text-xs text-slate-400">{s.level} {s.grade}</span>
                  </div>
                  <span className="font-bold text-red-600">{s.rewardPoints - s.penaltyPoints}</span>
                </div>
              ))
            }
          </div>
        </section>
      </div>
    </main>
  );
}
