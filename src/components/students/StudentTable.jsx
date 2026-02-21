import { Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

export default function StudentTable({ students, loading, onEdit, onDelete, onView, selectedIds, onSelectionChange, className }) {
  
  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(students.map(s => s.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className={cn("overflow-auto bg-blue rounded-2xl shadow-sm border border-slate-100 relative", className)}>
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-blue-500 sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-6 py-4 text-left">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                checked={students.length > 0 && selectedIds.length === students.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Student Name
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              ID
            </th>
             <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Class
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Parent
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
              <td colSpan="7" className="px-6 py-24 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-slate-500">Loading students...</p>
              </td>
            </tr>
          ) : students.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-sm text-slate-500">
                No students found.
              </td>
            </tr>
          ) : (
            students.map((student) => {
              const isSelected = selectedIds.includes(student.id);
              return (
                <tr 
                  key={student.id} 
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
                      onChange={() => toggleSelect(student.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {student.photoUrl ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={student.photoUrl} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {student.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{student.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    #{student.admissionNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {student.classId}
                    </span>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {student.fatherName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                      student.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {student.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => onDelete(student.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                       <button
                        onClick={() => onEdit(student)}
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
