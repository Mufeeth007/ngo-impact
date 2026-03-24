import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFileDownload, FaChartLine } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const ReportGenerator = () => {
  const [reportType, setReportType] = useState('monthly');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    let cleanNum = num;
    if (typeof num === 'string') {
      cleanNum = parseFloat(num.replace(/[^0-9.-]/g, ''));
    }
    const number = Number(cleanNum);
    return isNaN(number) ? '0' : number.toLocaleString('en-IN');
  };

  // FIX 1: Updated to avoid PDF encoding errors and spacing issues
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0';
    
    let cleanAmount = amount;
    if (typeof amount === 'string') {
      cleanAmount = parseFloat(amount.replace(/[^0-9.-]/g, ''));
    }
    
    const number = Number(cleanAmount);
    if (isNaN(number)) return 'Rs. 0';

    // 1. We use 'Rs.' instead of '₹' because standard PDF fonts don't support the Rupee symbol (causes '¹')
    // 2. We .replace(/\u00A0/g, ' ') to fix the "0 3 , 0 5" wide spacing caused by non-breaking spaces
    return `Rs. ${number.toLocaleString('en-IN')}`.replace(/\u00A0/g, ' ');
  };

  const generatePDF = (data, type) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const ngoName = user?.username || 'NGO Impact Analytics';
      const currentDate = new Date().toLocaleString();

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header
      doc.setFillColor(20, 184, 166);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('NGO Impact Analytics', 105, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('Impact Report', 105, 32, { align: 'center' });
      
      // Organization info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`Organization: ${ngoName}`, 20, 50);
      const reportTitle = type === 'monthly' 
        ? `Report for ${months.find(m => m.value === month)?.label} ${year}`
        : `Annual Report for ${year}`;
      doc.text(reportTitle, 20, 58);
      doc.text(`Generated on: ${currentDate}`, 20, 66);
      
      doc.line(20, 72, 190, 72);
      let yPos = 80;

      // FIX 2: Explicitly cast all values to Number() before formatting to ensure accuracy
      let activitiesCount = 0, beneficiariesCount = 0, donationsCount = 0, fundsAmount = 0;
      
      if (type === 'monthly') {
        activitiesCount = Number(data.activities) || 0;
        beneficiariesCount = Number(data.beneficiaries) || 0;
        donationsCount = Number(data.donations) || 0;
        fundsAmount = Number(data.funds) || 0;
      } else {
        activitiesCount = Number(data.totals?.activities) || 0;
        beneficiariesCount = Number(data.totals?.beneficiaries) || 0;
        donationsCount = Number(data.totals?.donations) || 0;
        fundsAmount = Number(data.totals?.funds) || 0;
      }
      
      const statsData = [
        ['Total Activities', formatNumber(activitiesCount)],
        ['Total Beneficiaries', formatNumber(beneficiariesCount)],
        ['Total Donations', formatNumber(donationsCount)],
        ['Total Funds', formatCurrency(fundsAmount)]
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillColor: [20, 184, 166] },
        margin: { left: 20, right: 20 }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Yearly Breakdown
      if (type === 'yearly' && data.monthlyBreakdown?.length > 0) {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text('Monthly Breakdown', 20, yPos);
        
        const monthlyData = data.monthlyBreakdown.map(item => [
          months.find(m => m.value === parseInt(item.month))?.label || item.month,
          formatNumber(item.activities),
          formatNumber(item.beneficiaries),
          formatCurrency(item.funds)
        ]);

        autoTable(doc, {
          startY: yPos + 5,
          head: [['Month', 'Activities', 'Beneficiaries', 'Funds']],
          body: monthlyData,
          headStyles: { fillColor: [20, 184, 166] }
        });
        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Monthly Activities List
      if (type === 'monthly' && data.activitiesList?.length > 0) {
        if (yPos > 200) { doc.addPage(); yPos = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text('Activities Details', 20, yPos);
        
        const activitiesTable = data.activitiesList.map(activity => [
          activity.name || 'N/A',
          activity.category || 'N/A',
          new Date(activity.date).toLocaleDateString(),
          formatNumber(activity.beneficiaries_count),
          formatCurrency(activity.budget)
        ]);

        autoTable(doc, {
          startY: yPos + 5,
          head: [['Activity', 'Category', 'Date', 'Beneficiaries', 'Budget']],
          body: activitiesTable,
          headStyles: { fillColor: [20, 184, 166] }
        });
        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Summary Insights
      const avgDonation = donationsCount > 0 ? (fundsAmount / donationsCount) : 0;
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Insights', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const insights = [
        `• Total beneficiaries served: ${formatNumber(beneficiariesCount)}`,
        `• Average donation amount: ${formatCurrency(avgDonation)}`,
        `• Total funds utilized: ${formatCurrency(fundsAmount)}`
      ];
      insights.forEach((text, i) => doc.text(text, 25, yPos + 8 + (i * 6)));

      // Save PDF
      const filename = type === 'monthly' 
        ? `NGO_Report_${months.find(m => m.value === month)?.label}_${year}.pdf`
        : `NGO_Annual_Report_${year}.pdf`;
      doc.save(filename);
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = reportType === 'monthly' 
        ? await axios.get(`/reports/monthly?month=${month}&year=${year}`)
        : await axios.get(`/reports/yearly?year=${year}`);

      if (response.data.success) {
        generatePDF(response.data.data, reportType);
        toast.success('Report generated successfully!');
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-4">
        <FaChartLine className="text-primary-500 text-xl" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Generate Reports</h3>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <button onClick={() => setReportType('monthly')} className={`flex-1 py-2 rounded-lg ${reportType === 'monthly' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>Monthly</button>
          <button onClick={() => setReportType('yearly')} className={`flex-1 py-2 rounded-lg ${reportType === 'yearly' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>Yearly</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {reportType === 'monthly' && (
            <div>
              <label className="block text-sm mb-1">Month</label>
              <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800">
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">Year</label>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <button onClick={generateReport} disabled={loading} className="w-full bg-primary-500 text-white py-2 rounded-lg flex items-center justify-center space-x-2">
          {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><FaFileDownload /><span>Download PDF Report</span></>}
        </button>
      </div>
    </motion.div>
  );
};

export default ReportGenerator;