const { Resend } = require('resend');
const { env } = require('../config/env');

const resend = new Resend(env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, htmlContent }) => {
  await resend.emails.send({
    from: `${env.RESEND_SENDER_NAME} <${env.RESEND_SENDER_EMAIL}>`,
    to: [to],
    subject,
    html: htmlContent
  });
};

const sendWithdrawalEmail = async (to, userName, amountCents, balanceCents, beneficiary) => {
  const amount = (amountCents / 100).toFixed(2);
  const balance = (balanceCents / 100).toFixed(2);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            max-width: 180px;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #333;
          }
          .message {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
          }
          .details-card {
            background: #fef9ef;
            border-left: 4px solid #dc2626;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e5e5;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #666;
          }
          .detail-value {
            color: #333;
            font-weight: 500;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #dc2626;
          }
          .balance {
            font-size: 18px;
            font-weight: 600;
            color: #059669;
          }
          .footer {
            background: #f9f9f9;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #999;
            border-top: 1px solid #e5e5e5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dxakrcgcz/image/upload/v1770271290/Bank-of-America_gc3ium.jpg" alt="Logo" class="logo" />
          </div>
          
          <div class="content">
            <p class="greeting">Hi ${userName},</p>
            
            <p class="message">
              Your withdrawal has been processed successfully. The funds will be transferred to the beneficiary account shortly.
            </p>
            
            <div class="details-card">
              <div class="detail-row">
                <span class="detail-label">Amount Withdrawn</span>
                <span class="detail-value amount">$${amount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">New Balance</span>
                <span class="detail-value balance">$${balance}</span>
              </div>
            </div>

            <h3 style="color: #333; margin-top: 30px;">Beneficiary Details</h3>
            <div class="details-card">
              <div class="detail-row">
                <span class="detail-label">Name</span>
                <span class="detail-value">${beneficiary.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Bank</span>
                <span class="detail-value">${beneficiary.bank}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Account</span>
                <span class="detail-value">${beneficiary.account}</span>
              </div>
            </div>

            <p class="message">
              If you did not authorize this transaction, please contact our support team immediately.
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} ${env.RESEND_SENDER_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to,
    subject: 'Withdrawal Confirmation',
    htmlContent
  });
};

const sendBeneficiaryEmail = async (beneficiary, senderName, amountCents) => {
  const amount = (amountCents / 100).toFixed(2);

  const htmlContent = `
     <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            max-width: 180px;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #333;
          }
          .message {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
          }
          .details-card {
            background: #f0fdf4;
            border-left: 4px solid #059669;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e5e5;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #666;
          }
          .detail-value {
            color: #333;
            font-weight: 500;
          }
          .amount {
            font-size: 32px;
            font-weight: bold;
            color: #059669;
          }
          .footer {
            background: #f9f9f9;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #999;
            border-top: 1px solid #e5e5e5;
          }
          .highlight-box {
            background: #f0fdf4;
            border: 2px solid #059669;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dxakrcgcz/image/upload/v1770271290/Bank-of-America_gc3ium.jpg" alt="Logo" class="logo" />
          </div>
          
          <div class="content">
            <p class="greeting">Hi ${beneficiary.name},</p>
            
            <p class="message">
              You have received a transfer from ${senderName}. The funds are being processed and will be credited to your account shortly.
            </p>
            
            <div class="highlight-box">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Amount Received</p>
              <p class="amount" style="margin: 0;">$${amount}</p>
            </div>

            <h3 style="color: #333; margin-top: 30px;">Your Account Details</h3>
            <div class="details-card">
              <div class="detail-row">
                <span class="detail-label">Account Holder</span>
                <span class="detail-value">${beneficiary.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Bank Name</span>
                <span class="detail-value">${beneficiary.bank}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Account Number</span>
                <span class="detail-value">${beneficiary.account}</span>
              </div>
              ${beneficiary.routing ? `
              <div class="detail-row">
                <span class="detail-label">Routing Number</span>
                <span class="detail-value">${beneficiary.routing}</span>
              </div>
              ` : ''}
              ${beneficiary.swift ? `
              <div class="detail-row">
                <span class="detail-label">SWIFT Code</span>
                <span class="detail-value">${beneficiary.swift}</span>
              </div>
              ` : ''}
              ${beneficiary.iban ? `
              <div class="detail-row">
                <span class="detail-label">IBAN</span>
                <span class="detail-value">${beneficiary.iban}</span>
              </div>
              ` : ''}
            </div>

            <h3 style="color: #333; margin-top: 30px;">Transfer Information</h3>
            <div class="details-card">
              <div class="detail-row">
                <span class="detail-label">Sender</span>
                <span class="detail-value">${senderName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transfer Date</span>
                <span class="detail-value">${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value" style="color: #059669; font-weight: 600;">Processing</span>
              </div>
            </div>

            <p class="message">
              Please allow 1-3 business days for the funds to appear in your account. If you have any questions or did not expect this transfer, please contact your bank immediately.
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} ${env.RESEND_SENDER_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: beneficiary.email,
    subject: 'You Have Received a Transfer',
    htmlContent
  });
};

module.exports = { sendEmail, sendWithdrawalEmail, sendBeneficiaryEmail };
