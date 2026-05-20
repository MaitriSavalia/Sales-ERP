const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign
} = require("C:\\Users\\Maitri Savalia\\AppData\\Roaming\\npm\\node_modules\\docx");
const fs = require("fs");

const TNR = "Times New Roman";

// ── Helpers ──────────────────────────────────────────────────────────
const hdrBorder = { style: BorderStyle.SINGLE, size: 6, color: "2E5594" };
const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA" };
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const hdrBorders = { top: hdrBorder, bottom: hdrBorder, left: hdrBorder, right: hdrBorder };

function hdrCell(text, w) {
  return new TableCell({
    borders: hdrBorders,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: "2E5594", type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, font: TNR, size: 22, bold: true, color: "FFFFFF" })]
    })]
  });
}

function dataCell(text, w, center) {
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, font: TNR, size: 20 })]
    })]
  });
}

function altCell(text, w, center, isAlt) {
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: isAlt ? "EEF2FF" : "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, font: TNR, size: 20 })]
    })]
  });
}

function makeTable(headers, rows, colWidths, altRows) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => hdrCell(h, colWidths[i]))
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map((cell, ci) =>
            altRows
              ? altCell(cell, colWidths[ci], ci > 0, ri % 2 === 1)
              : dataCell(cell, colWidths[ci], ci > 0)
          )
        })
      )
    ]
  });
}

function tableTitle(text) {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    children: [new TextRun({ text, font: TNR, size: 24, bold: true })]
  });
}

function caption(text) {
  return new Paragraph({
    spacing: { before: 80, after: 240 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: TNR, size: 20, italics: true, color: "555555" })]
  });
}

function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 400, after: 160 },
    children: [new TextRun({ text, font: TNR, size: 28, bold: true })]
  });
}

function blankLine() {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: 80, after: 80 } });
}

