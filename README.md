# Sales ERP System

A comprehensive Sales ERP system with role-based access control for Admins, Partners, and Buyers. Built with React frontend and ASP.NET Core backend.

## 🚀 Features

### Admin Features
- **Dashboard**: Overview of sales, revenue, commission, and partner performance
- **Product Management**: Create, edit, delete products with commission settings
- **Partner Management**: Add/remove partners, view performance metrics
- **Buyer Management**: Track buyer purchases and payment status
- **Sales Tracking**: Monitor all sales with payment status updates
- **Commission Management**: Update partner commission payment status

### Partner Features
- **Dashboard**: View sales performance and earnings
- **Product Catalog**: Browse available products grouped by admin
- **Sales Creation**: Create sales for buyers with duplicate purchase prevention
- **Buyer Management**: Track buyers and their purchase history
- **Commission Tracking**: Monitor paid and unpaid commissions

### Key Features
- 🎨 Modern, responsive UI with dark sidebar and orange accents
- 🔐 JWT authentication with role-based authorization
- 📊 Real-time sales and commission tracking
- 💳 Dual payment status tracking (Buyer Payment + Partner Commission)
- 🎯 Product grouping by admin for partners
- 🔄 Automatic buyer account creation
- 📈 Performance analytics and reporting
- 🎫 Automatic license key generation

## 🛠️ Tech Stack

### Frontend
- **React** 18
- **React Router** v6
- **Lucide Icons**
- **CSS-in-JS** (inline styles)

### Backend
- **ASP.NET Core** 8.0
- **Entity Framework Core** 8.0
- **SQL Server**
- **JWT Authentication**

## 📋 Prerequisites

- Node.js 18+ and npm
- .NET 8.0 SDK
- SQL Server 2019+
- Visual Studio 2022 or VS Code

## ⚙️ Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SalesERP
   ```

2. **Update connection string**
   - Open `SalesERP.API/appsettings.json`
   - Update `ConnectionStrings:DefaultConnection` with your SQL Server details

3. **Run database migrations**
   - Execute SQL scripts in order:
     1. `CreateDatabase.sql` - Creates database and tables
     2. `MigrateUserRoleToInt.sql` - Migrates UserRole to enum
     3. `AddBuyerPaymentStatusMigration.sql` - Adds buyer payment tracking

4. **Restore NuGet packages**
   ```bash
   cd SalesERP.API
   dotnet restore
   ```

5. **Run the backend**
   ```bash
   dotnet run
   ```
   Backend will run on `http://localhost:5261`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   Frontend will run on `http://localhost:3000`

## 👥 User Roles

### Admin
- Creates and manages products
- Adds partners to sell their products
- Tracks all sales and manages commissions
- Full access to buyer payment status

**Default Admin Login:**
- Email: `admin@saleserp.com`
- Password: `Admin@123`

### Partner
- Views products from mapped admins
- Creates sales for buyers
- Tracks commissions and earnings
- Updates buyer payment status

**Register as Partner:**
- Use partner registration with Admin Code provided by admin

### Buyer
- Automatically created when partner makes a sale
- Views purchase history
- (Future: Self-registration and product browsing)

## 📁 Project Structure

```
SalesERP/
├── Backend/
│   ├── SalesERP.API/           # Web API project
│   ├── SalesERP.Data/          # Data access layer
│   ├── SalesERP.Models/        # Domain models & DTOs
│   └── SalesERP.Services/      # Business logic
├── Frontend/
│   ├── public/
│   └── src/
│       ├── components/         # React components
│       ├── services/          # API service layer
│       └── App.js             # Main app component
└── Database/
    └── Migrations/            # SQL migration scripts
```

## 🎨 UI Components

### Admin Panel
- `AdminDashboard.js` - Stats, top partners, recent sales, products
- `AdminProducts.js` - Product management with card view
- `AdminPartners.js` - Partner management and mapping
- `AdminBuyers.js` - Buyer tracking with payment status
- `Sales.js` - Complete sales management

### Partner Panel
- `PartnerDashboard.js` - Performance overview
- `PartnerProducts.js` - Product catalog grouped by admin
- `PartnerSales.js` - Sales history
- `PartnerBuyers.js` - Buyer management

## 🔐 Authentication Flow

1. User registers with role (Admin/Partner/Buyer)
2. User logs in with email/password
3. Backend generates JWT token with user claims
4. Frontend stores token in sessionStorage with unique tab ID
5. All API requests include Authorization header with JWT
6. Backend validates token and role for each request

## 💾 Database Schema

### Key Tables
- **Users**: Admin, Partner, Buyer accounts
- **Products**: Products created by admins
- **Sales**: Sales transactions with dual payment status
- **AdminPartnerMappings**: Admin-Partner relationships

### Enums
- **UserRole**: Admin=1, Partner=2, Buyer=3
- **PaymentStatus**: Pending, Completed, Cancelled
- **BuyerPaymentStatus**: Pending, Paid, Failed

## 🚀 Deployment

### Backend (IIS)
1. Publish the API project
2. Create IIS site pointing to publish folder
3. Configure application pool (.NET CLR version: No Managed Code)
4. Update connection string for production database

### Frontend (Static Hosting)
1. Build production bundle: `npm run build`
2. Deploy `build/` folder to hosting (Vercel, Netlify, Azure Static Web Apps)
3. Update API base URL in production

## 🔄 Recent Updates

- ✅ UserRole migration from string to int enum
- ✅ Buyer payment status tracking
- ✅ Admin-wise product grouping for partners
- ✅ Commission status separation from payment status
- ✅ Improved card-based product display
- ✅ React Router v7 future flags

## 📝 Pending Features

- [ ] Email notifications for new products (ready to integrate)
- [ ] Buyer self-service portal
- [ ] Sales analytics and charts
- [ ] Export sales reports (PDF/Excel)
- [ ] Multi-currency support
- [ ] Product categories and filtering

## 🐛 Known Issues

None currently. Report issues on GitHub.

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

Built with ❤️ for learning and demonstration purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions or support, please open an issue on GitHub.
