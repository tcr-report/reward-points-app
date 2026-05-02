'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Users, Layers, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Student {
  id: number;
  name: string;
  level: string;
  grade: string;
  rewardPoints: number;
  penaltyPoints: number;
}

const levelOrder = ['Chalcedony', 'Emerald', 'Sardonyx'];

export default function RankingPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'overall' | 'level'>('overall');

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error('Unexpected students response:', data);
          setStudents([]);
        } else {
          setStudents(data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch students:', error);
        setStudents([]);
        setLoading(false);
      });
  }, []);

  const getSortedStudents = (list: Student[] | null | undefined) => {
    if (!Array.isArray(list)) return [];
    return [...list].sort((a, b) => {
      const scoreA = a.rewardPoints - a.penaltyPoints;
      const scoreB = b.rewardPoints - b.penaltyPoints;
      return scoreB - scoreA || a.name.localeCompare(b.name);
    });
  };

  const exportToExcel = (data: Student[], fileName: string) => {
    const sorted = getSortedStudents(data);
    const exportData = sorted.map((s, idx) => ({
      '순위': idx + 1,
      '레벨': s.level,
      '그레이드': s.grade,
      '이름': s.name,
      '상점': s.rewardPoints,
      '벌점': s.penaltyPoints,
      '총점': s.rewardPoints - s.penaltyPoints
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ranking");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const exportLevelExcel = () => {
    const wb = XLSX.utils.book_new();
    levelOrder.forEach(level => {
      const levelStudents = students.filter(s => s.level === level);
      if (levelStudents.length > 0) {
        const sorted = getSortedStudents(levelStudents);
        const exportData = sorted.map((s, idx) => ({
          '순위': idx + 1,
          '레벨': s.level,
          '그레이드': s.grade,
          '이름': s.name,
          '상점': s.rewardPoints,
          '벌점': s.penaltyPoints,
          '총점': s.rewardPoints - s.penaltyPoints
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, level);
      }
    });
    XLSX.writeFile(wb, `레벨별_순위.xlsx`);
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-64 flex-shrink-0">
          <div className="card p-2 space-y-1">
            <button
              onClick={() => setView('overall')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                view === 'overall' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users size={18} />
              전체 순위
            </button>
            <button
              onClick={() => setView('level')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                view === 'level' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layers size={18} />
              레벨별 순위
            </button>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => view === 'overall' ? exportToExcel(students, '전체_순위') : exportLevelExcel()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-bold hover:bg-green-100 transition-colors shadow-sm"
            >
              <FileSpreadsheet size={18} />
              Excel로 내보내기
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-800">
              {view === 'overall' ? '전체 순위' : '레벨별 순위'}
            </h1>
          </div>

          {view === 'overall' ? (
            <RankingTable students={getSortedStudents(students)} loading={loading} />
          ) : (
            <div className="space-y-12">
              {levelOrder.map(level => {
                const levelStudents = students.filter(s => s.level === level);
                if (levelStudents.length === 0) return null;
                return (
                  <div key={level} className="space-y-4">
                    <h2 className="text-lg font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-4 h-1 bg-blue-600 rounded-full"></span>
                      {level} 순위
                    </h2>
                    <RankingTable students={getSortedStudents(levelStudents)} loading={loading} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function RankingTable({ students, loading }: { students: Student[], loading: boolean }) {
  return (
    <div className="card">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 font-semibold text-slate-600 text-sm w-20">순위</th>
            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">학생</th>
            <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">상점</th>
            <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">벌점</th>
            <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">총점</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? Array(5).fill(0).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td colSpan={5} className="px-6 py-6 bg-white" />
            </tr>
          )) : students.map((s, idx) => (
            <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center justify-center">
                  {idx < 3 ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                      idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                      idx === 1 ? 'bg-slate-300 text-slate-800' :
                      'bg-amber-600 text-white'
                    }`}>
                      <Medal size={16} />
                    </div>
                  ) : (
                    <span className="text-slate-400 font-bold text-sm">{idx + 1}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="font-bold text-slate-800">{s.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{s.grade}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-center text-green-600 font-bold text-sm">+{s.rewardPoints}</td>
              <td className="px-6 py-4 text-center text-red-600 font-bold text-sm">-{s.penaltyPoints}</td>
              <td className="px-6 py-4 text-right">
                <span className="text-lg font-black text-slate-900">{s.rewardPoints - s.penaltyPoints}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
