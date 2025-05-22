// api/send-email.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { orderData } = req.body;

        // Create transporter
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'admin@jejakmufassir.my.id',
            subject: 'Pemberitahuan Pesanan',
            html: `
                <h2>🛒 Pesanan Baru Masuk!</h2>
                <p><strong>Pesan:</strong> Kamu memiliki pesanan baru</p>
                
                <h3>📋 Detail Pesanan:</h3>
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <tr><td><strong>Invoice</strong></td><td>${orderData.invoiceNumber}</td></tr>
                    <tr><td><strong>Nama Pembeli</strong></td><td>${orderData.fullName}</td></tr>
                    <tr><td><strong>Email</strong></td><td>${orderData.email}</td></tr>
                    <tr><td><strong>Telefon</strong></td><td>${orderData.phoneNumber}</td></tr>
                    <tr><td><strong>Alamat</strong></td><td>${orderData.address}, ${orderData.city}</td></tr>
                    <tr><td><strong>Produk</strong></td><td>${orderData.productName}</td></tr>
                    <tr><td><strong>Jumlah</strong></td><td>${orderData.quantity}</td></tr>
                    <tr><td><strong>Total</strong></td><td>Rp ${parseInt(orderData.totalPayment).toLocaleString('id-ID')}</td></tr>
                    <tr><td><strong>Pembayaran</strong></td><td>${orderData.paymentMethod}</td></tr>
                    <tr><td><strong>Status</strong></td><td>${orderData.status}</td></tr>
                    <tr><td><strong>Kurir</strong></td><td>${orderData.kurir}</td></tr>
                    <tr><td><strong>Waktu</strong></td><td>${orderData.timestamp}</td></tr>
                    <tr><td><strong>Catatan</strong></td><td>${orderData.catatan || 'Tidak ada catatan'}</td></tr>
                </table>
                
                <br>
                <p>Segera proses pesanan ini! 🚀</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            success: true, 
            message: 'Email sent successfully' 
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send email',
            error: error.message 
        });
    }
}
