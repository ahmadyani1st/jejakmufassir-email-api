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

  // API Key Verification (now using environment variable)
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Received request body:', req.body);

    // Data Validation
    const requiredFields = ['invoiceNumber', 'fullName', 'productName', 'totalPayment'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing fields:', missingFields);
      return res.status(400).json({
        error: 'Data tidak lengkap',
        missingFields
      });
    }

    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration not properly set in environment variables');
    }

    // Email configuration for Zoho Mail using environment variables
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, // From environment variable
        pass: process.env.EMAIL_PASS  // From environment variable
      },
      tls: {
        rejectUnauthorized: true // Additional security
      }
    });

    // Verify transporter
    console.log('Verifying email transporter...');
    await transporter.verify();
    console.log('Email transporter verified successfully');

    // Format functions
    const formatCurrency = (amount) => {
      const numAmount = parseInt(amount) || 0;
      return `Rp${numAmount.toLocaleString('id-ID')}`;
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return new Date().toLocaleString('id-ID');
      return timestamp;
    };

    // Email content
    const emailSubject = `[PESANAN BARU] ${req.body.invoiceNumber}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4CAF50;">🛒 Pesanan Baru</h1>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Detail Pesanan</h2>
          <p><strong>No. Invoice:</strong> ${req.body.invoiceNumber}</p>
          <p><strong>Nama Pembeli:</strong> ${req.body.fullName}</p>
          <p><strong>Email:</strong> ${req.body.email || '-'}</p>
          <p><strong>Telepon:</strong> ${req.body.phoneNumber || '-'}</p>
          <p><strong>Alamat:</strong> ${req.body.address || '-'}</p>
        </div>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Detail Produk</h2>
          <p><strong>Nama Produk:</strong> ${req.body.productName}</p>
          <p><strong>SKU:</strong> ${req.body.sku || '-'}</p>
          <p><strong>Kuantitas:</strong> ${req.body.quantity || '1'}</p>
          <p><strong>Harga:</strong> ${formatCurrency(req.body.productPrice)}</p>
        </div>
        
        <div style="background-color: #4CAF50; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h2>💰 TOTAL: ${formatCurrency(req.body.totalPayment)}</h2>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 8px;">
          <p><strong>Metode Pembayaran:</strong> ${req.body.paymentMethod || '-'}</p>
          <p><strong>Status:</strong> ${req.body.status || 'Belum dibayar'}</p>
          <p><strong>Waktu:</strong> ${formatDate(req.body.timestamp)}</p>
        </div>
        
        ${req.body.catatan ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-radius: 8px;">
          <h3>📝 Catatan Pembeli:</h3>
          <p style="font-style: italic;">"${req.body.catatan}"</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://www.jejakmufassir.my.id/" 
             style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            📊 Buka Dashboard
          </a>
        </div>
      </div>
    `;

    // Email options
    const mailOptions = {
      from: {
        name: 'Jejak Mufassir Store',
        address: process.env.EMAIL_USER // Using environment variable
      },
      to: 'ahmadyani.official@gmail.com',
      subject: emailSubject,
      html: emailHtml,
      text: `
        PESANAN BARU - ${req.body.invoiceNumber}
        
        Pembeli: ${req.body.fullName}
        Email: ${req.body.email || '-'}
        Telepon: ${req.body.phoneNumber || '-'}
        Alamat: ${req.body.address || '-'}
        
        Produk: ${req.body.productName}
        SKU: ${req.body.sku || '-'}
        Kuantitas: ${req.body.quantity || '1'}
        
        TOTAL: ${formatCurrency(req.body.totalPayment)}
        Pembayaran: ${req.body.paymentMethod || '-'}
        Status: ${req.body.status || 'Belum dibayar'}
        
        ${req.body.catatan ? `Catatan: ${req.body.catatan}` : ''}
      `,
      // Additional email headers for security
      headers: {
        'X-Mailer': 'Jejak Mufassir Notification System',
        'X-Priority': '1' // High priority
      }
    };

    // Send email
    console.log('Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return res.status(200).json({ 
      success: true, 
      messageId: result.messageId,
      message: 'Email notification sent successfully'
    });
    
  } catch (error) {
    console.error('Detailed error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Gagal mengirim email',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: error.code || 'UNKNOWN_ERROR',
      suggestion: 'Hubungi administrator sistem'
    });
  }
}
