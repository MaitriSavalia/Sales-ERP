using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using SalesERP.Models;

namespace SalesERP.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;

        public EmailService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }

        public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            try
            {
                using var message = new MailMessage();
                message.From = new MailAddress(_emailSettings.FromEmail, _emailSettings.FromName);
                message.To.Add(new MailAddress(toEmail, toName));
                message.Subject = subject;
                message.Body = htmlBody;
                message.IsBodyHtml = true;

                using var smtpClient = new SmtpClient(_emailSettings.SmtpHost, _emailSettings.SmtpPort);
                smtpClient.Credentials = new NetworkCredential(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword);
                smtpClient.EnableSsl = _emailSettings.EnableSsl;

                await smtpClient.SendMailAsync(message);
                Console.WriteLine($"✅ Email sent successfully to {toEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to send email to {toEmail}: {ex.Message}");
                // Don't throw - email failures shouldn't break the main flow
            }
        }

        public async Task SendNewProductNotificationAsync(
            string partnerEmail, 
            string partnerName, 
            string productName, 
            string adminName, 
            decimal price, 
            decimal commissionPercentage)
        {
            var commission = price * (commissionPercentage / 100);
            var subject = $"New Product Available: {productName}";
            
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 24px; }}
        .content {{ background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }}
        .product-card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 20px 0; }}
        .product-name {{ font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 10px; }}
        .detail-row {{ display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }}
        .detail-label {{ color: #64748b; font-size: 14px; }}
        .detail-value {{ font-weight: bold; color: #1e293b; }}
        .highlight {{ color: #16a34a; font-size: 18px; font-weight: bold; }}
        .button {{ display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600; }}
        .footer {{ text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🎉 New Product Alert!</h1>
        </div>
        <div class='content'>
            <p>Hi <strong>{partnerName}</strong>,</p>
            <p>Great news! <strong>{adminName}</strong> has just added a new product to their catalog that you can start selling right away.</p>
            
            <div class='product-card'>
                <div class='product-name'>📦 {productName}</div>
                
                <div class='detail-row'>
                    <span class='detail-label'>Product Price:</span>
                    <span class='detail-value'>₹{price:N2}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='detail-label'>Your Commission:</span>
                    <span class='detail-value'>{commissionPercentage}%</span>
                </div>
                
                <div class='detail-row' style='border-bottom: none;'>
                    <span class='detail-label'>You Earn Per Sale:</span>
                    <span class='highlight'>₹{commission:N2}</span>
                </div>
            </div>

            <p style='margin-top: 25px;'>🚀 <strong>Ready to start selling?</strong></p>
            <p>Log in to your partner dashboard to view the complete product details and start creating sales!</p>

            <center>
                <a href='http://localhost:3000/login' class='button'>Go to Dashboard</a>
            </center>

            <p style='margin-top: 30px; color: #64748b; font-size: 14px;'>
                💡 <strong>Tip:</strong> The sooner you reach out to potential buyers, the better your chances of making a sale!
            </p>
        </div>
        
        <div class='footer'>
            <p>This is an automated notification from Sales ERP</p>
            <p>© 2026 Sales ERP. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(partnerEmail, partnerName, subject, htmlBody);
        }
    }
}
