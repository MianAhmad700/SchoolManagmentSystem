import { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, FileText, X, Download, AlertCircle, FileSpreadsheet, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { bulkAddStudents } from '../../services/students';

export default function BulkUpload({ onSuccess, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const downloadTemplate = () => {
    const headers = [
      "fullName","gender","dob","bFormCnic","photoBase64","address",
      "bloodGroup","religion","medicalNotes",
      "fatherName","fatherCnic","fatherPhone","guardianName","guardianPhone","relation",
      "motherName","motherPhone","email","occupation",
      "session","classId","section","admissionDate","status",
      "monthlyFee","admissionFee","discount","transportFee","hostelFee","otherCharges",
      "prevSchool","lastClass","leavingReason","prevGrade"
    ];

    const dummyData = Array.from({ length: 30 }).map((_, i) => ({
      fullName: `Student ${i + 1}`,
      gender: i % 2 === 0 ? "Male" : "Female",
      dob: "2015-01-01",
      bFormCnic: "12345-1234567-1",
      photoBase64: "",
      address: `Street ${i + 1}, City`,
      fatherName: `Father ${i + 1}`,
      fatherCnic: "12345-1234567-1",
      fatherPhone: `0300-123456${i}`,
      guardianName: `Father ${i + 1}`,
      guardianPhone: `0300-123456${i}`,
      relation: "Father",
      session: "2026-2027",
      classId: `${(i % 10) + 1}`,
      section: "A",
      admissionDate: new Date().toISOString().split('T')[0],
      status: "active",
      monthlyFee: 5000
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dummyData, { header: headers });

    const wscols = headers.map(() => ({ wch: 18 }));
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Students_Template");

    XLSX.writeFile(wb, "Student_Upload_Template.xlsx");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      const fileType = selectedFile.name.split('.').pop().toLowerCase();

      if (fileType === 'csv') {
        parseCSV(selectedFile);
      } else if (['xlsx', 'xls'].includes(fileType)) {
        parseExcel(selectedFile);
      } else {
        toast.error("Please upload a valid CSV or Excel file");
        setFile(null);
      }
    }
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > 0) {
            validateHeaders(results.data[0]);
        }
        setPreview(results.data);
      },
      error: (error) => {
        toast.error("Error parsing CSV: " + error.message);
      }
    });
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        if (json.length > 0) {
            validateHeaders(json[0]);
        }
        setPreview(json);
      } catch (error) {
        console.error(error);
        toast.error("Error parsing Excel file");
      }
    };
    reader.readAsBinaryString(file);
  };

  const validateHeaders = (firstRow) => {
      const required = ['fullName','gender','dob','bFormCnic','fatherName','fatherPhone','classId','monthlyFee'];
      const missing = required.filter(field => !Object.keys(firstRow).includes(field));
      if (missing.length > 0) {
          toast.warning(`Missing required headers: ${missing.join(', ')}`);
      }
  };

  const handleUpload = async () => {
    if (!preview.length) return;

    setUploading(true);
    try {
        const cleanData = preview.map(row => {
          const map = {
            fullName: row.fullName || row.name,
            gender: row.gender,
            dob: row.dob,
            bFormCnic: row.bFormCnic || row.bForm,
            photoBase64: row.photoBase64 || '',
            address: row.address || '',
            bloodGroup: row.bloodGroup || '',
            religion: row.religion || '',
            medicalNotes: row.medicalNotes || '',
            fatherName: row.fatherName,
            fatherCnic: row.fatherCnic || '',
            fatherPhone: row.fatherPhone || row.phone,
            motherName: row.motherName || '',
            motherPhone: row.motherPhone || '',
            email: row.email || '',
            occupation: row.occupation || '',
            guardianName: row.guardianName || row.fatherName,
            guardianPhone: row.guardianPhone || row.fatherPhone,
            relation: row.relation || 'Father',
            session: row.session,
            classId: row.classId,
            section: row.section,
            admissionDate: row.admissionDate,
            status: row.status || 'active',
            monthlyFee: Number(row.monthlyFee) || 0,
            admissionFee: Number(row.admissionFee || 0),
            discount: Number(row.discount || 0),
            transportFee: Number(row.transportFee || 0),
            hostelFee: Number(row.hostelFee || 0),
            otherCharges: Number(row.otherCharges || 0),
            prevSchool: row.prevSchool || '',
            lastClass: row.lastClass || '',
            leavingReason: row.leavingReason || '',
            prevGrade: row.prevGrade || ''
          };
          const required = ['fullName','gender','dob','bFormCnic','fatherName','fatherPhone','classId','monthlyFee'];
          const missing = required.filter(k => !map[k] && map[k] !== 0);
          if (missing.length) {
            throw new Error(`Missing required fields for ${map.fullName || 'record'}: ${missing.join(', ')}`);
          }
          return map;
        });

      await bulkAddStudents(cleanData);
      toast.success(`Successfully added ${cleanData.length} students`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload students");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full">
      {/* Header */}
      <div className="px-6 py-4 bg-blue-600 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Student Upload
        </h3>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="p-8">
        {/* Step 1: Template */}
        <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h4 className="font-semibold text-slate-800 mb-1">1. Download Template</h4>
                <p className="text-sm text-slate-500">Get the Excel file with pre-filled dummy data (30 students).</p>
            </div>
            <button 
                onClick={downloadTemplate}
                className="shrink-0 inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
                <Download className="h-4 w-4 mr-2 text-blue-600" />
                Download Excel
            </button>
        </div>

        {/* Step 2: Upload */}
        <div className="mb-6">
            <h4 className="font-semibold text-slate-800 mb-2">2. Upload Filled File</h4>
            <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    file ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".csv, .xlsx, .xls" 
                    className="hidden" 
                    onChange={handleFileChange}
                />
                
                {file ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                            <FileSpreadsheet className="h-8 w-8" />
                        </div>
                        <p className="text-lg font-medium text-slate-900">{file.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{preview.length} records found</p>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                                setPreview([]);
                            }}
                            className="mt-4 text-sm text-red-500 hover:text-red-700 font-medium"
                        >
                            Remove file
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                            <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">Supports .xlsx, .xls, .csv</p>
                    </div>
                )}
            </div>
        </div>

        {/* Preview Summary */}
        {preview.length > 0 && (
            <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-slate-700">Ready to import</span>
                </div>
                <p className="text-xs text-slate-500">
                    Will import <strong>{preview.length}</strong> students. First record: <strong>{preview[0].name}</strong> (Class {preview[0].classId})
                </p>
            </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors mr-3"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploading}
                className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {uploading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Importing...
                    </>
                ) : (
                    <>
                        Import Students
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
}
