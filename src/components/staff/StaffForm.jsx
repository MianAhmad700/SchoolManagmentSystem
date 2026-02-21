import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { addStaff, updateStaff } from '../../services/staff';

const ROLES = ["Sweeper", "Electrician", "Composer", "Guard", "Gardener", "Driver", "Peon", "Other"];

export default function StaffForm({ staff, onSuccess, onClose }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: staff || {
      role: 'Sweeper',
      gender: 'Male',
      status: 'active'
    }
  });

  const onSubmit = async (data) => {
    try {
      // Clean up empty strings to undefined or null if needed, 
      // but Firestore handles empty strings fine.
      // We mainly want to avoid undefined if fields are missing.
      
      if (staff) {
        await updateStaff(staff.id, data);
        toast.success("Staff updated successfully");
      } else {
        await addStaff(data);
        toast.success("Staff added successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      if (error.code === 'permission-denied') {
        toast.error("Permission denied: Update Firestore Rules");
      } else {
        toast.error("Failed to save staff data");
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full">
      <div className="px-6 py-4 bg-slate-900 flex justify-between items-center shrink-0">
        <h3 className="text-lg font-medium text-white">
          {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
        {/* Personal Info */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Staff Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                {...register("name", { required: "Name is required" })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
              {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Role / Designation</label>
              <select
                {...register("role")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              >
                {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Gender</label>
              <select
                {...register("gender")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">CNIC</label>
              <input
                {...register("cnic")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                {...register("phone")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-700">Joining Date</label>
              <input
                type="date"
                {...register("joiningDate")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Monthly Salary</label>
              <input
                type="number"
                {...register("salary")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
            
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Address</label>
                <input
                    {...register("address")}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Staff'}
          </button>
        </div>
      </form>
    </div>
  );
}
