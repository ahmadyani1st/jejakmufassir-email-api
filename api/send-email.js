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
  if (apiKey !== 'your-secure-key-123') { // Ganti dengan API key yang aman
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Received request body:', req.body);

    // Data Validation - check for required fields
    const requiredFields = ['invoiceNumber', 'fullName', 'productName', 'totalPayment'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing fields:', missingFields);
      return res.status(400).json({
        error: 'Data tidak lengkap',
        missingFields
      });
    }

    // Email Transporter Configuration
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('Email transporter verified successfully');
    } catch (verifyError) {
      console.error('Email transporter verification failed:', verifyError);
      throw new Error('Email configuration error');
    }

    // Format currency for display
    const formatCurrency = (amount) => {
      const numAmount = parseInt(amount) || 0;
      return `Rp${numAmount.toLocaleString('id-ID')}`;
    };

    // Format date for display
    const formatDate = (timestamp) => {
      if (!timestamp) return new Date().toLocaleString('id-ID');
      return timestamp;
    };

    // Build comprehensive email content
    const emailSubject = `[PESANAN BARU] ${req.body.invoiceNumber} - ${req.body.fullName}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin: 0; font-size: 28px;">🛒 PESANAN BARU</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 16px;">Jejak Mufassir Store</p>
          </div>

          <!-- Invoice Info -->
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #2e7d32; margin: 0 0 10px 0; font-size: 20px;">📋 Informasi Pesanan</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333; width: 40%;">No. Invoice:</td>
                <td style="padding: 8px 0; color: #333; font-family: monospace; background-color: #fff; padding: 5px 10px; border-radius: 4px;">${req.body.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Waktu:</td>
                <td style="padding: 8px 0; color: #333;">${formatDate(req.body.timestamp)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Status:</td>
                <td style="padding: 8px 0;">
                  <span style="background-color: ${req.body.status === 'Sudah dibayar' ? '#4CAF50' : '#ff9800'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    ${req.body.status || 'Belum dibayar'}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Customer Info -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2e7d32; margin-bottom: 15px; font-size: 18px;">👤 Data Pembeli</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #fafafa; border-radius: 8px; overflow: hidden;">
              <tr style="background-color: #f0f0f0;">
                <td style="padding: 12px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">Nama Lengkap:</td>
                <td style="padding: 12px; color: #333; border-bottom: 1px solid #ddd;">${req.body.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">Email:</td>
                <td style="padding: 12px; color: #333; border-bottom: 1px solid #ddd;">${req.body.email || '-'}</td>
              </tr>
              <tr style="background-color: #f0f0f0;">
                <td style="padding: 12px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">No. Telepon:</td>
                <td style="padding: 12px; color: #333; border-bottom: 1px solid #ddd;">${req.body.phoneNumber || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">Alamat:</td>
                <td style="padding: 12px; color: #333; border-bottom: 1px solid #ddd;">${req.body.address || '-'}</td>
              </tr>
              <tr style="background-color: #f0f0f0;">
                <td style="padding: 12px; font-weight: bold; color: #333;">Kota:</td>
                <td style="padding: 12px; color: #333;">${req.body.city || '-'}</td>
              </tr>
            </table>
          </div>

          <!-- Product Info -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2e7d32; margin-bottom: 15px; font-size: 18px;">📦 Detail Produk</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #fafafa; border-radius: 8px; overflow: hidden;">
              <tr style="background-color: #f0f0f0;">
                <td style="padding: 12px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">Nama Produk:</td>
                <td style="padding: 12px; color: #333; border-bottom: 1px solid #ddd; font-weight: bold;">${req.body.productName}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">SKU:</td>
                <td style="padding: 12px; color: #333; border-bottom: 1px solid #ddd; font-family: monospace;">${req.body.sku || '-'}</td>
              </tr>
              <tr style="background-color: #f0f0f0;">
                <td style="padding: 12px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">Jenis:</td>
                <td style="padding: 12px; color: #333; border-bottom: 1px solid #ddd;">
                  <span style="background-color: ${req.body.jenisProduk === 'digital' ? '#2196F3' : '#FF5722'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                    ${req.body.jenisProduk || '-'}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">Kuantitas:</td>
                <td style="padding: 12px; color: #333; border-bottom: 1px solid #ddd;">${req.body.quantity || '1'} pcs</td>
              </tr>
              <tr style="background-color: #f0f0f0;">
                <td style="padding: 12px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">Harga Satuan:</td>
                <td style="padding: 12px; color: #333; border-bottom: 1px solid #ddd;">${formatCurrency(req.body.productPrice)}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; color: #333;">Berat:</td>
                <td style="padding: 12px; color: #333;">${req.body.berat || '-'} gram</td>
              </tr>
            </table>
          </div>

          <!-- Shipping & Payment Info -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2e7d32; margin-bottom: 15px; font-size: 18px;">🚚 Pengiriman & Pembayaran</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #fafafa; border-radius: 8px; overflow: hidden;">
              <tr style="background-color: #f0f0f0;">
                <td style="padding: 12px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">Kurir:</td>
                <td style="padding: 12px; color: #333; border-bottom: 1px solid #ddd;">${req.body.kurir || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">Metode Pembayaran:</td>
                <td style="padding: 12px; color: #333; border-bottom: 1px solid #ddd;">${req.body.paymentMethod || '-'}</td>
              </tr>
              <tr style="background-color: #f0f0f0;">
                <td style="padding: 12px; font-weight: bold; color: #333;">Voucher:</td>
                <td style="padding: 12px; color: #333;">${req.body.voucher && req.body.voucher !== 'Pilih Voucher' ? req.body.voucher : 'Tidak ada'}</td>
              </tr>
            </table>
          </div>

          ${req.body.catatan ? `
          <!-- Notes -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2e7d32; margin-bottom: 15px; font-size: 18px;">📝 Catatan Pembeli</h3>
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; color: #856404;">
              <p style="margin: 0; font-style: italic;">"${req.body.catatan}"</p>
            </div>
          </div>
          ` : ''}

          ${req.body.namaDropshipper ? `
          <!-- Dropshipper Info -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2e7d32; margin-bottom: 15px; font-size: 18px;">📋 Info Dropshipper</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #e3f2fd; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="padding: 12px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">Nama Pengirim:</td>
                <td style="padding: 12px; color: #333; border-bottom: 1px solid #ddd;">${req.body.namaDropshipper}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; color: #333;">No. Telepon:</td>
                <td style="padding: 12px; color: #333;">${req.body.nomorDropshipper || '-'}</td>
              </tr>
            </table>
          </div>
          ` : ''}

          <!-- Total Payment -->
          <div style="background-color: #4CAF50; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">💰 TOTAL PEMBAYARAN</h2>
            <div style="font-size: 32px; font-weight: bold; margin: 0;">${formatCurrency(req.body.totalPayment)}</div>
          </div>

          <!-- Additional Info -->
          ${req.body.affId ? `
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f0f8ff; border-radius: 8px; border-left: 4px solid #2196F3;">
            <h4 style="margin: 0 0 10px 0; color: #1976D2;">🎯 Info Affiliate</h4>
            <p style="margin: 0; color: #333;"><strong>Affiliate ID:</strong> ${req.body.affId}</p>
            ${req.body.komisi ? `<p style="margin: 5px 0 0 0; color: #333;"><strong>Komisi:</strong> ${formatCurrency(req.body.komisi)}</p>` : ''}
          </div>
          ` : ''}

          <!-- Action Buttons -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin-bottom: 20px; font-size: 14px;">
              Silakan login ke dashboard admin untuk memproses pesanan ini
            </p>
            <a href="https://www.jejakmufassir.my.id/admin" 
               style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin-right: 10px;">
              🔗 Buka Dashboard Admin
            </a>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">Email ini dikirim otomatis oleh sistem Jejak Mufassir</p>
            <p style="margin: 5px 0 0 0;">© 2024 Jejak Mufassir. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    // Email Options
    const mailOptions = {
      from: {
        name: 'Jejak Mufassir Store',
        address: process.env.EMAIL_USER
      },
      to: 'admin@jejakmufassir.my.id',
      cc: process.env.EMAIL_CC, // Optional: add CC if needed
      subject: emailSubject,
      html: emailHtml,
      // Add text version for better compatibility
      text: `
        PESANAN BARU - ${req.body.invoiceNumber}
        
        Informasi Pesanan:
        - No. Invoice: ${req.body.invoiceNumber}
        - Waktu: ${formatDate(req.body.timestamp)}
        - Status: ${req.body.status || 'Belum dibayar'}
        
        Data Pembeli:
        - Nama: ${req.body.fullName}
        - Email: ${req.body.email || '-'}
        - Telepon: ${req.body.phoneNumber || '-'}
        - Alamat: ${req.body.address || '-'}
        - Kota: ${req.body.city || '-'}
        
        Detail Produk:
        - Nama: ${req.body.productName}
        - SKU: ${req.body.sku || '-'}
        - Jenis: ${req.body.jenisProduk || '-'}
        - Kuantitas: ${req.body.quantity || '1'}
        - Harga: ${formatCurrency(req.body.productPrice)}
        - Berat: ${req.body.berat || '-'} gram
        
        Pengiriman & Pembayaran:
        - Kurir: ${req.body.kurir || '-'}
        - Metode Pembayaran: ${req.body.paymentMethod || '-'}
        - Voucher: ${req.body.voucher && req.body.voucher !== 'Pilih Voucher' ? req.body.voucher : 'Tidak ada'}
        
        TOTAL PEMBAYARAN: ${formatCurrency(req.body.totalPayment)}
        
        ${req.body.catatan ? `Catatan: ${req.body.catatan}` : ''}
        ${req.body.namaDropshipper ? `\nDropshipper: ${req.body.namaDropshipper} (${req.body.nomorDropshipper || '-'})` : ''}
        ${req.body.affId ? `\nAffiliate ID: ${req.body.affId}` : ''}
      `
    };

    // Send Email
    console.log('Attempting to send email...');
    const emailResult = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', emailResult.messageId);
    
    return res.status(200).json({ 
      success: true, 
      messageId: emailResult.messageId,
      message: 'Email notification sent successfully'
    });
    
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
    
    return res.status(500).json({
      success: false,
      error: 'Gagal mengirim email',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
}
