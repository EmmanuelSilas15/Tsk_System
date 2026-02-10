'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Car, Save, Download, RefreshCw, Calculator, FileText, Mail, History, X, Eye, Trash2, Copy, Search, Filter, SortAsc, SortDesc, Calendar, DollarSign, User, Home, Printer, ChevronLeft, ChevronRight, Database, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Define the invoice type for TypeScript
interface InvoiceData {
  id: string;
  make: string;
  model: string;
  chassisNo: string;
  engineNo: string;
  kilometers: string;
  sellingPrice: string;
  vatAmount: string;
  year: string;
  condition: string;
  licenseNo: string;
  color: string;
  totalSellingPrice: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  invoiceNumber: string;
  date: string;
  address: string;
  notes: string;
  createdAt: string;
}

export default function VehicleFormPage() {
  const [formData, setFormData] = useState({
    make: 'TOYOTA',
    model: 'FORTUNER 4.0 V6 AVT 4X4',
    mmCode: '60054440',
    chassisNo: 'AHTYUS9GX04002340',
    engineNo: '1GRD881161',
    registerNo: '',
    kilometers: '314596',
    sellingPrice: '104347.83',
    vatAmount: '',
    year: '2007',
    condition: 'USED',
    licenseNo: 'DSK65GM',
    color: 'Silver',
    totalSellingPrice: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleDateString('en-ZA'),
    address: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState<InvoiceData[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 12;
  const invoiceRef = useRef<HTMLDivElement>(null);
  const VAT_RATE = 0.15; // 15% VAT

  // Bank Information
  const bankInfo = {
    name: 'FNB',
    accountNumber: '63193229482',
    holderName: 'TSK Auto',
    branchNumber: '250655',
    swiftCode: 'FIRNZAJJ'
  };

  // Load invoice history from localStorage on component mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem('tsk_auto_invoices');
    if (savedInvoices) {
      try {
        const parsedInvoices = JSON.parse(savedInvoices);
        setInvoiceHistory(parsedInvoices);
      } catch (error) {
        console.error('Error loading invoice history:', error);
      }
    }
  }, []);

  // Filter and sort invoices
  const filteredInvoiceHistory = invoiceHistory.filter(invoice => {
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        (invoice.customerName && invoice.customerName.toLowerCase().includes(query)) ||
        (invoice.make && invoice.make.toLowerCase().includes(query)) ||
        (invoice.model && invoice.model.toLowerCase().includes(query)) ||
        (invoice.chassisNo && invoice.chassisNo.toLowerCase().includes(query)) ||
        (invoice.licenseNo && invoice.licenseNo.toLowerCase().includes(query)) ||
        (invoice.customerEmail && invoice.customerEmail.toLowerCase().includes(query))
      );
      if (!matchesSearch) return false;
    }

    // Apply date filter
    if (filterBy !== 'all') {
      const invoiceDate = new Date(invoice.createdAt);
      const today = new Date();
      const timeDiff = today.getTime() - invoiceDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

      switch (filterBy) {
        case 'today':
          if (daysDiff > 0) return false;
          break;
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
        case 'year':
          if (daysDiff > 365) return false;
          break;
      }
    }

    return true;
  }).sort((a, b) => {
    // Apply sorting
    let aValue, bValue;

    switch (sortBy) {
      case 'date':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'amount':
        aValue = parseFloat(a.totalSellingPrice) || 0;
        bValue = parseFloat(b.totalSellingPrice) || 0;
        break;
      case 'customer':
        aValue = (a.customerName || '').toLowerCase();
        bValue = (b.customerName || '').toLowerCase();
        break;
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoiceHistory.length / invoicesPerPage);
  const startIndex = (currentPage - 1) * invoicesPerPage;
  const paginatedInvoices = filteredInvoiceHistory.slice(startIndex, startIndex + invoicesPerPage);

  // Calculate statistics
  const calculateStats = () => {
    const totalInvoices = filteredInvoiceHistory.length;
    const totalRevenue = filteredInvoiceHistory.reduce((sum, invoice) => 
      sum + parseFloat(invoice.totalSellingPrice || '0'), 0
    );
    const totalVAT = filteredInvoiceHistory.reduce((sum, invoice) => 
      sum + parseFloat(invoice.vatAmount || '0'), 0
    );
    const avgInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    
    // Find highest and lowest invoices
    const highestInvoice = filteredInvoiceHistory.length > 0 
      ? filteredInvoiceHistory.reduce((max, invoice) => 
          parseFloat(invoice.totalSellingPrice) > parseFloat(max.totalSellingPrice) ? invoice : max
        )
      : null;
    
    const lowestInvoice = filteredInvoiceHistory.length > 0 
      ? filteredInvoiceHistory.reduce((min, invoice) => 
          parseFloat(invoice.totalSellingPrice) < parseFloat(min.totalSellingPrice) ? invoice : min
        )
      : null;

    return {
      totalInvoices,
      totalRevenue,
      totalVAT,
      avgInvoice,
      highestInvoice,
      lowestInvoice
    };
  };

  const stats = calculateStats();

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showHistory) {
        setShowHistory(false);
        setSearchQuery('');
      }
      if (e.key === '/' && showHistory) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) (searchInput as HTMLInputElement).focus();
      }
      if (e.key === 'ArrowLeft' && showHistory && currentPage > 1) {
        e.preventDefault();
        setCurrentPage(prev => prev - 1);
      }
      if (e.key === 'ArrowRight' && showHistory && currentPage < totalPages) {
        e.preventDefault();
        setCurrentPage(prev => prev + 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHistory, currentPage, totalPages]);

  // Calculate VAT and Total whenever sellingPrice changes
  useEffect(() => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const vatAmount = sellingPrice * VAT_RATE;
    const totalSellingPrice = sellingPrice + vatAmount;
    
    setFormData(prev => ({
      ...prev,
      vatAmount: vatAmount.toFixed(2),
      totalSellingPrice: totalSellingPrice.toFixed(2)
    }));
  }, [formData.sellingPrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Remove any non-numeric characters except decimal point for price fields
    let processedValue = value;
    if (name === 'sellingPrice') {
      processedValue = value.replace(/[^0-9.]/g, '');
    } else if (name === 'kilometers' || name === 'year') {
      processedValue = value.replace(/[^0-9]/g, '');
    } else if (name === 'customerPhone') {
      processedValue = value.replace(/[^0-9+-\s]/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Calculate final values before submission
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const vatAmount = sellingPrice * VAT_RATE;
    const totalSellingPrice = sellingPrice + vatAmount;
    
    const finalData = {
      ...formData,
      vatAmount: vatAmount.toFixed(2),
      totalSellingPrice: totalSellingPrice.toFixed(2),
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-ZA')
    };
    
    setFormData(finalData);
    
    // Save to invoice history
    const invoiceToSave: InvoiceData = {
      ...finalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    const updatedHistory = [invoiceToSave, ...invoiceHistory.slice(0, 199)]; // Keep last 200 invoices
    setInvoiceHistory(updatedHistory);
    localStorage.setItem('tsk_auto_invoices', JSON.stringify(updatedHistory));
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', finalData);
      alert('Vehicle details saved successfully!');
      setLoading(false);
    }, 1500);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all fields?')) {
      setFormData({
        make: '',
        model: '',
        mmCode: '',
        chassisNo: '',
        engineNo: '',
        registerNo: '',
        kilometers: '',
        sellingPrice: '',
        vatAmount: '',
        year: '',
        condition: 'USED',
        licenseNo: '',
        color: '',
        totalSellingPrice: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('en-ZA'),
        address: '',
        notes: ''
      });
    }
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) {
      alert('Invoice element not found!');
      return;
    }
    
    setDownloading(true);
    
    try {
      const element = invoiceRef.current;
      
      // Store original styles
      const originalWidth = element.style.width;
      const originalHeight = element.style.height;
      const originalPadding = element.style.padding;
      
      // Set optimal styles for PDF capture
      element.style.width = '210mm';
      element.style.minHeight = 'auto';
      element.style.background = '#ffffff';
      element.style.padding = '20px';
      
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 210 * 3.78, // Convert mm to pixels
        height: element.scrollHeight,
        windowWidth: 210 * 3.78,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('invoice-for-pdf');
          if (clonedElement) {
            clonedElement.style.width = '210mm';
            clonedElement.style.minHeight = 'auto';
            clonedElement.style.background = '#ffffff';
          }
        }
      });
      
      // Restore original styles
      element.style.width = originalWidth;
      element.style.height = originalHeight;
      element.style.padding = originalPadding;
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: imgHeight > 297 ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add image to PDF
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename
      const filename = `TSK-AUTO-Invoice-${formData.invoiceNumber}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
      alert('Invoice PDF downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Fallback: Create a simple PDF without canvas rendering
      try {
        const pdf = new jsPDF();
        pdf.setFontSize(20);
        pdf.text('TSK AUTO INVOICE', 105, 20, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text(`Invoice: ${formData.invoiceNumber}`, 20, 40);
        pdf.text(`Date: ${formData.date}`, 20, 50);
        pdf.text(`Customer: ${formData.customerName || 'N/A'}`, 20, 60);
        pdf.text(`Vehicle: ${formData.make} ${formData.model}`, 20, 70);
        pdf.text(`Total: R ${formatCurrency(formData.totalSellingPrice)}`, 20, 80);
        pdf.text('Bank Details:', 20, 100);
        pdf.text(`${bankInfo.name} - ${bankInfo.accountNumber}`, 20, 110);
        pdf.text(`Account Holder: ${bankInfo.holderName}`, 20, 120);
        pdf.text(`Reference: ${formData.invoiceNumber}`, 20, 130);
        pdf.save(`TSK-Invoice-${formData.invoiceNumber}.pdf`);
        alert('Basic PDF generated successfully!');
      } catch (fallbackError) {
        console.error('Fallback PDF generation failed:', fallbackError);
        alert('Error generating PDF. Please try again.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const sendEmail = () => {
    if (!formData.customerEmail) {
      alert('Please enter customer email to send invoice.');
      return;
    }
    
    const subject = `TSK Auto Invoice ${formData.invoiceNumber} - ${formData.make} ${formData.model}`;
    const body = `Dear ${formData.customerName || 'Customer'},

