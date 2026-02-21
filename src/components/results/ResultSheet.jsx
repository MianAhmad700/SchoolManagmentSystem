import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FileText, Printer, Download, FileSpreadsheet } from 'lucide-react';
import { getStudentsByClass } from '../../services/students';
import { getClassExamResults, getExams } from '../../services/results';
import { getAllClasses } from '../../services/classes';
import { exportResultsToExcel } from '../../utils/excelGenerator';

export default function ResultSheet() {
  const { register, watch } = useForm();
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);

  const selectedClass = watch("classId");
  const selectedExam = watch("examName");

  useEffect(() => {
    loadExams();
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const classesData = await getAllClasses();
      setClasses(classesData);
    } catch (error) {
      console.error("Failed to load classes", error);
      toast.error("Failed to load classes");
    }
  };

  const loadExams = async () => {
    try {
        const data = await getExams();
        setExams(data);
    } catch (error) {
        console.error("Failed to load exams", error);
        toast.error(`Failed to load exams: ${error.message}`);
    }
  };

  const generateSheet = async () => {
    if (!selectedClass || !selectedExam) return;
    
    setLoading(true);
    setGenerated(false);
    try {
      // 1. Fetch Students
      const studentsData = await getStudentsByClass(selectedClass);
      studentsData.sort((a, b) => a.rollNo - b.rollNo); // Sort by roll no
      
      // 2. Fetch Results
      const resultsData = await getClassExamResults(selectedExam, selectedClass);
      
      // 3. Process Data
      // Extract all unique subjects
      const uniqueSubjects = [...new Set(resultsData.map(r => r.subject))];
      setSubjects(uniqueSubjects);
      
      // Map results for easy lookup: studentId -> { subject: marks }
      const resultMap = {};
      resultsData.forEach(doc => {
        const subject = doc.subject;
        const records = doc.records || {};
        Object.keys(records).forEach(studentId => {
            if (!resultMap[studentId]) resultMap[studentId] = {};
            resultMap[studentId][subject] = records[studentId];
        });
      });

      setStudents(studentsData);
      setResults(resultMap);
      setGenerated(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate result sheet");
    } finally {
      setLoading(false);
    }
  };

  // Filter exams based on selected class (if a class is selected)
  const availableExams = selectedClass 
    ? exams.filter(e => e.classes && e.classes.includes(selectedClass))
    : exams;


  const calculateTotal = (studentId) => {
    if (!results[studentId]) return 0;
    return Object.values(results[studentId]).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  };
  
  const calculatePercentage = (studentId) => {
      // Assuming 100 marks per subject for simplicity, or we should fetch maxMarks from resultsData
      // For now, let's just sum obtained / (subjects.length * 100) * 100
      if (subjects.length === 0) return 0;
      const total = calculateTotal(studentId);
      const maxTotal = subjects.length * 100; // Simplified assumption
      return ((total / maxTotal) * 100).toFixed(2);
  };

  const getGrade = (percentage) => {
      const p = Number(percentage);
      if (p >= 80) return 'A+';
      if (p >= 70) return 'A';
      if (p >= 60) return 'B';
      if (p >= 50) return 'C';
      if (p >= 40) return 'D';
      return 'F';
  };

  const handleExport = () => {
    if (!generated || students.length === 0) return;
  
    const dataToExport = students.map(student => {
      const row = {
        'Roll No': student.rollNo,
        'Name': student.name,
      };
  
      subjects.forEach(sub => {
        row[sub] = results[student.id]?.[sub] || '-';
      });
  
      row['Total'] = calculateTotal(student.id);
      row['Percentage'] = calculatePercentage(student.id) + '%';
      row['Grade'] = getGrade(calculatePercentage(student.id));
  
      return row;
    });
  
    exportResultsToExcel(dataToExport, `ResultSheet_${selectedExam}_Class_${selectedClass}`);
    toast.success("Excel exported successfully");
  };

  const handleStudentPdf = (student) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text("Riphah Public School", 105, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.text(`Result Card: ${selectedExam}`, 105, 30, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Class: ${selectedClass}`, 105, 38, { align: "center" });

    // Student Info
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);
    
    doc.setFontSize(12);
    doc.text(`Name: ${student.name}`, 20, 55);
    doc.text(`Roll No: ${student.rollNo}`, 140, 55);
    doc.text(`Father Name: ${student.fatherName || '-'}`, 20, 65); 
    
    doc.line(20, 70, 190, 70);

    // Marks Table
    const tableData = subjects.map(sub => {
        const obtained = results[student.id]?.[sub] || '-';
        // Assuming 100 max marks per subject as per current assumption in calculatePercentage
        const max = 100; 
        const grade = obtained !== '-' ? getGrade((Number(obtained)/max)*100) : '-';
        return [sub, max, obtained, grade]; 
    });

    autoTable(doc, {
        startY: 80,
        head: [['Subject', 'Max Marks', 'Obtained Marks', 'Grade']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [66, 133, 244] }, // Blue header
    });

    // Summary
    const finalY = doc.lastAutoTable.finalY + 10;
    const totalObtained = calculateTotal(student.id);
    const totalMax = subjects.length * 100;
    const percentage = calculatePercentage(student.id);
    const grade = getGrade(percentage);

    doc.setFontSize(12);
    doc.text(`Total Marks: ${totalMax}`, 20, finalY);
    doc.text(`Obtained Marks: ${totalObtained}`, 20, finalY + 10);
    doc.text(`Percentage: ${percentage}%`, 140, finalY);
    doc.text(`Grade: ${grade}`, 140, finalY + 10);

    // Footer
    doc.line(20, finalY + 40, 60, finalY + 40);
    doc.text("Principal Signature", 20, finalY + 45);

    doc.line(140, finalY + 40, 180, finalY + 40);
    doc.text("Class Teacher", 140, finalY + 45);

    doc.save(`${student.name}_${selectedExam}_Result.pdf`);
  };

  const handleStudentExcel = (student) => {
    const wb = XLSX.utils.book_new();
    
    const wsData = [
        ["Riphah Public School"],
        [`Result Card: ${selectedExam} - Class ${selectedClass}`],
        [],
        ["Student Name:", student.name, "Roll No:", student.rollNo],
        ["Father Name:", student.fatherName || '-'],
        [],
        ["Subject", "Max Marks", "Obtained Marks", "Grade"],
    ];

    subjects.forEach(sub => {
        const obtained = results[student.id]?.[sub] || '-';
        const max = 100;
        const grade = obtained !== '-' ? getGrade((Number(obtained)/max)*100) : '-';
        wsData.push([sub, max, obtained, grade]);
    });

    wsData.push([]);
    wsData.push(["Total", subjects.length * 100, calculateTotal(student.id)]);
    wsData.push(["Percentage", calculatePercentage(student.id) + "%"]);
    wsData.push(["Grade", getGrade(calculatePercentage(student.id))]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Merging Title Cells
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // School Name
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }, // Exam Name
    ];

    // Set column widths
    ws['!cols'] = [
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 10 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Result Card");
    XLSX.writeFile(wb, `${student.name}_${selectedExam}.xlsx`);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Result Tabulation Sheet</h3>
        {generated && (
          <div className="flex space-x-2">
             <button 
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
             >
                 <Download className="h-4 w-4 mr-2" />
                 Export Excel
             </button>
             <button 
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
             >
                 <Printer className="h-4 w-4 mr-2" />
                 Print
             </button>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-end bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                <select
                    {...register("classId")}
                    className="block w-full sm:w-48 pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                >
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.name}>{c.label}</option>)}
                </select>
            </div>
            <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Name</label>
                <select
                    {...register("examName")}
                    className="block w-full sm:w-48 pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all disabled:bg-slate-100 disabled:text-slate-400"
                    disabled={!selectedClass}
                >
                    <option value="">Select Exam</option>
                    {availableExams.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                </select>
                {!selectedClass && <p className="text-xs text-slate-500 mt-1">Select class first</p>}
            </div>
            <button
                onClick={generateSheet}
                disabled={loading || !selectedClass || !selectedExam}
                className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
                {loading ? 'Generating...' : (
                    <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Sheet
                    </>
                )}
            </button>
        </div>

        {/* Results Table */}
        {generated && (
            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                <div className="text-center mb-6 hidden print:block">
                    <h2 className="text-2xl font-bold">Riphah Public School</h2>
                    <h3 className="text-xl">Result Sheet - {selectedExam} ({selectedClass})</h3>
                </div>

                {students.length === 0 ? (
                     <div className="text-center py-12 text-slate-500">
                        <FileText className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                        <p className="text-lg font-medium">No students found for this class.</p>
                     </div>
                ) : (
                    <table className="min-w-full divide-y divide-slate-200 border-collapse">
                        <thead className="bg-blue-600">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">Roll No</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">Name</th>
                                {subjects.map(sub => (
                                    <th key={sub} className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">
                                        {sub}
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider bg-blue-700 border-r border-blue-600">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider bg-blue-700 border-r border-blue-600">%</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider bg-blue-700 border-r border-blue-600">Grade</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider print:hidden">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {students.map((student, index) => {
                                const total = calculateTotal(student.id);
                                const percentage = calculatePercentage(student.id);
                                const grade = getGrade(percentage);

                                return (
                                    <tr key={student.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                        <td className="px-4 py-3 text-sm text-slate-700 font-medium border-r border-slate-200">{student.rollNo}</td>
                                        <td className="px-4 py-3 text-sm text-slate-900 font-medium border-r border-slate-200">{student.name}</td>
                                        {subjects.map(sub => (
                                            <td key={sub} className="px-4 py-3 text-sm text-center text-slate-600 border-r border-slate-200">
                                                {results[student.id]?.[sub] || '-'}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3 text-sm text-center font-bold text-blue-700 bg-blue-50 border-r border-slate-200">{total}</td>
                                        <td className="px-4 py-3 text-sm text-center font-bold text-blue-700 bg-blue-50 border-r border-slate-200">{percentage}%</td>
                                        <td className={`px-4 py-3 text-sm text-center font-bold border-r border-slate-200 bg-blue-50 ${
                                            grade === 'F' ? 'text-red-600' : 'text-green-600'
                                        }`}>{grade}</td>
                                        <td className="px-4 py-3 text-center print:hidden">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleStudentPdf(student)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                    title="Print PDF"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleStudentExcel(student)}
                                                    className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                    title="Export Excel"
                                                >
                                                    <FileSpreadsheet className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
