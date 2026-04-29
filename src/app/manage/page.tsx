'use client';

import { useState, useEffect } from 'react';
import { Settings2, Plus, Minus, Check, RotateCcw } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  level: string;
  grade: string;
  rewardPoints: number;
  penaltyPoints: number;
}

const levelOrder = ['Chalcedony', 'Emerald', 'Sardonyx'];
const gradeOrder = {
  Chalcedony: ['Alpha', 'Beta', 'Gamma', 'Delta'],
  Emerald: ['Alpha', 'Beta', 'Gamma', 'Delta'],
  Sardonyx: ['Epsilon', 'Zeta', 'Eta'],
};

export default function ManagePage() {
  const [students, setStudents] = useState<Student[]>([]);
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

  const handleUpdate = async (id: number, type: 'reward' | 'penalty') => {
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

  const handleReset = async () => {
    if (!confirm('정말로 모든 학생의 상벌점을 0으로 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    
    try {
      const res = await fetch('/api/students/reset', { method: 'POST' });
      if (res.ok) {
        alert('모든 점수가 초기화되었습니다.');
        await fetchStudents();
      }
    } catch (err) {
      console.error(err);
      alert('초기화 중 오류가 발생했습니다.');
    }
  };

  // Grouping and Sorting
  const groupedStudents: Record<string, Record<string, Student[]>> = {};

  levelOrder.forEach(level => {
    groupedStudents[level] = {};
    (gradeOrder[level as keyof typeof gradeOrder] || []).forEach(grade => {
      groupedStudents[level][grade] = students
        .filter(s => s.level === level && s.grade === grade)
        .sort((a, b) => a.name.localeCompare(b.name));
    });
  });

  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <Settings2 className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-slate-800">상벌점 관리</h1>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
        >
          <RotateCcw size={18} />
          분기 점수 초기화
        </button>
      </div>

      <div className="space-y-12">
        {levelOrder.map(level => (
          <section key={level} className="space-y-6">
            <h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
              {level}
            </h2>
            
            <div className="grid gap-8">
              {(gradeOrder[level as keyof typeof gradeOrder] || []).map(grade => {
                const studentsInGrade = groupedStudents[level][grade];
                if (studentsInGrade.length === 0) return null;

                return (
                  <div key={grade} className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      {grade}
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {studentsInGrade.map(student => (
                        <div key={student.id} className="card p-4 flex items-center justify-between hover:border-blue-200 transition-colors">
                          <div>
                            <div className="font-bold text-slate-800">{student.name}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              상 {student.rewardPoints} / 벌 {student.penaltyPoints}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(student.id, 'reward')}
                              disabled={!!updatingId}
                              className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              {updatingId === `${student.id}-reward` ? <Check size={18} /> : <Plus size={18} />}
                            </button>
                            <button
                              onClick={() => handleUpdate(student.id, 'penalty')}
                              disabled={!!updatingId}
                              className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              {updatingId === `${student.id}-penalty` ? <Check size={18} /> : <Minus size={18} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
