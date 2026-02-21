import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import { Upload, X, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';
import { addTeacher, updateTeacher } from '../../services/teachers';
import { uploadFile } from '../../services/storage';

const SUBJECTS = ["Math", "English", "Urdu", "Science", "Physics", "Chemistry", "Biology", "Computer", "Islamiyat", "Pak Studies"];
const CLASSES = ["PG", "Nursery", "Prep", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function TeacherForm({ teacher, onSuccess, onClose }) {
  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm({
    defaultValues: teacher || {
      status: 'active',
      gender: 'Male',
      subjects: [],
      assignedClasses: []
    }
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(teacher?.photoUrl || null);
  const [uploading, setUploading] = useState(false);
  
  const watchedSubjects = watch("subjects");
  const watchedClasses = watch("assignedClasses");

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArrayChange = (field, value, checked) => {
    const currentValues = watch(field) || [];
    if (checked) {
      setValue(field, [...currentValues, value]);
    } else {
      setValue(field, currentValues.filter(item => item !== value));
    }
  };

  const onSubmit = async (data) => {
    try {
      const teacherData = {
        ...data,
        photoUrl: teacher?.photoUrl || '',
      };

      if (teacher?.id) {
        await updateTeacher(teacher.id, teacherData);
        toast.success("Teacher updated successfully");
      } else {
        await addTeacher(teacherData);
        toast.success("Teacher added successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save teacher");
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="px-6 py-4 bg-blue-500 flex justify-between items-center shrink-0">
        <h3 className="text-lg font-medium text-white">
          {teacher ? 'Edit Teacher' : 'Add New Teacher'}
        </h3>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
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
                {...register("cnic", { required: "CNIC is required" })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
              {errors.cnic && <span className="text-red-500 text-xs">{errors.cnic.message}</span>}
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                {...register("phone")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                {...register("email")}
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
              <label className="block text-sm font-medium text-slate-700">Salary</label>
              <input
                type="number"
                {...register("salary")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
          </div>
        </div>
        
        {/* Professional Info */}
        <div>
           <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Professional Information</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-medium text-slate-700">Qualification</label>
              <input
                {...register("qualification")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Experience (Years)</label>
              <input
                {...register("experience")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
           </div>
        </div>

        {/* Subjects & Classes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subjects</label>
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200 h-48 overflow-y-auto">
                    {SUBJECTS.map(subject => (
                        <div key={subject} className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                id={`subject-${subject}`}
                                value={subject}
                                checked={(watchedSubjects || []).includes(subject)}
                                onChange={(e) => handleArrayChange('subjects', subject, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`subject-${subject}`} className="ml-2 block text-sm text-slate-900">
                                {subject}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Classes</label>
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200 h-48 overflow-y-auto">
                    {CLASSES.map(cls => (
                        <div key={cls} className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                id={`class-${cls}`}
                                value={cls}
                                checked={(watchedClasses || []).includes(cls)}
                                onChange={(e) => handleArrayChange('assignedClasses', cls, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`class-${cls}`} className="ml-2 block text-sm text-slate-900">
                                Class {cls}
                            </label>
                        </div>
                    ))}
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
            disabled={uploading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {uploading ? 'Saving...' : 'Save Teacher'}
          </button>
        </div>
      </form>
    </div>
  );
}
