const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendVerificationEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '✅ Verify Your WallHUB Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin:0;padding:0;background-color:#0f0f1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;overflow:hidden;border:1px solid #2a2a4a;">
                <tr>
                  <td style="background:linear-gradient(135deg,#6c63ff,#a855f7);padding:40px;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:32px;letter-spacing:2px;">WALL<span style="color:#f0c040;">HUB</span></h1>
                    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">Premium Wallpaper Collection</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <h2 style="color:#fff;margin:0 0 16px;">Hey ${name}! 👋</h2>
                    <p style="color:#a0aec0;line-height:1.7;margin:0 0 24px;">
                      Welcome to WallHUB! You're just one click away from accessing thousands of stunning wallpapers.
                      Please verify your email address to activate your account.
                    </p>
                    <div style="text-align:center;margin:32px 0;">
                      <a href="${verifyUrl}" style="background:linear-gradient(135deg,#6c63ff,#a855f7);color:#fff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:600;display:inline-block;letter-spacing:0.5px;">
                        Verify My Email
                      </a>
                    </div>
                    <p style="color:#718096;font-size:13px;margin:0 0 8px;">
                      Or copy and paste this link in your browser:
                    </p>
                    <p style="color:#6c63ff;font-size:12px;word-break:break-all;background:#1a1a3e;padding:12px;border-radius:8px;margin:0 0 24px;">
                      ${verifyUrl}
                    </p>
                    <p style="color:#718096;font-size:13px;margin:0;">
                      This link will expire in <strong style="color:#a0aec0;">24 hours</strong>. If you didn't create an account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 40px;border-top:1px solid #2a2a4a;text-align:center;">
                    <p style="color:#4a5568;font-size:13px;margin:0;">© 2024 WallHUB. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🔐 Reset Your WallHUB Password',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background-color:#0f0f1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;overflow:hidden;border:1px solid #2a2a4a;">
                <tr>
                  <td style="background:linear-gradient(135deg,#6c63ff,#a855f7);padding:40px;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:32px;letter-spacing:2px;">WALL<span style="color:#f0c040;">HUB</span></h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <h2 style="color:#fff;margin:0 0 16px;">Password Reset Request</h2>
                    <p style="color:#a0aec0;line-height:1.7;margin:0 0 24px;">
                      Hi ${name}, we received a request to reset your WallHUB password. Click below to set a new password. This link expires in 1 hour.
                    </p>
                    <div style="text-align:center;margin:32px 0;">
                      <a href="${resetUrl}" style="background:linear-gradient(135deg,#6c63ff,#a855f7);color:#fff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:600;display:inline-block;">
                        Reset Password
                      </a>
                    </div>
                    <p style="color:#718096;font-size:13px;">If you didn't request this, please ignore this email. Your password won't change.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 40px;border-top:1px solid #2a2a4a;text-align:center;">
                    <p style="color:#4a5568;font-size:13px;margin:0;">© 2024 WallHUB. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
