using Microsoft.EntityFrameworkCore;
using SalesERP.Models;

namespace SalesERP.Data.Repositories
{
    // ===========================
    // USER REPOSITORY
    // ===========================
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByAdminCodeAsync(string adminCode);
        Task<IEnumerable<User>> GetAllByRoleAsync(string role);
        Task<User> CreateAsync(User user);
        Task<User> UpdateAsync(User user);
        Task DeleteAsync(int id);
    }

    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            Console.WriteLine($"🔍 Searching for user: {email}");
            
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email);
            
            Console.WriteLine(user != null ? $"✅ Found: {user.FullName}" : "❌ Not found");
            return user;
        }

        public async Task<User?> GetByAdminCodeAsync(string adminCode)
        {
            Console.WriteLine($"🔍 Searching for admin with code: {adminCode}");
            
            var admin = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.AdminCode == adminCode && u.UserRole == "Admin");
            
            Console.WriteLine(admin != null ? $"✅ Found admin: {admin.FullName}" : "❌ Admin not found");
            return admin;
        }

        public async Task<IEnumerable<User>> GetAllByRoleAsync(string role)
        {
            return await _context.Users
                .AsNoTracking()
                .Where(u => u.UserRole == role)
                .ToListAsync();
        }

        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == id);
                
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }
    }

    // ===========================
    // PRODUCT REPOSITORY
    // ===========================
    public interface IProductRepository
    {
        Task<Product?> GetByIdAsync(int id);
        Task<IEnumerable<Product>> GetAllAsync();
        Task<IEnumerable<Product>> GetByAdminIdAsync(int adminId);
        Task<IEnumerable<Product>> GetByAdminIdsAsync(List<int> adminIds);
        Task<Product> CreateAsync(Product product);
        Task<Product> UpdateAsync(Product product);
        Task DeleteAsync(int id);
    }

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
                .FirstOrDefaultAsync(p => p.ProductId == id);
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _context.Products
                .Include(p => p.Admin)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetByAdminIdAsync(int adminId)
        {
            return await _context.Products
                .Include(p => p.Admin)
                .AsNoTracking()
                .Where(p => p.AdminId == adminId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetByAdminIdsAsync(List<int> adminIds)
        {
            return await _context.Products
                .Include(p => p.Admin)
                .AsNoTracking()
                .Where(p => adminIds.Contains(p.AdminId) && p.IsActive)
                .ToListAsync();
        }

        public async Task<Product> CreateAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<Product> UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task DeleteAsync(int id)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.ProductId == id);
                
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
        }
    }

    // ===========================
    // SALE REPOSITORY
    // ===========================
    public interface ISaleRepository
    {
        Task<Sale?> GetByIdAsync(int id);
        Task<IEnumerable<Sale>> GetAllAsync();
        Task<IEnumerable<Sale>> GetByPartnerIdAsync(int partnerId);
        Task<IEnumerable<Sale>> GetByBuyerIdAsync(int buyerId);
        Task<bool> CanBuyerPurchaseAsync(int buyerId, int productId);
        Task<Sale> CreateAsync(Sale sale);
        Task<Sale> UpdateAsync(Sale sale);
        Task DeleteAsync(int id);
    }

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
                .FirstOrDefaultAsync(s => s.SaleId == id);
        }

        public async Task<IEnumerable<Sale>> GetAllAsync()
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Include(s => s.Buyer)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Sale>> GetByPartnerIdAsync(int partnerId)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Include(s => s.Buyer)
                .AsNoTracking()
                .Where(s => s.PartnerId == partnerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Sale>> GetByBuyerIdAsync(int buyerId)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Include(s => s.Buyer)
                .AsNoTracking()
                .Where(s => s.BuyerId == buyerId)
                .ToListAsync();
        }

        public async Task<bool> CanBuyerPurchaseAsync(int buyerId, int productId)
        {
            var existingSale = await _context.Sales
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.BuyerId == buyerId && s.ProductId == productId);
            
            return existingSale == null;
        }

        public async Task<Sale> CreateAsync(Sale sale)
        {
            _context.Sales.Add(sale);
            await _context.SaveChangesAsync();
            return sale;
        }

        public async Task<Sale> UpdateAsync(Sale sale)
        {
            _context.Sales.Update(sale);
            await _context.SaveChangesAsync();
            return sale;
        }

        public async Task DeleteAsync(int id)
        {
            var sale = await _context.Sales
                .FirstOrDefaultAsync(s => s.SaleId == id);
                
            if (sale != null)
            {
                _context.Sales.Remove(sale);
                await _context.SaveChangesAsync();
            }
        }
    }

    // ===========================
    // ADMIN PARTNER MAPPING REPOSITORY
    // ===========================
    public interface IAdminPartnerMappingRepository
    {
        Task<AdminPartnerMapping?> GetByIdAsync(int id);
        Task<IEnumerable<AdminPartnerMapping>> GetByPartnerIdAsync(int partnerId);
        Task<IEnumerable<AdminPartnerMapping>> GetByAdminIdAsync(int adminId);
        Task<bool> IsMappedAsync(int adminId, int partnerId);
        Task<List<int>> GetMappedAdminIdsAsync(int partnerId);
        Task<AdminPartnerMapping> CreateAsync(AdminPartnerMapping mapping);
        Task<AdminPartnerMapping> UpdateAsync(AdminPartnerMapping mapping);
        Task DeleteAsync(int id);
    }

    public class AdminPartnerMappingRepository : IAdminPartnerMappingRepository
    {
        private readonly ApplicationDbContext _context;

        public AdminPartnerMappingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AdminPartnerMapping?> GetByIdAsync(int id)
        {
            return await _context.AdminPartnerMappings
                .Include(m => m.Admin)
                .Include(m => m.Partner)
                .FirstOrDefaultAsync(m => m.MappingId == id);
        }

        public async Task<IEnumerable<AdminPartnerMapping>> GetByPartnerIdAsync(int partnerId)
        {
            return await _context.AdminPartnerMappings
                .Include(m => m.Admin)
                .Include(m => m.Partner)
                .AsNoTracking()
                .Where(m => m.PartnerId == partnerId && m.IsActive)
                .OrderByDescending(m => m.MappedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<AdminPartnerMapping>> GetByAdminIdAsync(int adminId)
        {
            return await _context.AdminPartnerMappings
                .Include(m => m.Admin)
                .Include(m => m.Partner)
                .AsNoTracking()
                .Where(m => m.AdminId == adminId && m.IsActive)
                .OrderByDescending(m => m.MappedAt)
                .ToListAsync();
        }

        public async Task<bool> IsMappedAsync(int adminId, int partnerId)
        {
            return await _context.AdminPartnerMappings
                .AsNoTracking()
                .AnyAsync(m => m.AdminId == adminId && m.PartnerId == partnerId && m.IsActive);
        }

        public async Task<List<int>> GetMappedAdminIdsAsync(int partnerId)
        {
            return await _context.AdminPartnerMappings
                .AsNoTracking()
                .Where(m => m.PartnerId == partnerId && m.IsActive)
                .Select(m => m.AdminId)
                .ToListAsync();
        }

        public async Task<AdminPartnerMapping> CreateAsync(AdminPartnerMapping mapping)
        {
            _context.AdminPartnerMappings.Add(mapping);
            await _context.SaveChangesAsync();
            return mapping;
        }

        public async Task<AdminPartnerMapping> UpdateAsync(AdminPartnerMapping mapping)
        {
            _context.AdminPartnerMappings.Update(mapping);
            await _context.SaveChangesAsync();
            return mapping;
        }

        public async Task DeleteAsync(int id)
        {
            var mapping = await _context.AdminPartnerMappings
                .FirstOrDefaultAsync(m => m.MappingId == id);
                
            if (mapping != null)
            {
                _context.AdminPartnerMappings.Remove(mapping);
                await _context.SaveChangesAsync();
            }
        }
    }
}