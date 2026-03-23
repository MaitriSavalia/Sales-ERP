using Microsoft.EntityFrameworkCore;
using SalesERP.Models;

namespace SalesERP.Data.Repositories
{
    // ==========================================
    // USER REPOSITORY
    // ==========================================

    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByAdminCodeAsync(string adminCode); // ✅ ADDED
        Task<User> CreateAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(int id);
    }

    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        // ✅ ADDED: Get user by AdminCode
        public async Task<User?> GetByAdminCodeAsync(string adminCode)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.AdminCode == adminCode && u.UserRole == "Admin");
        }

        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var user = await GetByIdAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }
    }

    // ==========================================
    // PRODUCT REPOSITORY
    // ==========================================

    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllAsync();
        Task<Product?> GetByIdAsync(int id);
        Task<IEnumerable<Product>> GetByAdminIdAsync(int adminId);
        Task<Product> CreateAsync(Product product);
        Task UpdateAsync(Product product);
        Task DeleteAsync(int id);
    }

    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _context.Products
                .Include(p => p.Admin)
                .ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Admin)
                .FirstOrDefaultAsync(p => p.ProductId == id);
        }

        public async Task<IEnumerable<Product>> GetByAdminIdAsync(int adminId)
        {
            return await _context.Products
                .Include(p => p.Admin)
                .Where(p => p.AdminId == adminId)
                .ToListAsync();
        }

        public async Task<Product> CreateAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            
            // Reload to get navigation properties
            await _context.Entry(product).Reference(p => p.Admin).LoadAsync();
            
            return product;
        }

        public async Task UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var product = await GetByIdAsync(id);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
        }
    }

    // ==========================================
    // SALE REPOSITORY
    // ==========================================

    public interface ISaleRepository
    {
        Task<IEnumerable<Sale>> GetAllAsync();
        Task<Sale?> GetByIdAsync(int id);
        Task<IEnumerable<Sale>> GetByProductIdAsync(int productId);
        Task<IEnumerable<Sale>> GetByPartnerIdAsync(int partnerId);
        Task<IEnumerable<Sale>> GetByBuyerIdAsync(int buyerId);
        Task<Sale> CreateAsync(Sale sale);
        Task UpdateAsync(Sale sale);
        Task DeleteAsync(int id);
    }

    public class SaleRepository : ISaleRepository
    {
        private readonly ApplicationDbContext _context;

        public SaleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Sale>> GetAllAsync()
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Include(s => s.Buyer)
                .ToListAsync();
        }

        public async Task<Sale?> GetByIdAsync(int id)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Include(s => s.Buyer)
                .FirstOrDefaultAsync(s => s.SaleId == id);
        }

        public async Task<IEnumerable<Sale>> GetByProductIdAsync(int productId)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Include(s => s.Buyer)
                .Where(s => s.ProductId == productId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Sale>> GetByPartnerIdAsync(int partnerId)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Include(s => s.Buyer)
                .Where(s => s.PartnerId == partnerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Sale>> GetByBuyerIdAsync(int buyerId)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Include(s => s.Buyer)
                .Where(s => s.BuyerId == buyerId)
                .ToListAsync();
        }

        public async Task<Sale> CreateAsync(Sale sale)
        {
            _context.Sales.Add(sale);
            await _context.SaveChangesAsync();
            
            // Reload to get navigation properties
            await _context.Entry(sale).Reference(s => s.Product).LoadAsync();
            await _context.Entry(sale).Reference(s => s.Partner).LoadAsync();
            await _context.Entry(sale).Reference(s => s.Buyer).LoadAsync();
            
            return sale;
        }

        public async Task UpdateAsync(Sale sale)
        {
            _context.Sales.Update(sale);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var sale = await GetByIdAsync(id);
            if (sale != null)
            {
                _context.Sales.Remove(sale);
                await _context.SaveChangesAsync();
            }
        }
    }
}