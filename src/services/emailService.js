const { Resend } = require('resend');
const { env } = require('../config/env');

const resend = new Resend(env.RESEND_API_KEY);

// Utility function to mask account numbers - shows last 4 digits
const maskAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  const lastFour = accountNumber.slice(-4);
  const masked = '*'.repeat(Math.max(accountNumber.length - 4, 4));
  return `${masked}${lastFour}`;
};

// Utility function to mask IBAN - shows first 4 and last 4 characters
const maskIBAN = (iban) => {
  if (!iban || iban.length < 8) return iban;
  const first = iban.slice(0, 4);
  const last = iban.slice(-4);
  const masked = '*'.repeat(Math.max(iban.length - 8, 4));
  return `${first}${masked}${last}`;
};

// Utility function to mask SWIFT - shows first 4 and last 3 characters
const maskSWIFT = (swift) => {
  if (!swift || swift.length < 7) return swift;
  const first = swift.slice(0, 4);
  const last = swift.slice(-3);
  const masked = '*'.repeat(Math.max(swift.length - 7, 2));
  return `${first}${masked}${last}`;
};

// Utility function to mask routing number - shows last 4 digits
const maskRoutingNumber = (routing) => {
  if (!routing || routing.length < 4) return routing;
  const lastFour = routing.slice(-4);
  const masked = '*'.repeat(Math.max(routing.length - 4, 5));
  return `${masked}${lastFour}`;
};

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

  // Determine currency based on what fields are present
  const currency = beneficiary.routing ? 'USD' : 'EUR';
  const currencySymbol = beneficiary.routing ? '$' : '€';

  // Mask sensitive information
  const maskedAccount = maskAccountNumber(beneficiary.account);
  const maskedIban = beneficiary.iban ? maskIBAN(beneficiary.iban) : null;
  const maskedSwift = beneficiary.swift ? maskSWIFT(beneficiary.swift) : null;
  const maskedRouting = beneficiary.routing ? maskRoutingNumber(beneficiary.routing) : null;

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
            font-family: 'Courier New', monospace;
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
          .security-note {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 12px;
            margin-top: 20px;
            font-size: 13px;
            color: #0369a1;
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
                <span class="detail-value amount">${currencySymbol}${amount} ${currency}</span>
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
                <span class="detail-value">${maskedAccount}</span>
              </div>
              ${maskedRouting ? `
              <div class="detail-row">
                <span class="detail-label">Routing Number</span>
                <span class="detail-value">${maskedRouting}</span>
              </div>
              ` : ''}
              ${maskedSwift ? `
              <div class="detail-row">
                <span class="detail-label">SWIFT Code</span>
                <span class="detail-value">${maskedSwift}</span>
              </div>
              ` : ''}
              ${maskedIban ? `
              <div class="detail-row">
                <span class="detail-label">IBAN</span>
                <span class="detail-value">${maskedIban}</span>
              </div>
              ` : ''}
            </div>

            <div class="security-note">
              🔒 For security, account numbers have been partially masked. Full details are available in your transaction history.
            </div>

            <p class="message" style="margin-top: 30px;">
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
  
  // Determine currency based on what fields are present
  const currency = beneficiary.routing ? 'USD' : 'EUR';
  const currencySymbol = beneficiary.routing ? '$' : '€';

  // Mask sensitive information
  const maskedAccount = maskAccountNumber(beneficiary.account);
  const maskedIban = beneficiary.iban ? maskIBAN(beneficiary.iban) : null;
  const maskedSwift = beneficiary.swift ? maskSWIFT(beneficiary.swift) : null;
  const maskedRouting = beneficiary.routing ? maskRoutingNumber(beneficiary.routing) : null;

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
            font-family: 'Courier New', monospace;
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
          .security-note {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 12px;
            margin-top: 20px;
            font-size: 13px;
            color: #0369a1;
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
              <p class="amount" style="margin: 0;">${currencySymbol}${amount} ${currency}</p>
            </div>

            <h3 style="color: #333; margin-top: 30px;">Beneficiary Details</h3>
            <div class="details-card">
              <div class="detail-row">
                <span class="detail-label">Account Holder: </span>
                <span class="detail-value">${beneficiary.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Bank Name: </span>
                <span class="detail-value">${beneficiary.bank}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Account Number: </span>
                <span class="detail-value">${maskedAccount}</span>
              </div>
              ${maskedRouting ? `
              <div class="detail-row">
                <span class="detail-label">Routing Number: </span>
                <span class="detail-value">${maskedRouting}</span>
              </div>
              ` : ''}
              ${maskedSwift ? `
              <div class="detail-row">
                <span class="detail-label">SWIFT Code: </span>
                <span class="detail-value">${maskedSwift}</span>
              </div>
              ` : ''}
              ${maskedIban ? `
              <div class="detail-row">
                <span class="detail-label">IBAN: </span>
    
                <span class="detail-value">${maskedIban}</span>
              </div>
              ` : ''}
            </div>

            <div class="security-note">
              🔒 For security, account numbers have been partially masked in this notification.
            </div>

            <h3 style="color: #333; margin-top: 30px;">Transfer Information</h3>
            <div class="details-card">
              <div class="detail-row">
                <span class="detail-label">Sender: </span>
                <span class="detail-value">${senderName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transfer Date: </span>
                <span class="detail-value">${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status: </span>
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