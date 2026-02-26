import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { addStudent, updateStudent, getNextAdmissionNo, getNextRollNo } from '../../services/students';
import { getAllClasses } from '../../services/classes';
import { fileToBase64Compressed } from '../../utils/image';
import { cn } from '../../lib/utils';

export default function StudentForm({ student, onSuccess, onClose }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    mode: 'onChange',
    defaultValues: student ? {
      ...student,
      fullName: student.fullName || student.name || '',
      bFormCnic: student.bFormCnic || student.bForm || '',
      photoBase64: student.photoBase64 || student.photoUrl || ''
    } : {
      status: 'active',
      gender: 'Male',
      session: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      admissionDate: new Date().toISOString().slice(0, 10),
      section: '',
      photoBase64: ''
    }
  });
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  const classId = watch('classId');
  const session = watch('session');
  const admissionDate = watch('admissionDate');
  const monthlyFee = watch('monthlyFee') || 0;
  const admissionFee = watch('admissionFee') || 0;
  const discount = watch('discount') || 0;
  const transportFee = watch('transportFee') || 0;
  const hostelFee = watch('hostelFee') || 0;
  const otherCharges = watch('otherCharges') || 0;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllClasses();
        setClasses(data);
      } catch {
        toast.error('Failed to load classes');
      }
    };
    load();
  }, []);

  useEffect(() => {
    const n = (v) => v !== undefined && v !== null && v !== '' ? Number(v) : 0;
    const total = n(monthlyFee) + n(admissionFee) + n(transportFee) + n(hostelFee) + n(otherCharges) - n(discount);
    setValue('totalFee', total);
  }, [monthlyFee, admissionFee, discount, transportFee, hostelFee, otherCharges, setValue]);

  useEffect(() => {
    const setIds = async () => {
      try {
        const year = (session && String(session).slice(0, 4)) || (admissionDate ? admissionDate.slice(0, 4) : String(new Date().getFullYear()));
        if (!student?.id) {
          if (year) {
            const a = await getNextAdmissionNo(Number(year));
            setValue('admissionNo', a);
          }
          if (classId) {
            const r = await getNextRollNo(classId);
            setValue('rollNo', r);
          }
        }
      } catch (e) {
        void e;
      }
    };
    setIds();
  }, [classId, session, admissionDate, setValue, student]);

  const maskCnic = (value) => {
    const digits = (value || '').replace(/\D/g, '').slice(0, 13);
    const p1 = digits.slice(0, 5);
    const p2 = digits.slice(5, 12);
    const p3 = digits.slice(12, 13);
    let out = p1;
    if (digits.length > 5) out += '-' + p2;
    if (digits.length > 12) out += '-' + p3;
    return out;
  };

  const onCnicInput = (e, field) => {
    const v = maskCnic(e.target.value);
    setValue(field, v, { shouldValidate: true });
  };

  const handlePhoto = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const b64 = await fileToBase64Compressed(f);
      setValue('photoBase64', b64, { shouldValidate: true });
    } catch {
      toast.error('Failed to process image');
    }
  };

  const onSubmit = async (d) => {
    setSaving(true);
    try {
      const payload = {
        fullName: d.fullName,
        gender: d.gender,
        dob: d.dob,
        bFormCnic: d.bFormCnic,
        photoBase64: d.photoBase64,
        address: d.address,
        bloodGroup: d.bloodGroup || '',
        religion: d.religion || '',
        medicalNotes: d.medicalNotes || '',
        fatherName: d.fatherName,
        fatherCnic: d.fatherCnic || '',
        fatherPhone: d.fatherPhone,
        motherName: d.motherName || '',
        motherPhone: d.motherPhone || '',
        email: d.email || '',
        occupation: d.occupation || '',
        guardianName: d.guardianName || d.fatherName,
        guardianPhone: d.guardianPhone || d.fatherPhone,
        relation: d.relation || 'Father',
        session: d.session,
        classId: d.classId,
        section: d.section,
        admissionDate: d.admissionDate,
        status: d.status || 'active',
        admissionNo: d.admissionNo,
        rollNo: d.rollNo,
        monthlyFee: Number(d.monthlyFee),
        admissionFee: Number(d.admissionFee || 0),
        discount: Number(d.discount || 0),
        transportFee: Number(d.transportFee || 0),
        hostelFee: Number(d.hostelFee || 0),
        otherCharges: Number(d.otherCharges || 0),
        totalFee: Number(d.totalFee || 0),
        prevSchool: d.prevSchool || '',
        lastClass: d.lastClass || '',
        leavingReason: d.leavingReason || '',
        prevGrade: d.prevGrade || ''
      };
      if (student?.id) {
        await updateStudent(student.id, payload);
        toast.success('Student updated successfully');
      } else {
        await addStudent(payload);
        toast.success('Student added successfully');
      }
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to save student');
    } finally {
      setSaving(false);
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
        <div>
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Full Name <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                {...register('fullName', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.fullName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.fullName && <span id="fullName-error" className="text-red-600 text-xs" role="alert">{errors.fullName.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Gender <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <select
                {...register('gender', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.gender}
                aria-describedby={errors.gender ? 'gender-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.gender && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && <span id="gender-error" className="text-red-600 text-xs" role="alert">{errors.gender.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Date of Birth <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                type="date"
                {...register('dob', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.dob}
                aria-describedby={errors.dob ? 'dob-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.dob && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.dob && <span id="dob-error" className="text-red-600 text-xs" role="alert">{errors.dob.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                B-Form / CNIC <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                {...register('bFormCnic', { required: 'Required' })}
                onChange={(e) => onCnicInput(e, 'bFormCnic')}
                aria-required="true"
                aria-invalid={!!errors.bFormCnic}
                aria-describedby={errors.bFormCnic ? 'bFormCnic-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.bFormCnic && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
                placeholder="XXXXX-XXXXXXX-X"
              />
              {errors.bFormCnic && <span id="bFormCnic-error" className="text-red-600 text-xs" role="alert">{errors.bFormCnic.message}</span>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Photo <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <div className="flex items-center gap-4">
                <input type="file" accept="image/*" onChange={handlePhoto} />
                <input
                  type="hidden"
                  {...register('photoBase64', { required: 'Required' })}
                  aria-required="true"
                  aria-invalid={!!errors.photoBase64}
                  aria-describedby={errors.photoBase64 ? 'photoBase64-error' : undefined}
                />
                {watch('photoBase64') && (
                  <img alt="preview" src={watch('photoBase64')} className="h-16 w-16 rounded object-cover border" />
                )}
              </div>
              {errors.photoBase64 && <span id="photoBase64-error" className="text-red-600 text-xs" role="alert">{errors.photoBase64.message}</span>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Address <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <textarea
                {...register('address', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? 'address-error' : undefined}
                rows={3}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.address && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.address && <span id="address-error" className="text-red-600 text-xs" role="alert">{errors.address.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Blood Group <span className="text-slate-400">(Optional)</span>
              </label>
              <input {...register('bloodGroup')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Religion <span className="text-slate-400">(Optional)</span>
              </label>
              <input {...register('religion')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Medical Notes <span className="text-slate-400">(Optional)</span>
              </label>
              <input {...register('medicalNotes')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Parent / Guardian Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Father Name <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                {...register('fatherName', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.fatherName}
                aria-describedby={errors.fatherName ? 'fatherName-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.fatherName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.fatherName && <span id="fatherName-error" className="text-red-600 text-xs" role="alert">{errors.fatherName.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Father CNIC <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                {...register('fatherCnic', { required: 'Required' })}
                onChange={(e) => onCnicInput(e, 'fatherCnic')}
                placeholder="XXXXX-XXXXXXX-X"
                aria-required="true"
                aria-invalid={!!errors.fatherCnic}
                aria-describedby={errors.fatherCnic ? 'fatherCnic-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.fatherCnic && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.fatherCnic && <span id="fatherCnic-error" className="text-red-600 text-xs" role="alert">{errors.fatherCnic.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Father Phone <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                {...register('fatherPhone', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.fatherPhone}
                aria-describedby={errors.fatherPhone ? 'fatherPhone-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.fatherPhone && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.fatherPhone && <span id="fatherPhone-error" className="text-red-600 text-xs" role="alert">{errors.fatherPhone.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Guardian Name <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                {...register('guardianName', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.guardianName}
                aria-describedby={errors.guardianName ? 'guardianName-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.guardianName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.guardianName && <span id="guardianName-error" className="text-red-600 text-xs" role="alert">{errors.guardianName.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Guardian Phone <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                {...register('guardianPhone', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.guardianPhone}
                aria-describedby={errors.guardianPhone ? 'guardianPhone-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.guardianPhone && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.guardianPhone && <span id="guardianPhone-error" className="text-red-600 text-xs" role="alert">{errors.guardianPhone.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Relation <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                {...register('relation', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.relation}
                aria-describedby={errors.relation ? 'relation-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.relation && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.relation && <span id="relation-error" className="text-red-600 text-xs" role="alert">{errors.relation.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Mother Name <span className="text-slate-400">(Optional)</span>
              </label>
              <input {...register('motherName')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Mother Phone <span className="text-slate-400">(Optional)</span>
              </label>
              <input {...register('motherPhone')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email <span className="text-slate-400">(Optional)</span>
              </label>
              <input type="email" {...register('email')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Occupation <span className="text-slate-400">(Optional)</span>
              </label>
              <input {...register('occupation')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Academic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Session <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                {...register('session', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.session}
                aria-describedby={errors.session ? 'session-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.session && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.session && <span id="session-error" className="text-red-600 text-xs" role="alert">{errors.session.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Class <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <select
                {...register('classId', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.classId}
                aria-describedby={errors.classId ? 'classId-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.classId && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.name || cls.value}>{cls.label}</option>
                ))}
              </select>
              {errors.classId && <span id="classId-error" className="text-red-600 text-xs" role="alert">{errors.classId.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Section <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                {...register('section', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.section}
                aria-describedby={errors.section ? 'section-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.section && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.section && <span id="section-error" className="text-red-600 text-xs" role="alert">{errors.section.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Admission Date <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                type="date"
                {...register('admissionDate', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.admissionDate}
                aria-describedby={errors.admissionDate ? 'admissionDate-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.admissionDate && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.admissionDate && <span id="admissionDate-error" className="text-red-600 text-xs" role="alert">{errors.admissionDate.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Status <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <select
                {...register('status', { required: 'Required' })}
                aria-required="true"
                aria-invalid={!!errors.status}
                aria-describedby={errors.status ? 'status-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2",
                  errors.status && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="expelled">Expelled</option>
              </select>
              {errors.status && <span id="status-error" className="text-red-600 text-xs" role="alert">{errors.status.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Admission No</label>
              <input {...register('admissionNo')} readOnly className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Roll No</label>
              <input {...register('rollNo')} readOnly className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm sm:text-sm border p-2" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Fee Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Monthly Fee <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                type="number"
                {...register('monthlyFee', { required: 'Required', min: 0 })}
                aria-required="true"
                aria-invalid={!!errors.monthlyFee}
                aria-describedby={errors.monthlyFee ? 'monthlyFee-error' : undefined}
                className={cn(
                  "mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm border p-2 focus:border-blue-500 focus:ring-blue-500",
                  errors.monthlyFee && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.monthlyFee && <span id="monthlyFee-error" className="text-red-600 text-xs" role="alert">{errors.monthlyFee.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Admission Fee <span className="text-slate-400">(Optional)</span>
              </label>
              <input type="number" {...register('admissionFee')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Discount <span className="text-slate-400">(Optional)</span>
              </label>
              <input type="number" {...register('discount')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Transport Fee <span className="text-slate-400">(Optional)</span>
              </label>
              <input type="number" {...register('transportFee')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Hostel Fee <span className="text-slate-400">(Optional)</span>
              </label>
              <input type="number" {...register('hostelFee')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Other Charges <span className="text-slate-400">(Optional)</span>
              </label>
              <input type="number" {...register('otherCharges')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Total Fee</label>
              <input {...register('totalFee')} readOnly className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm sm:text-sm border p-2" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Previous Education</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Previous School <span className="text-slate-400">(Optional)</span>
              </label>
              <input {...register('prevSchool')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Last Class <span className="text-slate-400">(Optional)</span>
              </label>
              <input {...register('lastClass')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Leaving Reason <span className="text-slate-400">(Optional)</span>
              </label>
              <input {...register('leavingReason')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Previous Grade <span className="text-slate-400">(Optional)</span>
              </label>
              <input {...register('prevGrade')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm border p-2" />
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
            disabled={saving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
