import { Edit, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

export default function TeacherTable({ teachers, loading, onEdit, onDelete, className }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === teachers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(teachers.map(t => t.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className={cn("overflow-auto bg-white rounded-2xl shadow-sm border border-slate-100 relative", className)}>
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-blue-500 sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-6 py-4 text-left">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                checked={teachers.length > 0 && selectedIds.length === teachers.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Teacher Info
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Qualification
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Subjects
            </th>
             <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Classes
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan="7" className="px-6 py-5 h-64 text-center align-center">
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-2 text-slate-500">Loading teachers...</p>
                </div>
              </td>
            </tr>
          ) : teachers.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-sm text-slate-500">
                No teachers found.
              </td>
            </tr>
          ) : (
            teachers.map((teacher) => {
              const isSelected = selectedIds.includes(teacher.id);
              return (
                <tr 
                  key={teacher.id} 
                  className={cn(
                    "transition-colors even:bg-blue-50",
                    isSelected && "bg-blue-50"
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      checked={isSelected}
                      onChange={() => toggleSelect(teacher.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {teacher.photoUrl ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={teacher.photoUrl} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {teacher.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{teacher.name}</div>
                        <div className="text-sm text-slate-500">{teacher.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{teacher.qualification}</div>
                    <div className="text-sm text-slate-500">{teacher.experience} years exp</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects?.map(sub => (
                          <span key={sub} className="px-2 py-0.5 text-xs bg-slate-100 rounded-full text-slate-600">
                              {sub}
                          </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-wrap gap-1">
                      {teacher.assignedClasses?.map(cls => (
                          <span key={cls} className="px-2 py-0.5 text-xs bg-blue-50 rounded-full text-blue-600">
                              {cls}
                          </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                      teacher.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {teacher.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => onDelete(teacher.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                       <button
                        onClick={() => onEdit(teacher)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
