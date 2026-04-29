'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Users, Trash2, Download, FileUp, Check, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Student {
  id: number;
  name: string;
  level: string;
  grade: string;
  gender: string;
}

const levelOrder = ['Chalcedony', 'Emerald', 'Sardonyx'];
const gradeOrder = {
  Chalcedony: ['Alpha', 'Beta', 'Gamma', 'Delta'],
  Emerald: ['Alpha', 'Beta', 'Gamma', 'Delta'],
  Sardonyx: ['Epsilon', 'Zeta', 'Eta'],
};

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState('Chalcedony');
  const [newGrade, setNewGrade] = useState('Alpha');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const res = await fetch('/api/students');
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  };

  const handleAddIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, level: newLevel, grade: newGrade }),
    });

    if (res.ok) {
      setNewName('');
      fetchStudents();
      alert('학생이 등록되었습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 학생을 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchStudents();
  };

  const downloadTemplate = () => {
    const templateData = [
      { '이름': '홍길동', '레벨': 'Chalcedony', '그레이드': 'Alpha' },
      { '이름': '김철수', '레벨': 'Emerald', '그레이드': 'Beta' },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "학생_등록_양식.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const formattedData = data.map((row: any) => ({
        name: row['이름'],
        level: row['레벨'],
        grade: row['그레이드']
      })).filter(s => s.name && s.level && s.grade);

      if (formattedData.length > 0) {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData),
        });
        if (res.ok) {
          alert(`${formattedData.length}명의 학생이 등록되었습니다.`);
          fetchStudents();
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center gap-3 mb-10">
        <Users className="text-blue-600" size={32} />
        <h1 className="text-3xl font-bold text-slate-800">학생 관리</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Registration Section */}
        <div className="md:col-span-1 space-y-6">
          <section className="card p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-blue-600" />
              개별 등록
            </h2>
            <form onSubmit={handleAddIndividual} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">이름</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="학생 이름 입력"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">레벨</label>
                  <select
                    value={newLevel}
                    onChange={(e) => {
                      setNewLevel(e.target.value);
                      setNewGrade(gradeOrder[e.target.value as keyof typeof gradeOrder][0]);
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 outline-none"
                  >
                    {levelOrder.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">그레이드</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 outline-none"
                  >
                    {(gradeOrder[newLevel as keyof typeof gradeOrder] || []).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full btn-primary mt-2">등록하기</button>
            </form>
          </section>

          <section className="card p-6 border-dashed border-2 border-slate-200 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileUp size={20} className="text-green-600" />
              단체 등록
            </h2>
            <div className="space-y-4">
              <button
                onClick={downloadTemplate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                <Download size={16} />
                양식 엑셀 다운로드
              </button>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <FileUp size={16} />
                  엑셀 파일 업로드
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                * 다운로드한 양식에 맞춰 작성 후 업로드해주세요. 중복된 학생은 무시됩니다.
              </p>
            </div>
          </section>
        </div>

        {/* List Section */}
        <div className="md:col-span-2">
          <section className="card">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-700">등록된 학생 목록 ({students.length}명)</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white shadow-sm">
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3">레벨/그레이드</th>
                    <th className="px-6 py-3">이름</th>
                    <th className="px-6 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.sort((a,b) => a.level.localeCompare(b.level) || a.name.localeCompare(b.name)).map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-500">{student.level}</span>
                        <span className="mx-1 text-slate-300">/</span>
                        <span className="text-xs font-bold text-blue-600">{student.grade}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{student.name}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                        등록된 학생이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
