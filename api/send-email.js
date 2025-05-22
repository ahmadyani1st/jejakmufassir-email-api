import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Origin', 'https://www.jejakmufassir.my.id');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // API Key Verification
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Data Validation
    const requiredFields = ['invoiceNumber', 'fullName', 'productName', 'totalPayment'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Data tidak lengkap',
        missingFields
      });
    }

    // Email Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email Content
    const mailOptions = {
      from: `"Jejak Mufassir" <${process.env.EMAIL_USER}>`,
      to: 'admin@jejakmufassir.my.id',
      subject: `[ORDER] ${req.body.invoiceNumber}`,
      html: `
        <h2>Order Baru</h2>
        <p><strong>No. Invoice:</strong> ${req.body.invoiceNumber}</p>
        <p><strong>Nama:</strong> ${req.body.fullName}</p>
        <p><strong>Produk:</strong> ${req.body.productName}</p>
        <p><strong>Total:</strong> Rp${parseInt(req.body.totalPayment).toLocaleString('id-ID')}</p>
      `
    };

    // Send Email
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    });
    
    return res.status(500).json({
      error: 'Gagal mengirim email',
      details: error.message
    });
  }
}
