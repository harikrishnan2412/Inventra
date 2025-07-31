# Inventra

## Project Overview

Inventra is an inventory management system designed to streamline operations for businesses, particularly for admin/shop owners. It provides comprehensive tools for managing products, orders, and inventory, along with sales insights.

*Key Features:*

1.  *User Authentication:* Secure login for admin/shop owner(s). (Potential enhancement: staff roles with limited access like "view only" or "order processing").
2.  *Product Management:*
    *   Add, edit, delete products.
    *   Each product includes: Product name, SKU/code (optional), Quantity in stock, Price, Category (optional), Product image (optional).
3.  *Order Management:*
    *   Create and manage customer orders.
    *   Update product quantity after order is processed.
    *   View order status: pending, completed, cancelled.
    *   Order details include: Products selected, Quantity, Customer name/contact (optional), Order date and status.
4.  *Inventory Monitoring:*
    *   Show low-stock alerts (e.g., when quantity < threshold).
    *   Track product movement (in/out) and current stock status.
5.  *Sales Insights & Dashboard:*
    *   Show daily/weekly sales summary: Total sales, Most sold products, Pending/completed orders count.
    *   Visual representation (bar/line charts) for trends (optional).
6.  *Export & Reports:*
    *   Export inventory list as CSV/PDF.
    *   Export sales report for a selected date range.

## Workflow

### Typical Workflow for Development and Deployment

1. **Clone the Repository**
   - Clone the project repository to your local machine using `git clone`.

2. **Backend Setup**
   - Navigate to the `Backend` directory.
   - Install dependencies:  
     ```
     npm install
     ```
   - Create a `.env` file in the `Backend` directory and configure environment variables (e.g., database URL, API keys, etc.).
   - Start the backend server:  
     ```
     npm run dev
     ```
     or  
     ```
     node server.js
     ```

3. **Frontend Setup**
   - Navigate to the frontend directory (e.g., `Frontend`).
   - Install dependencies:  
     ```
     npm install
     ```
   - Start the frontend development server:  
     ```
     npm run dev
     ```

4. **Development Practices**
   - Use feature branches for new features or bug fixes.
   - Commit changes with clear messages.
   - Open pull requests for code review before merging to the main branch.
   - Ensure code follows formatting and linting standards.
   - Test features locally before pushing.

5. **Database**
   - The project uses Supabase as the backend database.
   - Ensure Supabase project credentials are set in the `.env` file.
   - Apply any required migrations or schema updates via Supabase dashboard or CLI.

6. **Deployment**
   - Build the frontend for production:  
     ```
     npm run build
     ```
   - Deploy the backend and frontend to your chosen hosting platforms (e.g., Vercel, Netlify for frontend; Render, Heroku, or similar for backend).
   - Set environment variables on the deployment platform as needed.

7. **Monitoring & Maintenance**
   - Monitor logs and error reports.
   - Regularly update dependencies and review security alerts.

**Note:**  
Refer to the respective `README.md` files in the `Frontend` and `Backend` directories for more detailed setup and deployment instructions.

## Tech Stack

### Frontend

*   *Framework:* React.js
*   *Language:* TypeScript
*   *Build Tool:* Vite
*   *Styling:* Tailwind CSS, shadcn, lucide-react 
*   *Routing:* ReactDOM

### Backend

*   *Runtime:* Node.js
*   *Framework:* Express.js (inferred)
*   *Database:* Supabase

## Team Members

*   Harikrishnan B
*   Ashwin S
*   Suhana Sulfeekker
*   Nikhil M
*   Nikith Rajan
