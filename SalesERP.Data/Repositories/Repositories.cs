using Microsoft.EntityFrameworkCore;
using SalesERP.Data;
using SalesERP.Models;

namespace SalesERP.Repositories
{
    // ========================================
    // User Repository Interface
    // ========================================
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByAdminCodeAsync(string adminCode);
        Task<List<User>> GetAllAsync();
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(int id);
    }

    // ========================================
    // User Repository Implementation
    // ========================================
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.UserID == id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email.ToLower());
        }

        public async Task<User?> GetByAdminCodeAsync(string adminCode)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.AdminCode == adminCode && u.UserRole == 1);
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            user.UpdatedAt = DateTime.UtcNow;
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

    // ========================================
    // Product Repository Interface
    // ========================================
    public interface IProductRepository
    {
        Task<Product?> GetByIdAsync(int id);
        Task<List<Product>> GetAllAsync();
        Task<List<Product>> GetByAdminIdAsync(int adminId);
        Task AddAsync(Product product);
        Task UpdateAsync(Product product);
        Task DeleteAsync(int id);
    }

    // ========================================
    // Product Repository Implementation
    // ========================================
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Admin)
                .FirstOrDefaultAsync(p => p.ProductID == id);
        }

        public async Task<List<Product>> GetAllAsync()
        {
            return await _context.Products
                .Include(p => p.Admin)
                .Where(p => p.IsActive)
                .ToListAsync();
        }

        public async Task<List<Product>> GetByAdminIdAsync(int adminId)
        {
            return await _context.Products
                .Include(p => p.Admin)
                .Where(p => p.AdminID == adminId && p.IsActive)
                .ToListAsync();
        }

        public async Task AddAsync(Product product)
        {
            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Product product)
        {
            product.UpdatedAt = DateTime.UtcNow;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var product = await GetByIdAsync(id);
            if (product != null)
            {
                product.IsActive = false;
                await UpdateAsync(product);
            }
        }
    }

    // ========================================
    // Sale Repository Interface
    // ========================================
    public interface ISaleRepository
    {
        Task<Sale?> GetByIdAsync(int id);
        Task<List<Sale>> GetAllAsync();
        Task<List<Sale>> GetByPartnerIdAsync(int partnerId);
        Task<List<Sale>> GetByAdminIdAsync(int adminId);
        Task<Sale?> GetByBuyerAndProductAsync(int buyerId, int productId);
        Task AddAsync(Sale sale);
        Task UpdateAsync(Sale sale);
        Task DeleteAsync(int id);
    }

    // ========================================
    // Sale Repository Implementation
    // ========================================
    public class SaleRepository : ISaleRepository
    {
        private readonly ApplicationDbContext _context;

        public SaleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Sale?> GetByIdAsync(int id)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Include(s => s.Buyer)
                .FirstOrDefaultAsync(s => s.SaleID == id);
        }

        public async Task<List<Sale>> GetAllAsync()
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Include(s => s.Buyer)
                .ToListAsync();
        }

        public async Task<List<Sale>> GetByPartnerIdAsync(int partnerId)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Include(s => s.Buyer)
                .Where(s => s.PartnerID == partnerId)
                .ToListAsync();
        }

        public async Task<List<Sale>> GetByAdminIdAsync(int adminId)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Include(s => s.Buyer)
                .Where(s => s.Product.AdminID == adminId)
                .ToListAsync();
        }

        public async Task<Sale?> GetByBuyerAndProductAsync(int buyerId, int productId)
        {
            return await _context.Sales
                .FirstOrDefaultAsync(s => s.BuyerID == buyerId && s.ProductID == productId);
        }

        public async Task AddAsync(Sale sale)
        {
            await _context.Sales.AddAsync(sale);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Sale sale)
        {
            sale.UpdatedAt = DateTime.UtcNow;
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