Thank you for your business with TSK Auto.

Invoice: ${formData.invoiceNumber}
Date: ${formData.date}

Vehicle Details:
${formData.make} ${formData.model}
Year: ${formData.year}
Color: ${formData.color}
Chassis: ${formData.chassisNo}

Total Amount: R ${formatCurrency(formData.totalSellingPrice)}

Payment Details:
Bank: ${bankInfo.name}
Account Holder: ${bankInfo.holderName}
Account Number: ${bankInfo.accountNumber}
Branch Code: ${bankInfo.branchNumber}
Swift Code: ${bankInfo.swiftCode}

Please find the attached invoice PDF.

Best regards,
TSK Auto Team`;

    window.location.href = `mailto:${formData.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Format currency display
  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format date with time for detailed view
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load invoice into form
  const loadInvoice = (invoice: InvoiceData) => {
    setFormData({
      make: invoice.make,
      model: invoice.model,
      mmCode: '',
      chassisNo: invoice.chassisNo,
      engineNo: invoice.engineNo,
      registerNo: '',
      kilometers: invoice.kilometers,
      sellingPrice: invoice.sellingPrice,
      vatAmount: invoice.vatAmount,
      year: invoice.year,
      condition: invoice.condition,
      licenseNo: invoice.licenseNo,
      color: invoice.color,
      totalSellingPrice: invoice.totalSellingPrice,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerPhone: invoice.customerPhone,
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date,
      address: invoice.address,
      notes: invoice.notes
    });
    setShowHistory(false);
    setSearchQuery('');
    alert(`Invoice ${invoice.invoiceNumber} loaded successfully!`);
  };

  // Delete invoice from history
  const deleteInvoice = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice from history?')) {
      const updatedHistory = invoiceHistory.filter(invoice => invoice.id !== id);
      setInvoiceHistory(updatedHistory);
      localStorage.setItem('tsk_auto_invoices', JSON.stringify(updatedHistory));
      alert('Invoice deleted from history!');
    }
  };

  // Clear all history
  const clearHistory = () => {
    if (confirm('Are you sure you want to clear ALL invoice history? This action cannot be undone.')) {
      setInvoiceHistory([]);
      setSearchQuery('');
      localStorage.removeItem('tsk_auto_invoices');
      alert('All invoice history cleared!');
    }
  };

  // View invoice details
  const viewInvoiceDetails = (invoice: InvoiceData) => {
    setSelectedInvoice(invoice);
  };

  // Copy invoice number to clipboard
  const copyInvoiceNumber = (invoiceNumber: string) => {
    navigator.clipboard.writeText(invoiceNumber);
    alert(`Invoice number ${invoiceNumber} copied to clipboard!`);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Export all invoices as CSV
  const exportToCSV = () => {
    if (filteredInvoiceHistory.length === 0) {
      alert('No invoices to export!');
      return;
    }

    const headers = ['Invoice Number', 'Date', 'Customer Name', 'Email', 'Phone', 'Make', 'Model', 'Year', 'Color', 'Condition', 'Kilometers', 'Selling Price', 'VAT Amount', 'Total Price', 'Chassis No', 'License No', 'Address', 'Notes'];
    
    const csvContent = [
      headers.join(','),
      ...filteredInvoiceHistory.map(invoice => [
        invoice.invoiceNumber,
        invoice.date,
        `"${invoice.customerName}"`,
        invoice.customerEmail,
        invoice.customerPhone,
        invoice.make,
        invoice.model,
        invoice.year,
        invoice.color,
        invoice.condition,
        invoice.kilometers,
        invoice.sellingPrice,
        invoice.vatAmount,
        invoice.totalSellingPrice,
        invoice.chassisNo,
        invoice.licenseNo,
        `"${invoice.address}"`,
        `"${invoice.notes}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `TSK-Invoices-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print invoice history
  const printHistory = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>TSK Auto Invoice History</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #2563eb; }
              .stats { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .stat-item { margin: 10px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #2563eb; color: white; }
              .total-row { font-weight: bold; background-color: #f0f9ff; }
            </style>
          </head>
          <body>
            <h1>TSK Auto Invoice History</h1>
            <div class="stats">
              <h3>Summary Statistics</h3>
              <div class="stat-item">Total Invoices: ${stats.totalInvoices}</div>
              <div class="stat-item">Total Revenue: R ${formatCurrency(stats.totalRevenue.toString())}</div>
              <div class="stat-item">Total VAT: R ${formatCurrency(stats.totalVAT.toString())}</div>
              <div class="stat-item">Average Invoice: R ${formatCurrency(stats.avgInvoice.toString())}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Year</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                ${filteredInvoiceHistory.map(invoice => `
                  <tr>
                    <td>${invoice.invoiceNumber}</td>
                    <td>${invoice.date}</td>
                    <td>${invoice.customerName || 'N/A'}</td>
                    <td>${invoice.make} ${invoice.model}</td>
                    <td>${invoice.year}</td>
                    <td>R ${formatCurrency(invoice.totalSellingPrice)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="5" style="text-align: right;">Total:</td>
                  <td>R ${formatCurrency(stats.totalRevenue.toString())}</td>
                </tr>
              </tbody>
            </table>
            <div style="margin-top: 30px; font-size: 12px; color: #666;">
              Generated on ${new Date().toLocaleDateString('en-ZA')}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Main content - show either form or history
  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
        {/* Top Navigation */}
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowHistory(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Back to Form
                </button>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Invoice History
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage and analyze all your invoices
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {invoiceHistory.length} invoices stored
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={printHistory}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    title="Print History"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden md:inline">Export</span>
                  </button>
                  
                  <button
                    onClick={clearHistory}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden md:inline">Clear All</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalInvoices}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">R {formatCurrency(stats.totalRevenue.toString())}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Including 15% VAT</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Invoice</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">R {formatCurrency(stats.avgInvoice.toString())}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Per transaction</p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total VAT</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">R {formatCurrency(stats.totalVAT.toString())}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Collected</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          {stats.highestInvoice && stats.lowestInvoice && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Highest Invoice</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Most valuable transaction</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    R {formatCurrency(stats.highestInvoice.totalSellingPrice)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.highestInvoice.invoiceNumber} • {stats.highestInvoice.customerName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.highestInvoice.make} {stats.highestInvoice.model} • {stats.highestInvoice.year}
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 rotate-180" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Lowest Invoice</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Least valuable transaction</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    R {formatCurrency(stats.lowestInvoice.totalSellingPrice)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.lowestInvoice.invoiceNumber} • {stats.lowestInvoice.customerName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.lowestInvoice.make} {stats.lowestInvoice.model} • {stats.lowestInvoice.year}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Left: Search */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search invoices by number, customer, vehicle, chassis, or email..."
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Center: View Mode */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Table
                </button>
              </div>

              {/* Right: Filters & Sort */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as any)}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="customer">Sort by Customer</option>
                  </select>
                  <button
                    onClick={toggleSortOrder}
                    className="p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    {sortOrder === 'asc' ? (
                      <SortAsc className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <SortDesc className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Info Bar */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4 mb-2 sm:mb-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Total: {invoiceHistory.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Showing: {filteredInvoiceHistory.length}</span>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear Search
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
                  Press "/" to search • "Esc" to go back
                </div>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Content */}
          {filteredInvoiceHistory.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              {searchQuery ? (
                <>
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    No invoices found for "{searchQuery}"
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mx-auto mb-8">
                    Try searching by invoice number, customer name, vehicle make/model, or chassis number.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    No invoice history yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mx-auto mb-8">
                    Your saved invoices will appear here after you save them using the "Save & Generate Invoice" button.
                  </p>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Create Your First Invoice
                  </button>
                </>
              )}
            </div>
          ) : viewMode === 'table' ? (
            // Table View
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</span>
                            <button
                              onClick={() => copyInvoiceNumber(invoice.invoiceNumber)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                              title="Copy invoice number"
                            >
                              <Copy className="w-3 h-3 text-gray-500" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDateTime(invoice.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{invoice.date}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{invoice.year}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.customerName || 'N/A'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{invoice.customerEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.make} {invoice.model}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{invoice.condition} • {invoice.color}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">R {formatCurrency(invoice.totalSellingPrice)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">VAT: R {formatCurrency(invoice.vatAmount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => viewInvoiceDetails(invoice)}
                              className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                            <button
                              onClick={() => loadInvoice(invoice)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => deleteInvoice(invoice.id)}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                            {invoice.invoiceNumber}
                          </span>
                          <button
                            onClick={() => copyInvoiceNumber(invoice.invoiceNumber)}
                            className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="Copy invoice number"
                          >
                            <Copy className="w-3 h-3 text-blue-500" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(invoice.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-full">
                          R {formatCurrency(invoice.totalSellingPrice)}
                        </span>
                        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          VAT: R {formatCurrency(invoice.vatAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {invoice.customerName || 'No Name'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {invoice.customerEmail && (
                          <p className="truncate">{invoice.customerEmail}</p>
                        )}
                        {invoice.customerPhone && (
                          <p>{invoice.customerPhone}</p>
                        )}
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          Vehicle Details
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Make & Model</p>
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {invoice.make} {invoice.model}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Year</p>
                          <p className="font-medium text-gray-900 dark:text-white">{invoice.year}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Color</p>
                          <p className="font-medium text-gray-900 dark:text-white">{invoice.color || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Condition</p>
                          <p className="font-medium text-gray-900 dark:text-white">{invoice.condition}</p>
                        </div>
                      </div>
                      {invoice.chassisNo && (
                        <div className="mt-2 text-xs">
                          <p className="text-gray-500 dark:text-gray-400">Chassis: </p>
                          <p className="font-mono text-gray-700 dark:text-gray-300 truncate">
                            {invoice.chassisNo}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewInvoiceDetails(invoice)}
                        className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => loadInvoice(invoice)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteInvoice(invoice.id)}
                        className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete invoice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg transition-colors ${currentPage === pageNum 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="text-gray-500">...</span>}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredInvoiceHistory.length} of {invoiceHistory.length} invoices
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  R {formatCurrency(stats.totalRevenue.toString())}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original Form Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-2xl">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Vehicle Details & Invoice
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Enter vehicle information and generate professional invoices
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                <History className="w-4 h-4" />
                Invoice History
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset All
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendEmail}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Invoice
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generatePDF}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Invoice
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Invoice Details Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Invoice Details
                    </h2>
                    <p className="text-sm text-blue-100">
                      {selectedInvoice.invoiceNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Invoice Info</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Invoice Number</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.invoiceNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                          <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedInvoice.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Customer Info</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Customer Name</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.customerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.customerEmail}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.customerPhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Vehicle Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Make & Model</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.make} {selectedInvoice.model}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Year</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.year}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Color</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.color}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Condition</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.condition}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Kilometers</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.kilometers} km</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Chassis No</p>
                        <p className="font-mono font-medium text-gray-900 dark:text-white text-sm">{selectedInvoice.chassisNo}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Pricing Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Selling Price</span>
                        <span className="font-medium text-gray-900 dark:text-white">R {formatCurrency(selectedInvoice.sellingPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">VAT (15%)</span>
                        <span className="font-medium text-green-600 dark:text-green-400">R {formatCurrency(selectedInvoice.vatAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-900 dark:text-white font-semibold">Total Amount</span>
                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400">R {formatCurrency(selectedInvoice.totalSellingPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedInvoice.notes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-gray-700 dark:text-gray-300">{selectedInvoice.notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        loadInvoice(selectedInvoice);
                        setSelectedInvoice(null);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Load This Invoice
                    </button>
                    <button
                      onClick={() => setSelectedInvoice(null)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-900">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Vehicle Information
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Fill in all vehicle details below
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                    <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      VAT: 15% Auto
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg border-b pb-2">
                      Vehicle Details
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Make *
                      </label>
                      <input
                        type="text"
                        name="make"
                        value={formData.make}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Model *
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Year *
                        </label>
                        <input
                          type="text"
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          maxLength={4}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Condition *
                        </label>
                        <select
                          name="condition"
                          value={formData.condition}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          <option value="USED">USED</option>
                          <option value="NEW">NEW</option>
                          <option value="DEMO">DEMO</option>
                          <option value="CERTIFIED">CERTIFIED</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Color
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Kilometers
                      </label>
                      <input
                        type="text"
                        name="kilometers"
                        value={formData.kilometers}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg border-b pb-2">
                      Customer Details
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Identification */}
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg border-b pb-2">
                    Vehicle Identification
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Chassis Number
                      </label>
                      <input
                        type="text"
                        name="chassisNo"
                        value={formData.chassisNo}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Engine Number
                      </label>
                      <input
                        type="text"
                        name="engineNo"
                        value={formData.engineNo}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        License Plate
                      </label>
                      <input
                        type="text"
                        name="licenseNo"
                        value={formData.licenseNo}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="mt-8 p-6 bg-blue-50 dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">
                    Pricing Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selling Price (excl VAT) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">R</span>
                        <input
                          type="text"
                          name="sellingPrice"
                          value={formData.sellingPrice}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        VAT Amount (15%)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">R</span>
                        <input
                          type="text"
                          value={formatCurrency(formData.vatAmount)}
                          readOnly
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-green-300 dark:border-green-600 rounded-lg text-lg font-medium text-green-600 dark:text-green-400"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded">
                            Auto
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total Price (incl VAT)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">R</span>
                        <input
                          type="text"
                          value={formatCurrency(formData.totalSellingPrice)}
                          readOnly
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-blue-300 dark:border-blue-600 rounded-lg text-lg font-medium text-blue-600 dark:text-blue-400 font-bold"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                            Auto
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Selling Price</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        R {formatCurrency(formData.sellingPrice)}
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">VAT (15%)</div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        R {formatCurrency(formData.vatAmount)}
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Price</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        R {formatCurrency(formData.totalSellingPrice)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Additional notes or terms..."
                  />
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Invoice Number: <span className="font-semibold text-blue-600">{formData.invoiceNumber}</span></p>
                    <p>Date: <span className="font-medium">{formData.date}</span></p>
                  </div>
                  
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      Clear All
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save & Generate Invoice
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right Column - Invoice Preview */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-8"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                      Invoice Preview
                    </h2>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-blue-100">
                    This is how your invoice will look in the PDF
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900">
                  {/* Invoice Template - PDF Optimized */}
                  <div
                    ref={invoiceRef}
                    id="invoice-for-pdf"
                    className="bg-white mx-auto scale-75 origin-top md:scale-100"
                    style={{ 
                      width: '210mm',
                      minHeight: '297mm',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      fontSize: '10px',
                      color: '#000000',
                      background: '#ffffff',
                      lineHeight: '1.3',
                      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                      transformOrigin: 'top'
                    }}
                  >
                    {/* Header Section - Modified with centered company info and logo */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #2563eb' }}>
                      {/* Left: Your Logo */}
                      <div style={{ width: '25%' }}>
                        <div style={{ 
                          width: '120px', 
                          height: '120px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                        }}>
                          <img 
                            src="/tsk_logo.png"
                            alt="TSK Auto Logo" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }} 
                          />
                        </div>
                      </div>

                      {/* Center: Company Information */}
                      <div style={{ width: '50%', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 5px 0' }}>TSK AUTO</h1>
                        <p style={{ fontSize: '14px', color: '#374151', fontWeight: '600', margin: '0 0 8px 0' }}>Vehicle Trading Specialists</p>
                        
                        <div style={{ fontSize: '10px', color: '#4b5563', lineHeight: '1.4' }}>
                          <p style={{ margin: '2px 0' }}>278 Weltevreden Road, Blackheath, Johannesburg</p>
                          <p style={{ margin: '2px 0' }}>Gauteng, South Africa • Postal Code: 2001</p>
                          <p style={{ margin: '2px 0' }}>Phone: +27 67 187 2085, +27 61 100 4801</p>
                          <p style={{ margin: '2px 0' }}>Email: Tskauto@gmail.com</p>
                        </div>
                      </div>

                      {/* Right: Invoice Details */}
                      <div style={{ width: '25%' }}>
                        <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px', textAlign: 'center' }}>TAX INVOICE</h2>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid #d1d5db' }}>
                              <span style={{ color: '#4b5563', fontWeight: '500' }}>Invoice #:</span>
                              <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '11px' }}>{formData.invoiceNumber}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid #d1d5db' }}>
                              <span style={{ color: '#4b5563', fontWeight: '500' }}>Date:</span>
                              <span style={{ fontWeight: '600', color: '#111827', fontSize: '11px' }}>{formData.date}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid #d1d5db' }}>
                              <span style={{ color: '#4b5563', fontWeight: '500' }}>VAT No:</span>
                              <span style={{ fontWeight: '600', color: '#111827', fontSize: '11px' }}>4850123456</span>
                            </div>
                            <div style={{ paddingTop: '4px' }}>
                              <p style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center' }}>This is a valid tax invoice</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bill To & Vehicle Info Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      {/* Bill To Section */}
                      <div>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', marginBottom: '6px', paddingBottom: '3px', borderBottom: '1px solid #d1d5db' }}>BILL TO</h3>
                        <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                          <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '12px', marginBottom: '4px' }}>{formData.customerName || '[Customer Name]'}</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', color: '#374151' }}>
                            <p>{formData.customerEmail || '[Email Address]'}</p>
                            <p>{formData.customerPhone || '[Phone Number]'}</p>
                            <p style={{ color: '#4b5563' }}>{formData.address || '[Customer Address]'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Info Section */}
                      <div>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', marginBottom: '6px', paddingBottom: '3px', borderBottom: '1px solid #d1d5db' }}>VEHICLE INFORMATION</h3>
                        <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                              <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>Make & Model</p>
                              <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '10px' }}>{formData.make} {formData.model}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>Year</p>
                              <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '10px' }}>{formData.year}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>Color</p>
                              <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '10px' }}>{formData.color || 'N/A'}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>Condition</p>
                              <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '10px' }}>{formData.condition}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>Kilometers</p>
                              <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '10px' }}>
                                {formData.kilometers ? `${parseInt(formData.kilometers).toLocaleString()} km` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>Chassis No</p>
                              <p style={{ fontFamily: 'monospace', fontSize: '9px', fontWeight: 'bold', color: '#111827' }}>{formData.chassisNo || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Table */}
                    <div style={{ marginBottom: '15px' }}>
                      <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', paddingBottom: '3px', borderBottom: '1px solid #d1d5db' }}>PRICING DETAILS</h3>
                      
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                            <th style={{ textAlign: 'left', padding: '6px', fontWeight: 'bold', color: '#2563eb', border: '1px solid #bfdbfe' }}>Description</th>
                            <th style={{ textAlign: 'left', padding: '6px', fontWeight: 'bold', color: '#2563eb', border: '1px solid #bfdbfe' }}>Quantity</th>
                            <th style={{ textAlign: 'left', padding: '6px', fontWeight: 'bold', color: '#2563eb', border: '1px solid #bfdbfe' }}>Unit Price</th>
                            <th style={{ textAlign: 'left', padding: '6px', fontWeight: 'bold', color: '#2563eb', border: '1px solid #bfdbfe' }}>Amount (ZAR)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ border: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '6px', border: '1px solid #e5e7eb' }}>
                              <div>
                                <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '10px' }}>{formData.make} {formData.model}</p>
                                <p style={{ fontSize: '9px', color: '#4b5563', marginTop: '2px' }}>Vehicle Purchase - {formData.year} {formData.condition}</p>
                                <p style={{ fontSize: '8px', color: '#6b7280', marginTop: '2px' }}>Chassis: {formData.chassisNo || 'N/A'} | Engine: {formData.engineNo || 'N/A'}</p>
                              </div>
                            </td>
                            <td style={{ padding: '6px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: '500', fontSize: '10px' }}>1</td>
                            <td style={{ padding: '6px', border: '1px solid #e5e7eb', fontWeight: '500', fontSize: '10px' }}>R {formatCurrency(formData.sellingPrice)}</td>
                            <td style={{ padding: '6px', border: '1px solid #e5e7eb', fontWeight: '500', fontSize: '10px' }}>R {formatCurrency(formData.sellingPrice)}</td>
                          </tr>
                          
                          {/* VAT Row */}
                          <tr style={{ border: '1px solid #e5e7eb' }}>
                            <td colSpan={3} style={{ padding: '6px', border: '1px solid #e5e7eb', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#374151', fontWeight: '500', fontSize: '10px' }}>Subtotal</span>
                                <span style={{ fontWeight: '500', fontSize: '10px', marginLeft: '10px' }}>R {formatCurrency(formData.sellingPrice)}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                <span style={{ color: '#374151', fontWeight: '500', fontSize: '10px' }}>VAT (15%)</span>
                                <span style={{ fontWeight: '500', fontSize: '10px', marginLeft: '10px' }}>R {formatCurrency(formData.vatAmount)}</span>
                              </div>
                            </td>
                            <td style={{ padding: '6px', border: '1px solid #e5e7eb', backgroundColor: '#eff6ff' }}>
                              <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '8px', color: '#4b5563', marginBottom: '2px' }}>VAT included</p>
                                <p style={{ fontWeight: '500', color: '#2563eb', fontSize: '10px' }}>R {formatCurrency(formData.vatAmount)}</p>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Total Row */}
                          <tr style={{ backgroundColor: '#2563eb', color: 'white' }}>
                            <td colSpan={3} style={{ padding: '8px', border: '1px solid #1d4ed8', textAlign: 'right' }}>
                              <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0' }}>TOTAL AMOUNT DUE</p>
                              <p style={{ fontSize: '10px', opacity: '0.9', margin: '2px 0 0 0' }}>Including 15% VAT</p>
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #1d4ed8', textAlign: 'center' }}>
                              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>R {formatCurrency(formData.totalSellingPrice)}</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <div style={{ marginTop: '8px', fontSize: '9px', color: '#4b5563' }}>
                        <p>All prices are in South African Rand (ZAR)</p>
                      </div>
                    </div>

                    {/* Bank Details & Payment Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      {/* Bank Details */}
                      <div>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', marginBottom: '6px', paddingBottom: '3px', borderBottom: '1px solid #d1d5db' }}>BANKING DETAILS</h3>
                        <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div>
                              <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>Bank Name</p>
                              <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#111827' }}>{bankInfo.name}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>Account Holder</p>
                              <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '10px' }}>{bankInfo.holderName}</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <div>
                                <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>Account Number</p>
                                <p style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#111827', fontSize: '10px' }}>{bankInfo.accountNumber}</p>
                              </div>
                              <div>
                                <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>Branch Code</p>
                                <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '10px' }}>{bankInfo.branchNumber}</p>
                              </div>
                            </div>
                            <div>
                              <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>Swift Code</p>
                              <p style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#111827', fontSize: '10px' }}>{bankInfo.swiftCode}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', marginBottom: '6px', paddingBottom: '3px', borderBottom: '1px solid #d1d5db' }}>PAYMENT INFORMATION</h3>
                        <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div>
                              <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>Payment Reference</p>
                              <div style={{ backgroundColor: 'white', padding: '6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                                <p style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#2563eb', textAlign: 'center', margin: 0, fontSize: '10px' }}>{formData.invoiceNumber}</p>
                              </div>
                              <p style={{ fontSize: '8px', color: '#6b7280', marginTop: '2px' }}>Please use this invoice number as payment reference</p>
                            </div>
                            
                            <div>
                              <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>Payment Terms</p>
                              <ul style={{ fontSize: '9px', color: '#374151', listStyleType: 'disc', paddingLeft: '12px', margin: 0 }}>
                                <li style={{ marginBottom: '2px' }}>Payment due within 7 days of invoice date</li>
                                <li style={{ marginBottom: '2px' }}>Vehicle will be released upon payment confirmation</li>
                                <li>EFT payments preferred</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div style={{ marginBottom: '15px' }}>
                      <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', marginBottom: '6px', paddingBottom: '3px', borderBottom: '1px solid #d1d5db' }}>TERMS & CONDITIONS</h3>
                      <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div>
                            <h4 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px', fontSize: '11px' }}>General Terms</h4>
                            <ul style={{ fontSize: '9px', color: '#374151', margin: 0, padding: 0 }}>
                              <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '2px' }}>
                                <span style={{ color: '#2563eb', marginRight: '4px' }}>•</span>
                                Vehicle sold as-is unless otherwise stated
                              </li>
                              <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '2px' }}>
                                <span style={{ color: '#2563eb', marginRight: '4px' }}>•</span>
                                Ownership transfers upon full payment
                              </li>
                              <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ color: '#2563eb', marginRight: '4px' }}>•</span>
                                All documents provided upon completion
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h4 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px', fontSize: '11px' }}>Delivery & Collection</h4>
                            <ul style={{ fontSize: '9px', color: '#374151', margin: 0, padding: 0 }}>
                              <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '2px' }}>
                                <span style={{ color: '#2563eb', marginRight: '4px' }}>•</span>
                                Collection within 48 hours of payment
                              </li>
                              <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '2px' }}>
                                <span style={{ color: '#2563eb', marginRight: '4px' }}>•</span>
                                Delivery available at additional cost
                              </li>
                              <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ color: '#2563eb', marginRight: '4px' }}>•</span>
                                Valid driver's license required for test drive
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {formData.notes && (
                      <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', marginBottom: '6px', paddingBottom: '3px', borderBottom: '1px solid #d1d5db' }}>ADDITIONAL NOTES</h3>
                        <div style={{ backgroundColor: '#fef3c7', padding: '8px', borderRadius: '4px', border: '1px solid #fbbf24' }}>
                          <p style={{ color: '#374151', fontSize: '9px' }}>{formData.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #d1d5db' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center' }}>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#111827', marginBottom: '2px', fontSize: '10px' }}>Thank You</p>
                          <p style={{ fontSize: '9px', color: '#4b5563' }}>We appreciate your business</p>
                        </div>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#111827', marginBottom: '2px', fontSize: '10px' }}>Contact Us</p>
                          <p style={{ fontSize: '9px', color: '#4b5563' }}>+27 67 187 2085, +27 61 100 4801</p>
                          <p style={{ fontSize: '9px', color: '#4b5563' }}>Tskauto@gmail.com</p>
                        </div>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#111827', marginBottom: '2px', fontSize: '10px' }}>Authorized Signature</p>
                          <div style={{ height: '20px', borderBottom: '1px solid #9ca3af', marginTop: '4px' }}></div>
                          <p style={{ fontSize: '8px', color: '#6b7280', marginTop: '2px' }}>TSK Auto Representative</p>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <p style={{ fontSize: '8px', color: '#6b7280' }}>
                          This is a computer-generated tax invoice. No physical signature required.<br />
                          VAT Registration Number: 4850123456 | TSK Auto © {new Date().getFullYear()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">Invoice preview for: <span className="font-bold text-blue-600">{formData.invoiceNumber}</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">Click "Download Invoice" to generate PDF</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const selling = (parseFloat(formData.sellingPrice) || 0) + 10000;
                      setFormData(prev => ({
                        ...prev,
                        sellingPrice: selling.toFixed(2)
                      }));
                    }}
                    className="px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                  >
                    +R 10,000
                  </button>
                  
                  <button
                    onClick={() => {
                      const selling = (parseFloat(formData.sellingPrice) || 0) - 10000;
                      setFormData(prev => ({
                        ...prev,
                        sellingPrice: selling > 0 ? selling.toFixed(2) : '0.00'
                      }));
                    }}
                    className="px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                  >
                    -R 10,000
                  </button>
                  
                  <button
                    onClick={() => {
                      const bankDetails = `Bank: ${bankInfo.name}\nAccount: ${bankInfo.accountNumber}\nHolder: ${bankInfo.holderName}\nBranch: ${bankInfo.branchNumber}\nSWIFT: ${bankInfo.swiftCode}`;
                      navigator.clipboard.writeText(bankDetails);
                      alert('Bank details copied to clipboard!');
                    }}
                    className="px-4 py-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-sm font-medium"
                  >
                    Copy Bank Details
                  </button>
                  
                  <button
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                        date: new Date().toLocaleDateString('en-ZA')
                      }));
                    }}
                    className="px-4 py-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
                  >
                    New Invoice
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p>VAT is automatically calculated at 15% of the selling price. All amounts in South African Rand (ZAR).</p>
          <p className="mt-1">TSK Auto © {new Date().getFullYear()} • Professional Vehicle Trading Solutions</p>
        </motion.div>
      </div>
    </div>
  );
}