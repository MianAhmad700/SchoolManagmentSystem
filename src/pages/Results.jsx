import { useState } from 'react';
import ResultEntry from '../components/results/ResultEntry';
import ResultSheet from '../components/results/ResultSheet';
import CreateExam from '../components/results/CreateExam';
import { cn } from '../lib/utils';

export default function Results() {
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'entry' or 'sheet'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Results Management</h1>
          <p className="text-sm text-slate-500 mt-1">Record and manage student examination results</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('create')}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
              activeTab === 'create'
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            Create Exam
          </button>
          <button
            onClick={() => setActiveTab('entry')}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
              activeTab === 'entry'
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            Result Entry
          </button>
          <button
            onClick={() => setActiveTab('sheet')}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
              activeTab === 'sheet'
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            Result Sheet
          </button>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto">
        {activeTab === 'create' && <CreateExam />}
        {activeTab === 'entry' && <ResultEntry />}
        {activeTab === 'sheet' && <ResultSheet />}
      </div>
    </div>
  );
}
