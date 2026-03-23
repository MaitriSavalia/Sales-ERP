using System.Threading.Tasks;

namespace SalesERP.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody);
        
        Task SendNewProductNotificationAsync(
            string partnerEmail, 
            string partnerName, 
            string productName, 
            string adminName, 
            decimal price, 
            decimal commissionPercentage);
    }
}