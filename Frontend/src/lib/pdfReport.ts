import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { orderAPI, inventoryAPI, salesStatsAPI, stockMonitorAPI } from './api';

interface ReportData {
  orders: any[];
  products: any[];
  salesStats: any;
  lowStockItems: any[];
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const generateOrderBill = (order: any) => {
  // --- Page Setup ---
  const receiptWidth = 80; // in mm
  const pageHeight = 175;
  const doc = new jsPDF({
    unit: 'mm',
    format: [receiptWidth, pageHeight],
  });
  
  // Set a monospaced font
  doc.setFont("courier", "normal");
  const leftMargin = 5;
  const rightMargin = receiptWidth - 5;
  let currentY = 10;

  // --- Header ---
  doc.setFontSize(14);
  doc.text("INVENTRA", receiptWidth / 2, currentY, { align: 'center' });
  currentY += 5;
  doc.setFontSize(8);
  doc.text("Kochi, Kerala", receiptWidth / 2, currentY, { align: 'center' });
  currentY += 10;
  
  doc.text(`Order #: ${order.order_id}`, leftMargin, currentY);
  doc.text(new Date(order.order_date).toLocaleString(), rightMargin, currentY, { align: 'right' });
  currentY += 5;
  
  doc.text(`Customer: ${order.customer?.name || 'N/A'}`, leftMargin, currentY);
  currentY += 8;

  // --- Line Separator ---
  doc.text("---------------------------------", receiptWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  // --- Items ---
  (order.items || []).forEach(item => {
    const itemName = item.name;
    const subtotal = `Rs${(item.price * item.quantity).toFixed(2)}`;
    doc.text(itemName, leftMargin, currentY);
    doc.text(subtotal, rightMargin, currentY, { align: 'right' });
    currentY += 4;
    doc.text(`${item.quantity} x Rs${item.price.toFixed(2)}`, leftMargin + 2, currentY);
    currentY += 6;
  });

  // --- Line Separator ---
  doc.text("---------------------------------", receiptWidth / 2, currentY, { align: 'center' });
  currentY += 6;

  // --- Total ---
  doc.setFont("courier", "bold");
  doc.text("TOTAL AMOUNT", leftMargin, currentY);
  doc.text(`Rs${order.total_price.toFixed(2)}`, rightMargin, currentY, { align: 'right' });
  currentY += 10;

  // --- Footer ---
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.text("Thank You!", receiptWidth / 2, currentY, { align: 'center' });
  
  // --- CANCELLED WATERMARK ---
  if (order.status === 'cancelled') {
    doc.setFontSize(30);
    doc.setFont("courier", "bold");
    doc.setTextColor(200, 0, 0); // Red color

    // Calculate center for the narrow receipt and place it
    const centerX = receiptWidth / 2;
    const centerY = 70; // Position it vertically in the middle of the items

    doc.text("CANCELLED", centerX, centerY, {
      angle: 30, // Angle the text
      align: 'center'
    });
  }
  
  // --- Download ---
  doc.save(`Receipt_Order_${order.order_id}.pdf`);
};

export class PDFReportGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  async generateDetailedReport(): Promise<void> {
    try {
      const reportData = await this.fetchReportData();
      
      this.createHeader();
      this.createSummarySection(reportData);
      this.createOrdersTable(reportData.orders);
      this.createProductsTable(reportData.products);
      this.createLowStockSection(reportData.lowStockItems);
      this.createRevenueChart(reportData);
      
      this.doc.save('inventory-management-report.pdf');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }

  async generateMinimalisticReport(): Promise<void> {
    try {
      const reportData = await this.fetchReportData();
      this.doc = new jsPDF();
      
      this.createMinimalisticHeader();
      this.createMinimalisticSummary(reportData);
      
      if (reportData.lowStockItems.length > 0) {
        this.createLowStockSection(reportData.lowStockItems);
      }

      this.doc.save('minimalistic-report.pdf');
    } catch (error) {
      console.error('Error generating minimalistic report:', error);
      throw error;
    }
  }

  async generateSalesReport(): Promise<void> {
    try {
      const reportData = await this.fetchReportData();
      
      this.doc = new jsPDF();
      this.createHeader();
      this.createSalesSummary(reportData);
      this.createOrdersTable(reportData.orders);
      
      this.doc.save('sales-report.pdf');
    } catch (error) {
      console.error('Error generating sales report:', error);
      throw error;
    }
  }

  async generateInventoryReport(): Promise<void> {
    try {
      const reportData = await this.fetchReportData();
      
      this.doc = new jsPDF();
      this.createHeader();
      this.createInventorySummary(reportData);
      this.createProductsTable(reportData.products);
      this.createLowStockSection(reportData.lowStockItems);
      
      this.doc.save('inventory-report.pdf');
    } catch (error) {
      console.error('Error generating inventory report:', error);
      throw error;
    }
  }

  async generateSummaryReport(): Promise<void> {
    try {
      const reportData = await this.fetchReportData();
      
      this.doc = new jsPDF();
      this.createHeader();
      this.createSummarySection(reportData);
      
      this.doc.save('summary-report.pdf');
    } catch (error) {
      console.error('Error generating summary report:', error);
      throw error;
    }
  }

  async generateAvailableStocksReport(): Promise<void> {
    try {
      const reportData = await this.fetchReportData();
      
      this.doc = new jsPDF();
      this.createHeader();
      this.createAvailableStocksTable(reportData.products);
      
      this.doc.save('available-stocks-report.pdf');
    } catch (error) {
      console.error('Error generating available stocks report:', error);
      throw error;
    }
  }

  async generateCancelledOrdersReport(): Promise<void> {
    try {
      const reportData = await this.fetchReportData();
      const cancelledOrders = reportData.orders.filter((order: any) => order.status === 'cancelled');
      
      this.doc = new jsPDF();
      this.createHeader();
      this.createCancelledOrdersTable(cancelledOrders);
      
      this.doc.save('cancelled-orders-report.pdf');
    } catch (error) {
      console.error('Error generating cancelled orders report:', error);
      throw error;
    }
  }

  async generatePendingOrdersReport(): Promise<void> {
    try {
      const reportData = await this.fetchReportData();
      const pendingOrders = reportData.orders.filter((order: any) => order.status === 'pending');
      
      this.doc = new jsPDF();
      this.createHeader();
      this.createPendingOrdersTable(pendingOrders);
      
      this.doc.save('pending-orders-report.pdf');
    } catch (error) {
      console.error('Error generating pending orders report:', error);
      throw error;
    }
  }

  private async fetchReportData(): Promise<ReportData> {
    try {
      const [ordersResponse, productsResponse, salesStatsResponse, lowStockResponse] = await Promise.all([
        orderAPI.getAll(),
        inventoryAPI.getAll(),
        salesStatsAPI.getStats(),
        stockMonitorAPI.getLowStock()
      ]);

      const orders = ordersResponse.data.orders || [];
      const products = productsResponse.data || [];
      const salesStats = salesStatsResponse.data || {};
      const lowStockItems = lowStockResponse.data.items || [];

      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0);
      const totalOrders = orders.length;
      const totalProducts = products.length;
      const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
      const completedOrders = orders.filter((order: any) => order.status === 'completed').length;
      const cancelledOrders = orders.filter((order: any) => order.status === 'cancelled').length;

      return {
        orders,
        products,
        salesStats,
        lowStockItems,
        totalRevenue,
        totalOrders,
        totalProducts,
        pendingOrders,
        completedOrders,
        cancelledOrders
      };
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  }

  private createHeader(): void {
    this.doc.setFontSize(24);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Inventory Management Report', 105, 20, { align: 'center' });
    
    this.doc.setFontSize(12);
    this.doc.setTextColor(127, 140, 141);
    this.doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
    this.doc.text(`Time: ${new Date().toLocaleTimeString('en-IN')}`, 105, 37, { align: 'center' });
    
    this.doc.line(20, 45, 190, 45);
  }

  private createMinimalisticHeader(): void {
    this.doc.setFontSize(18);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Inventory Status Report', 105, 25, { align: 'center' });
    this.doc.setFontSize(10);
    this.doc.setTextColor(127, 140, 141);
    this.doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 105, 35, { align: 'center' });
    this.doc.line(20, 42, 190, 42);
  }

  private createSummarySection(data: ReportData): void {
    this.doc.setFontSize(16);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Executive Summary', 20, 60);

    this.doc.setFontSize(10);
    this.doc.setTextColor(52, 73, 94);
    
    const summaryData = [
      ['Total Revenue', `₹${data.totalRevenue.toLocaleString('en-IN')}`],
      ['Total Orders', data.totalOrders.toString()],
      ['Total Products', data.totalProducts.toString()],
      ['Pending Orders', data.pendingOrders.toString()],
      ['Completed Orders', data.completedOrders.toString()],
      ['Cancelled Orders', data.cancelledOrders.toString()],
      ['Low Stock Items', data.lowStockItems.length.toString()]
    ];

    autoTable(this.doc, {
      startY: 70,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      styles: {
        cellPadding: 5
      }
    });
  }

  private createMinimalisticSummary(data: ReportData): void {
    this.doc.setFontSize(14);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Key Metrics', 20, 55);
  
    const summaryData = [
      ['Total Products', data.totalProducts.toString()],
      ['Total Orders', data.totalOrders.toString()],
      ['Low Stock Items', data.lowStockItems.length.toString()],
      ['Total Revenue', `₹${data.totalRevenue.toLocaleString('en-IN')}`]
    ];
  
    autoTable(this.doc, {
      startY: 65,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'plain', 
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 44,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      styles: {
        cellPadding: 3
      }
    });
  }

  private createOrdersTable(orders: any[]): void {
    const startY = (this.doc as any).lastAutoTable?.finalY || 60;
    
    if (orders.length === 0) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(127, 140, 141);
      this.doc.text('No orders found', 20, startY + 20);
      return;
    }

    this.doc.setFontSize(14);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Recent Orders', 20, startY + 20);

    const ordersData = orders.slice(0, 10).map((order: any) => [
      order.order_id || order.id,
      order.customer?.name || 'Unknown',
      order.status,
      `₹${(order.total_price || 0).toFixed(2)}`,
      new Date(order.order_date || order.created_at).toLocaleDateString('en-IN')
    ]);

    autoTable(this.doc, {
      startY: startY + 25,
      head: [['Order ID', 'Customer', 'Status', 'Amount', 'Date']],
      body: ordersData,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      styles: {
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 }
      }
    });
  }

  private createProductsTable(products: any[]): void {
    const startY = (this.doc as any).lastAutoTable?.finalY || 60;
    
    if (products.length === 0) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(127, 140, 141);
      this.doc.text('No products found', 20, startY + 20);
      return;
    }

    this.doc.setFontSize(14);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Product Inventory', 20, startY + 20);

    const productsData = products.slice(0, 15).map((product: any) => [
      product.name,
      product.code || product.id,
      product.quantity?.toString() || product.stock_quantity?.toString() || '0',
      `₹${(product.price || 0).toFixed(2)}`,
      product.category_id || 'N/A'
    ]);

    autoTable(this.doc, {
      startY: startY + 25,
      head: [['Product Name', 'Code', 'Stock', 'Price', 'Category']],
      body: productsData,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      styles: {
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 }
      }
    });
  }

  private createLowStockSection(lowStockItems: any[]): void {
    if (lowStockItems.length === 0) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(127, 140, 141);
      this.doc.text('No low stock items', 20, ((this.doc as any).lastAutoTable?.finalY || 0) + 20);
      return;
    }

    this.doc.setFontSize(14);
    this.doc.setTextColor(231, 76, 60);
    this.doc.text('Low Stock Alert', 20, ((this.doc as any).lastAutoTable?.finalY || 0) + 20);

    const lowStockData = lowStockItems.map((item: any) => [
      item.name,
      item.quantity?.toString() || item.stock_quantity?.toString() || '0',
      '10',
      item.code || 'N/A'
    ]);

    autoTable(this.doc, {
      startY: ((this.doc as any).lastAutoTable?.finalY || 0) + 25,
      head: [['Product Name', 'Current Stock', 'Threshold', 'Code']],
      body: lowStockData,
      theme: 'grid',
      headStyles: {
        fillColor: [231, 76, 60],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      styles: {
        cellPadding: 3
      }
    });
  }

  private createRevenueChart(data: ReportData): void {
    this.doc.setFontSize(14);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Revenue Analysis', 20, ((this.doc as any).lastAutoTable?.finalY || 0) + 20);

    this.doc.setFontSize(10);
    this.doc.setTextColor(52, 73, 94);
    
    const revenuePercentage = data.totalOrders > 0 ? (data.completedOrders / data.totalOrders) * 100 : 0;
    const pendingPercentage = data.totalOrders > 0 ? (data.pendingOrders / data.totalOrders) * 100 : 0;
    const cancelledPercentage = data.totalOrders > 0 ? (data.cancelledOrders / data.totalOrders) * 100 : 0;

    this.doc.text(`Total Revenue: ₹${data.totalRevenue.toLocaleString('en-IN')}`, 20, ((this.doc as any).lastAutoTable?.finalY || 0) + 35);
    this.doc.text(`Order Completion Rate: ${revenuePercentage.toFixed(1)}%`, 20, ((this.doc as any).lastAutoTable?.finalY || 0) + 45);
    this.doc.text(`Pending Orders: ${pendingPercentage.toFixed(1)}%`, 20, ((this.doc as any).lastAutoTable?.finalY || 0) + 55);
    this.doc.text(`Cancellation Rate: ${cancelledPercentage.toFixed(1)}%`, 20, ((this.doc as any).lastAutoTable?.finalY || 0) + 65);
  }

  private createSalesSummary(data: ReportData): void {
    this.doc.setFontSize(16);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Sales Summary', 20, 60);

    this.doc.setFontSize(10);
    this.doc.setTextColor(52, 73, 94);
    
    const salesData = [
      ['Total Revenue', `₹${data.totalRevenue.toLocaleString('en-IN')}`],
      ['Total Orders', data.totalOrders.toString()],
      ['Completed Orders', data.completedOrders.toString()],
      ['Pending Orders', data.pendingOrders.toString()],
      ['Cancelled Orders', data.cancelledOrders.toString()],
      ['Average Order Value', `₹${data.totalOrders > 0 ? (data.totalRevenue / data.totalOrders).toFixed(2) : '0.00'}`]
    ];

    autoTable(this.doc, {
      startY: 70,
      head: [['Metric', 'Value']],
      body: salesData,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      styles: {
        cellPadding: 5
      }
    });
  }

  private createInventorySummary(data: ReportData): void {
    this.doc.setFontSize(16);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Inventory Summary', 20, 60);

    this.doc.setFontSize(10);
    this.doc.setTextColor(52, 73, 94);
    
    const inventoryData = [
      ['Total Products', data.totalProducts.toString()],
      ['Low Stock Items', data.lowStockItems.length.toString()],
      ['Total Stock Value', `₹${data.products.reduce((sum: number, product: any) => sum + ((product.price || 0) * (product.quantity || product.stock_quantity || 0)), 0).toLocaleString('en-IN')}`],
      ['Average Product Price', `₹${data.totalProducts > 0 ? (data.products.reduce((sum: number, product: any) => sum + (product.price || 0), 0) / data.totalProducts).toFixed(2) : '0.00'}`]
    ];

    autoTable(this.doc, {
      startY: 70,
      head: [['Metric', 'Value']],
      body: inventoryData,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      styles: {
        cellPadding: 5
      }
    });
  }

  private createAvailableStocksTable(products: any[]): void {
    const startY = (this.doc as any).lastAutoTable?.finalY || 60;
    
    if (products.length === 0) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(127, 140, 141);
      this.doc.text('No products found', 20, startY + 20);
      return;
    }

    this.doc.setFontSize(14);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Available Stocks', 20, startY + 20);

    const stocksData = products.map((product: any) => [
      product.name,
      product.code || product.id,
      product.quantity?.toString() || product.stock_quantity?.toString() || '0',
      `₹${(product.price || 0).toFixed(2)}`,
      product.category_id || 'N/A'
    ]);

    autoTable(this.doc, {
      startY: startY + 25,
      head: [['Product Name', 'Code', 'Stock', 'Price', 'Category']],
      body: stocksData,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      styles: {
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 }
      }
    });
  }

  private createCancelledOrdersTable(cancelledOrders: any[]): void {
    const startY = (this.doc as any).lastAutoTable?.finalY || 60;
    
    if (cancelledOrders.length === 0) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(127, 140, 141);
      this.doc.text('No cancelled orders found', 20, startY + 20);
      return;
    }

    this.doc.setFontSize(14);
    this.doc.setTextColor(231, 76, 60);
    this.doc.text('Cancelled Orders', 20, startY + 20);

    const cancelledOrdersData = cancelledOrders.map((order: any) => [
      order.order_id || order.id,
      order.customer?.name || 'Unknown',
      order.status,
      `₹${(order.total_price || 0).toFixed(2)}`,
      new Date(order.order_date || order.created_at).toLocaleDateString('en-IN')
    ]);

    autoTable(this.doc, {
      startY: startY + 25,
      head: [['Order ID', 'Customer', 'Status', 'Amount', 'Date']],
      body: cancelledOrdersData,
      theme: 'grid',
      headStyles: {
        fillColor: [231, 76, 60],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      styles: {
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 }
      }
    });
  }

  private createPendingOrdersTable(pendingOrders: any[]): void {
    const startY = (this.doc as any).lastAutoTable?.finalY || 60;
    
    if (pendingOrders.length === 0) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(127, 140, 141);
      this.doc.text('No pending orders found', 20, startY + 20);
      return;
    }

    this.doc.setFontSize(14);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Pending Orders', 20, startY + 20);

    const pendingOrdersData = pendingOrders.map((order: any) => [
      order.order_id || order.id,
      order.customer?.name || 'Unknown',
      order.status,
      `₹${(order.total_price || 0).toFixed(2)}`,
      new Date(order.order_date || order.created_at).toLocaleDateString('en-IN')
    ]);

    autoTable(this.doc, {
      startY: startY + 25,
      head: [['Order ID', 'Customer', 'Status', 'Amount', 'Date']],
      body: pendingOrdersData,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      styles: {
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 }
      }
    });
  }
}

export const pdfReportGenerator = new PDFReportGenerator();