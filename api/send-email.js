import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verifikasi API Key
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const orderData = req.body;

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Format isi email (HTML)
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2d3748;">🛒 Order Baru #${orderData.invoiceNumber}</h2>
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #4a5568; margin-top: 0;">Detail Pelanggan</h3>
          <p><strong>Nama:</strong> ${orderData.fullName}</p>
          <p><strong>No. HP:</strong> ${orderData.phoneNumber}</p>
          <p><strong>Alamat:</strong> ${orderData.address}, ${orderData.city}</p>
        </div>
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px;">
          <h3 style="color: #4a5568; margin-top: 0;">Detail Order</h3>
          <p><strong>Produk:</strong> ${orderData.productName}</p>
          <p><strong>Harga:</strong> Rp${parseInt(orderData.productPrice).toLocaleString('id-ID')}</p>
          <p><strong>Total:</strong> Rp${parseInt(orderData.totalPayment).toLocaleString('id-ID')}</p>
          <p><strong>Metode Bayar:</strong> ${orderData.paymentMethod}</p>
        </div>
        <p style="font-size: 12px; color: #718096; margin-top: 20px;">
          ⏰ ${orderData.timestamp}
        </p>
      </div>
    `;

    // Kirim email
    await transporter.sendMail({
      from: `"Jejak Mufassir" <${process.env.EMAIL_USER}>`,
      to: 'admin@jejakmufassir.my.id',
      subject: `[ORDER] ${orderData.invoiceNumber} - ${orderData.productName}`,
      html: emailHtml,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    res.status(500).json({ error: "Gagal mengirim notifikasi email" });
  }
}
