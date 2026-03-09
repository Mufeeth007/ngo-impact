const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Export activities as CSV
router.get('/activities/csv', auth, async (req, res) => {
  try {
    const activities = await db.all('SELECT * FROM activities ORDER BY date DESC');
    
    // Create CSV header
    const headers = ['ID', 'Name', 'Category', 'Location', 'Date', 'Beneficiaries', 'Budget', 'Description'];
    const csvRows = [headers.join(',')];
    
    // Add data rows
    activities.forEach(activity => {
      const row = [
        activity.id,
        `"${activity.name}"`, // Wrap in quotes to handle commas in text
        `"${activity.category}"`,
        `"${activity.location}"`,
        activity.date,
        activity.beneficiaries_count,
        activity.budget,
        `"${activity.description || ''}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csv = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=activities.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export activities' });
  }
});

// Export beneficiaries as CSV
router.get('/beneficiaries/csv', auth, async (req, res) => {
  try {
    const beneficiaries = await db.all('SELECT * FROM beneficiaries ORDER BY enrollment_date DESC');
    
    const headers = ['ID', 'Name', 'Age', 'Gender', 'Location', 'Category', 'Enrollment Date', 'Status'];
    const csvRows = [headers.join(',')];
    
    beneficiaries.forEach(b => {
      const row = [
        b.id,
        `"${b.name}"`,
        b.age,
        b.gender,
        `"${b.location}"`,
        `"${b.category}"`,
        b.enrollment_date,
        b.status
      ];
      csvRows.push(row.join(','));
    });
    
    const csv = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=beneficiaries.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export beneficiaries' });
  }
});

// Export donations as CSV
router.get('/donations/csv', auth, async (req, res) => {
  try {
    const donations = await db.all('SELECT * FROM donations ORDER BY date DESC');
    
    const headers = ['ID', 'Donor Name', 'Amount', 'Date', 'Category', 'Payment Method'];
    const csvRows = [headers.join(',')];
    
    donations.forEach(d => {
      const row = [
        d.id,
        `"${d.donor_name}"`,
        d.amount,
        d.date,
        `"${d.category}"`,
        d.payment_method
      ];
      csvRows.push(row.join(','));
    });
    
    const csv = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=donations.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export donations' });
  }
});

// Generate PDF Report (using simple HTML to PDF conversion)
router.get('/report/pdf', auth, async (req, res) => {
  try {
    // Fetch all data
    const activities = await db.all('SELECT * FROM activities ORDER BY date DESC LIMIT 10');
    const beneficiaries = await db.all('SELECT COUNT(*) as total FROM beneficiaries');
    const donations = await db.all('SELECT SUM(amount) as total FROM donations');
    
    // Create HTML report
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>NGO Impact Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #14b8a6; }
          .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
          .stat-card { background: #f0fdfa; padding: 20px; border-radius: 10px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #14b8a6; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #14b8a6; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <h1>NGO Impact Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        
        <div class="stats">
          <div class="stat-card">
            <h3>Total Beneficiaries</h3>
            <div class="stat-value">${beneficiaries[0]?.total || 0}</div>
          </div>
          <div class="stat-card">
            <h3>Total Donations</h3>
            <div class="stat-value">₹${donations[0]?.total || 0}</div>
          </div>
          <div class="stat-card">
            <h3>Active Activities</h3>
            <div class="stat-value">${activities.length}</div>
          </div>
        </div>
        
        <h2>Recent Activities</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Location</th>
              <th>Date</th>
              <th>Beneficiaries</th>
            </tr>
          </thead>
          <tbody>
            ${activities.map(a => `
              <tr>
                <td>${a.name}</td>
                <td>${a.category}</td>
                <td>${a.location}</td>
                <td>${a.date}</td>
                <td>${a.beneficiaries_count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'attachment; filename=report.html');
    res.status(200).send(html);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

module.exports = router;