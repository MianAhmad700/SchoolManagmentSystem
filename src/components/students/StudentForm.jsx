import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { addStudent, updateStudent } from '../../services/students';
import { getAllClasses } from '../../services/classes';

export default function StudentForm({ student, onSuccess, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: student || {
      status: 'active',
      gender: 'Male'
    }
  });
  const [uploading, setUploading] = useState(false);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getAllClasses();
        setClasses(data);
      } catch (error) {
        console.error("Failed to load classes", error);
        toast.error("Failed to load classes");
      }
    };
    fetchClasses();
  }, []);

  const onSubmit = async (data) => {
    setUploading(true);
    try {
      if (student?.id) {
        await updateStudent(student.id, data);
        toast.success("Student updated successfully");
      } else {
        await addStudent(data);
        toast.success("Student added successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save student");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full">
      <div className="px-6 py-4 bg-blue-500 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">
          {student ? 'Edit Student' : 'Add New Student'}
        </h3>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Personal Info */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Personal Information</h4>
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
              <label className="block text-sm font-medium text-slate-700">Father's Name</label>
              <input
                {...register("fatherName", { required: "Father Name is required" })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
              {errors.fatherName && <span className="text-red-500 text-xs">{errors.fatherName.message}</span>}
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
              <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
              <input
                type="date"
                {...register("dob")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">B-Form / CNIC</label>
              <input
                {...register("bForm")}
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
          </div>
        </div>

        {/* Academic Info */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Academic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Admission No</label>
              <input
                {...register("admissionNo", { required: "Admission No is required" })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
              {errors.admissionNo && <span className="text-red-500 text-xs">{errors.admissionNo.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Class</label>
              <select
                {...register("classId", { required: "Class is required" })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.name}>
                    {cls.label}
                  </option>
                ))}
              </select>
               {errors.classId && <span className="text-red-500 text-xs">{errors.classId.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Roll No</label>
              <input
                {...register("rollNo")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Admission Date</label>
              <input
                type="date"
                {...register("admissionDate")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                {...register("status")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="expelled">Expelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Monthly Fee (PKR)</label>
              <input
                type="number"
                {...register("monthlyFee", { required: "Monthly Fee is required", min: 0 })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="e.g. 5000"
              />
              {errors.monthlyFee && <span className="text-red-500 text-xs">{errors.monthlyFee.message}</span>}
            </div>
          </div>
        </div>
        
        {/* Address */}
        <div>
           <label className="block text-sm font-medium text-slate-700">Address</label>
            <textarea
              {...register("address")}
              rows={3}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
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
            disabled={uploading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {uploading ? 'Saving...' : 'Save Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
