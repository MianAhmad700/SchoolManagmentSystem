import { useState, useEffect } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import StaffTable from '../components/staff/StaffTable';
import StaffForm from '../components/staff/StaffForm';
import { getAllStaff, deleteStaff } from '../services/staff';
import { toast } from 'react-toastify';

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await getAllStaff();
      setStaffList(data);
    } catch (error) {
      console.error(error);
      if (error.code === 'permission-denied') {
        toast.error("Permission denied: Update Firestore Rules");
      } else {
        toast.error("Failed to load staff data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await deleteStaff(id);
        toast.success("Staff member deleted successfully");
        fetchStaff();
      } catch (error) {
        toast.error("Failed to delete staff member");
      }
    }
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchStaff();
  };

  const filteredStaff = staffList.filter(staff => 
    staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header & Filters */}
      <div className="flex flex-col gap-4 text-slate-900 p-6 rounded-2xl shadow-sm shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
            <p className="text-sm text-slate-600 mt-1">Manage support staff (Sweepers, Electricians, etc.)</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-blue-100 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Add Button */}
            <button
                onClick={() => {
                  setEditingStaff(null);
                  setShowForm(true);
                }}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 w-full sm:w-auto"
            >
                <Plus className="h-4 w-4" />
                Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0">
        <StaffTable 
          staffList={filteredStaff} 
          loading={loading} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-200/50 backdrop-blur-sm flex items-center justify-center p-4">
          <StaffForm 
            staff={editingStaff} 
            onSuccess={handleFormSuccess} 
            onClose={() => setShowForm(false)} 
          />
        </div>
      )}
    </div>
  );
}