// ═══════════════════════════════════════════════════════════════════════
// ALL TABLES
// ═══════════════════════════════════════════════════════════════════════

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1080, bottom: 1440, left: 1440 }
      }
    },
    children: [

      // ── Cover note ──────────────────────────────────────────────────
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 400 },
        children: [new TextRun({ text: "SalesPilot ERP — All Tables", font: TNR, size: 32, bold: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 600 },
        children: [new TextRun({ text: "Copy each table individually into your thesis Word file", font: TNR, size: 22, italics: true, color: "888888" })]
      }),

      // ══════════════════════════════════════════════════════════════
      // TABLE 2.1
      // ══════════════════════════════════════════════════════════════
      sectionTitle("Chapter 2 Tables"),
      tableTitle("Table 2.1: Comparison of Existing ERP and Sales Management Systems"),
      makeTable(
        ["Feature", "SAP ERP", "Zoho CRM", "Xactly Incent", "SalesPilot ERP"],
        [
          ["Multi Role Access Control", "Yes", "Yes", "Limited", "Yes"],
          ["Commission Automation", "Yes", "Partial", "Yes", "Yes"],
          ["Open Source or Free", "No", "Freemium", "No", "Yes"],
          ["Lightweight Deployment", "No", "Cloud only", "Cloud only", "Yes"],
          ["Custom Partner Network", "Limited", "No", "No", "Yes"],
          ["License Key Generation", "No", "No", "No", "Yes"],
          ["Multi Admin Affiliation", "No", "No", "No", "Yes"],
          ["Timestamped Partner History", "No", "No", "No", "Yes"],
          ["Email Notification System", "Yes", "Yes", "Yes", "Yes"],
          ["Designed for SMEs", "No", "Yes", "No", "Yes"],
        ],
        [2600, 1300, 1300, 1500, 1560],
        true
      ),
      caption("Table 2.1: Comparison of Existing ERP and Sales Management Systems"),

      // ══════════════════════════════════════════════════════════════
      // TABLE 2.2
      // ══════════════════════════════════════════════════════════════
      blankLine(),
      tableTitle("Table 2.2: Technology Stack Comparison and Selection Rationale"),
      makeTable(
        ["Technology", "Alternatives Considered", "Reason for Selection"],
        [
          ["ASP.NET Core 8.0", "Node.js Express, Django", "Strong type safety, built in dependency injection, JWT middleware, EF Core native support"],
          ["React.js 18", "Angular, Vue.js", "Component reusability, large ecosystem, hooks for concise state management"],
          ["SQL Server 2022", "PostgreSQL, MySQL", "EF Core native integration, SSMS tooling, reliable ACID transaction support"],
          ["Entity Framework Core", "Dapper, raw ADO.NET", "Code first migrations, LINQ query translation, repository pattern support"],
          ["JWT Authentication", "Session cookies, OAuth2", "Stateless, embeds role claims, well suited to SPA frontends"],
          ["BCrypt.Net", "PBKDF2, Argon2", "Industry standard, adaptive cost factor, straightforward integration"],
          ["SendGrid SMTP", "Mailgun, Gmail SMTP", "Free tier available, reliable delivery, async SDK support"],
        ],
        [1700, 2000, 4560],
        true
      ),
      caption("Table 2.2: Technology Stack Comparison and Selection Rationale"),

      // ══════════════════════════════════════════════════════════════
      // TABLE 3.1
      // ══════════════════════════════════════════════════════════════
      sectionTitle("Chapter 3 Tables"),
      tableTitle("Table 3.1: Users Table Schema"),
      makeTable(
        ["Column", "Data Type", "Constraint", "Description"],
        [
          ["UserId", "INT", "PK, IDENTITY, NOT NULL", "Auto incremented primary key"],
          ["FullName", "NVARCHAR(100)", "NOT NULL", "User full name"],
          ["Email", "NVARCHAR(100)", "NOT NULL, UNIQUE", "Login email address"],
          ["PasswordHash", "NVARCHAR(500)", "NOT NULL", "BCrypt hashed password"],
          ["UserRole", "INT", "NOT NULL", "1 = Admin, 2 = Partner, 3 = Buyer"],
          ["PhoneNumber", "NVARCHAR(20)", "NULL", "Contact number"],
          ["CompanyName", "NVARCHAR(100)", "NULL", "Organisation name"],
          ["Address", "NVARCHAR(500)", "NULL", "Physical address"],
          ["AdminCode", "NVARCHAR(20)", "NULL", "Six digit code for Admin; entered by Partner at registration"],
          ["AdminIds", "VARCHAR(MAX)", "NULL", "Comma separated adminId:ISO8601timestamp pairs"],
          ["CreatedAt", "SMALLDATETIME", "NULL", "Account creation timestamp"],
          ["UpdatedAt", "DATETIME2(7)", "NOT NULL", "Last record update timestamp"],
        ],
        [1700, 1700, 2000, 2860],
        true
      ),
      caption("Table 3.1: Users Table Schema"),

      // ══════════════════════════════════════════════════════════════
      // TABLE 3.2
      // ══════════════════════════════════════════════════════════════
      blankLine(),
      tableTitle("Table 3.2: Products Table Schema"),
      makeTable(
        ["Column", "Data Type", "Constraint", "Description"],
        [
          ["ProductId", "INT", "PK, IDENTITY, NOT NULL", "Auto incremented primary key"],
          ["ProductName", "NVARCHAR(200)", "NOT NULL", "Name of the software product"],
          ["Description", "NVARCHAR(MAX)", "NULL", "Detailed product description"],
          ["Price", "DECIMAL(18,2)", "NOT NULL", "Selling price in INR"],
          ["CommissionPercentage", "DECIMAL(5,2)", "NOT NULL", "Partner commission percentage per sale"],
          ["AdminId", "INT", "FK to Users, NOT NULL", "Admin who created the product"],
          ["IsActive", "BIT", "NOT NULL", "Product availability flag"],
          ["CreatedAt", "SMALLDATETIME", "NULL", "Creation timestamp"],
          ["UpdatedAt", "SMALLDATETIME", "NULL", "Last modification timestamp"],
        ],
        [1700, 1700, 2000, 2860],
        true
      ),
      caption("Table 3.2: Products Table Schema"),

      // ══════════════════════════════════════════════════════════════
      // TABLE 3.3
      // ══════════════════════════════════════════════════════════════
      blankLine(),
      tableTitle("Table 3.3: Sales Table Schema"),
      makeTable(
        ["Column", "Data Type", "Constraint", "Description"],
        [
          ["SaleId", "INT", "PK, IDENTITY, NOT NULL", "Auto incremented primary key"],
          ["ProductId", "INT", "FK to Products, NOT NULL", "Product that was sold"],
          ["PartnerId", "INT", "FK to Users, NOT NULL", "Partner who created the sale"],
          ["BuyerId", "INT", "FK to Users, NOT NULL", "Buyer who made the purchase"],
          ["SaleAmount", "DECIMAL(18,2)", "NOT NULL", "Total sale price"],
          ["CommissionAmount", "DECIMAL(18,2)", "NOT NULL", "Auto computed at sale creation"],
          ["SaleDate", "DATETIME2(7)", "NOT NULL", "Date and time of sale in UTC"],
          ["CommissionPaymentStatus", "NVARCHAR(50)", "NOT NULL", "Admin to Partner payment status"],
          ["SalePaymentStatus", "NVARCHAR(20)", "NOT NULL", "Buyer to Admin payment status"],
          ["LicenseKey", "NVARCHAR(100)", "NOT NULL", "Auto generated software license key"],
          ["Notes", "NVARCHAR(MAX)", "NULL", "Optional sale remarks"],
          ["CreatedAt", "DATETIME2(7)", "NULL", "Record creation timestamp"],
          ["UpdatedAt", "DATETIME2(7)", "NULL", "Last record update timestamp"],
        ],
        [1900, 1700, 2000, 2660],
        true
      ),
      caption("Table 3.3: Sales Table Schema"),

      // ══════════════════════════════════════════════════════════════
      // TABLE 4.1
      // ══════════════════════════════════════════════════════════════
      sectionTitle("Chapter 4 Tables"),
      tableTitle("Table 4.1: RESTful API Endpoints"),
      makeTable(
        ["Method", "Endpoint", "Role", "Description"],
        [
          ["POST", "/api/auth/register", "Public", "User registration for all roles"],
          ["POST", "/api/auth/login", "Public", "Login, returns JWT token with role"],
          ["GET", "/api/admin/dashboard", "Admin", "Dashboard KPI statistics"],
          ["GET", "/api/admin/products", "Admin", "List all admin products"],
          ["POST", "/api/admin/products", "Admin", "Create new product"],
          ["PUT", "/api/admin/products/{id}", "Admin", "Update existing product"],
          ["DELETE", "/api/admin/products/{id}", "Admin", "Delete product"],
          ["GET", "/api/admin/partners", "Admin", "List partners with addedAt timestamps"],
          ["POST", "/api/admin/partners", "Admin", "Add partner by email address"],
          ["DELETE", "/api/admin/partners/{id}", "Admin", "Remove partner from network"],
          ["GET", "/api/admin/sales", "Admin", "All sales for admin products"],
          ["PUT", "/api/admin/sales/{id}/commission-status", "Admin", "Update commission payment status"],
          ["PUT", "/api/admin/sales/{id}/sale-status", "Admin", "Update buyer sale payment status"],
          ["GET", "/api/admin/top-partners", "Admin", "Top 10 partners ranked by revenue"],
          ["GET", "/api/partner/dashboard", "Partner", "Partner KPI dashboard"],
          ["GET", "/api/partner/products", "Partner", "Available products from affiliated admins"],
          ["POST", "/api/partner/sales", "Partner", "Create new sale"],
          ["GET", "/api/partner/sales", "Partner", "Partner sales history"],
          ["GET", "/api/partner/buyers", "Partner", "Buyer list with purchase summaries"],
          ["GET", "/api/buyer/purchases", "Buyer", "Own purchases and license keys"],
        ],
        [900, 2800, 1000, 3560],
        true
      ),
      caption("Table 4.1: RESTful API Endpoints"),

      // ══════════════════════════════════════════════════════════════
      // TABLE 4.2
      // ══════════════════════════════════════════════════════════════
      blankLine(),
      tableTitle("Table 4.2: Email Notification Triggers and Recipients"),
      makeTable(
        ["Trigger Event", "Recipient", "Email Content"],
        [
          ["New user registration", "New user (Admin, Partner or Buyer)", "Welcome message and login instructions"],
          ["New sale created", "Buyer", "Purchase confirmation, product name, license key, sale amount, payment status"],
          ["New sale created", "Partner", "Sale recorded alert with commission amount earned"],
          ["New sale created", "Admin", "New sale notification with product, partner name, buyer name, and sale amount"],
          ["Buyer auto registered via sale", "Auto created Buyer", "Account credentials and first purchase details including license key"],
          ["Sale payment status updated to Completed", "Buyer", "Payment confirmed notification with transaction details"],
          ["Commission payment status updated to Completed", "Partner", "Commission payment received notification with amount"],
        ],
        [2400, 2000, 3860],
        true
      ),
      caption("Table 4.2: Email Notification Triggers and Recipients"),

      // ══════════════════════════════════════════════════════════════
      // TABLE 4.3
      // ══════════════════════════════════════════════════════════════
      blankLine(),
      tableTitle("Table 4.3: Role Based Access Control Matrix"),
      makeTable(
        ["Resource", "Admin", "Partner", "Buyer"],
        [
          ["Product CRUD", "Full access", "Read only", "No access"],
          ["Partner Network Management", "Full access", "No access", "No access"],
          ["Sale Creation", "No access", "Full access", "No access"],
          ["Commission Status Update", "Full access", "No access", "No access"],
          ["Sale Payment Status Update", "Full access", "No access", "No access"],
          ["Sales Records", "All sales for own products", "Own sales only", "No access"],
          ["Purchases and License Keys", "No access", "No access", "Own records only"],
          ["Dashboard Analytics", "Admin KPIs", "Partner KPIs", "No access"],
          ["Email Notifications", "Receives sale alerts", "Receives sale and commission alerts", "Receives purchase and payment alerts"],
        ],
        [2600, 1900, 1900, 1860],
        true
      ),
      caption("Table 4.3: Role Based Access Control Matrix"),

      // ══════════════════════════════════════════════════════════════
      // TABLE 5.1
      // ══════════════════════════════════════════════════════════════
      sectionTitle("Chapter 5 Tables"),
      tableTitle("Table 5.1: Functional Test Cases and Results"),
      makeTable(
        ["TC ID", "Description", "Expected Result", "Actual Result", "Status"],
        [
          ["TC01", "Admin registers with valid details", "Account created, AdminCode generated", "Six digit AdminCode stored in database", "PASS"],
          ["TC02", "Partner registers with valid AdminCode", "Account linked to Admin", "AdminIds populated with adminId and timestamp", "PASS"],
          ["TC03", "Partner registers with invalid AdminCode", "Error returned", "400 Bad Request with clear message", "PASS"],
          ["TC04", "Login with correct credentials", "JWT returned with role claim", "Token issued, role verified in payload", "PASS"],
          ["TC05", "Login with wrong password", "401 Unauthorized", "401 with invalid credentials message", "PASS"],
          ["TC06", "Admin creates a product", "Product saved, IsActive true", "Product visible in list immediately", "PASS"],
          ["TC07", "Admin adds partner by email", "AdminIds updated with timestamp", "Correct UTC timestamp stored", "PASS"],
          ["TC08", "Partner creates sale for new buyer", "Sale saved, buyer auto created, license key generated", "All records created, email sent to buyer", "PASS"],
          ["TC09", "Commission auto calculation", "CommissionAmount equals percentage times SaleAmount", "Correct value verified for multiple test cases", "PASS"],
          ["TC10", "Admin updates commission status to Completed", "Status updated, email sent to Partner", "Status changed in database, email delivered", "PASS"],
          ["TC11", "Partner accesses Admin only endpoint", "403 Forbidden", "403 returned with no data exposed", "PASS"],
          ["TC12", "Buyer views only own purchases", "No cross buyer data leakage", "Only own records returned", "PASS"],
          ["TC13", "UTC timestamp display converted to IST", "Times shown in IST plus 5:30", "Correct conversion applied in frontend", "PASS"],
          ["TC14", "Mobile viewport layout at 375px", "UI adapts to small screen", "Column stacking and padding confirmed", "PASS"],
        ],
        [700, 2000, 1800, 1900, 860],
        true
      ),
      caption("Table 5.1: Functional Test Cases and Results"),

    ]
  }]
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("D:\\Desktop\\Project\\SalesERP\\SalesPilot_All_Tables.docx", buffer);
  console.log("SUCCESS: Tables saved to SalesPilot_All_Tables.docx");
}).catch(err => console.error("ERROR:", err));
