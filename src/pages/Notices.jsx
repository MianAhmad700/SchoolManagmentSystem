import NoticeBoard from '../components/notices/NoticeBoard';

export default function Notices() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notice Board</h1>
          <p className="text-sm text-slate-500 mt-1">Manage school announcements and circulars</p>
        </div>
      </div>

      <NoticeBoard />
    </div>
  );
}
