import axios from '../api/axios';
import toast from 'react-hot-toast';

export const exportToCSV = async (type) => {
  try {
    let url = '';
    let filename = '';
    
    switch(type) {
      case 'activities':
        url = '/export/activities/csv';
        filename = 'activities.csv';
        break;
      case 'beneficiaries':
        url = '/export/beneficiaries/csv';
        filename = 'beneficiaries.csv';
        break;
      case 'donations':
        url = '/export/donations/csv';
        filename = 'donations.csv';
        break;
      default:
        throw new Error('Invalid export type');
    }
    
    const response = await axios.get(url, {
      responseType: 'blob', // Important for file download
    });
    
    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    toast.success(`${type} exported successfully!`);
  } catch (error) {
    console.error('Export error:', error);
    toast.error(`Failed to export ${type}`);
    throw error;
  }
};

export const downloadPDF = async () => {
  try {
    const response = await axios.get('/export/report/pdf', {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { type: 'text/html' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'ngo-impact-report.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    toast.success('Report downloaded successfully!');
  } catch (error) {
    console.error('PDF download error:', error);
    toast.error('Failed to download report');
  }
};

// Client-side CSV generation (fallback if backend is down)
export const generateClientCSV = (data, type) => {
  try {
    let headers = [];
    let rows = [];
    
    switch(type) {
      case 'activities':
        headers = ['Name', 'Category', 'Location', 'Date', 'Beneficiaries', 'Budget'];
        rows = data.map(a => [
          a.name,
          a.category,
          a.location,
          new Date(a.date).toLocaleDateString(),
          a.beneficiaries_count,
          a.budget
        ]);
        break;
      case 'beneficiaries':
        headers = ['Name', 'Age', 'Gender', 'Location', 'Category', 'Enrollment Date', 'Status'];
        rows = data.map(b => [
          b.name,
          b.age,
          b.gender,
          b.location,
          b.category,
          new Date(b.enrollment_date).toLocaleDateString(),
          b.status
        ]);
        break;
      case 'donations':
        headers = ['Donor Name', 'Amount', 'Date', 'Category', 'Payment Method'];
        rows = data.map(d => [
          d.donor_name,
          d.amount,
          new Date(d.date).toLocaleDateString(),
          d.category,
          d.payment_method
        ]);
        break;
    }
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Client-side CSV generation error:', error);
    return false;
  }
};