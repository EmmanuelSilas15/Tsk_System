'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Car, Save, Download, RefreshCw, Calculator, FileText, Mail, Building, CreditCard } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
      
      // Clone the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Remove problematic styles that use unsupported color functions
      clone.style.cssText = 'background: white; color: black;';
      
      // Temporarily hide the original and show clone
      element.style.opacity = '0';
      document.body.appendChild(clone);
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.width = '210mm';
      clone.style.height = 'auto';
      clone.style.background = 'white';
      
      // Fix all background styles
      const elementsWithGradients = clone.querySelectorAll('[class*="gradient"]');
      elementsWithGradients.forEach((el) => {
        const htmlEl = el as HTMLElement;
        // Replace gradients with solid colors
        if (htmlEl.classList.contains('from-blue-500') || htmlEl.classList.contains('to-blue-600')) {
          htmlEl.style.background = '#3b82f6'; // blue-500
          htmlEl.style.backgroundImage = 'none';
        }
        if (htmlEl.classList.contains('from-blue-600') || htmlEl.classList.contains('to-blue-700')) {
          htmlEl.style.background = '#1d4ed8'; // blue-700
          htmlEl.style.backgroundImage = 'none';
        }
      });
      
      // Replace all text color classes with inline styles
      const textElements = clone.querySelectorAll('[class*="text-"]');
      textElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.classList.contains('text-blue-600')) {
          htmlEl.style.color = '#2563eb';
        }
        if (htmlEl.classList.contains('text-gray-900')) {
          htmlEl.style.color = '#111827';
        }
        if (htmlEl.classList.contains('text-gray-700')) {
          htmlEl.style.color = '#374151';
        }
        if (htmlEl.classList.contains('text-gray-600')) {
          htmlEl.style.color = '#4b5563';
        }
        if (htmlEl.classList.contains('text-gray-500')) {
          htmlEl.style.color = '#6b7280';
        }
      });
      
      // Replace all background color classes
      const bgElements = clone.querySelectorAll('[class*="bg-"]');
      bgElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.classList.contains('bg-blue-50')) {
          htmlEl.style.background = '#eff6ff';
        }
        if (htmlEl.classList.contains('bg-gray-50')) {
          htmlEl.style.background = '#f9fafb';
        }
        if (htmlEl.classList.contains('bg-white')) {
          htmlEl.style.background = '#ffffff';
        }
        if (htmlEl.classList.contains('bg-blue-600')) {
          htmlEl.style.background = '#2563eb';
        }
      });
      
      // Remove all border color classes and replace with solid colors
      const borderElements = clone.querySelectorAll('[class*="border-"]');
      borderElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.classList.contains('border-blue-200')) {
          htmlEl.style.borderColor = '#bfdbfe';
        }
        if (htmlEl.classList.contains('border-gray-200')) {
          htmlEl.style.borderColor = '#e5e7eb';
        }
        if (htmlEl.classList.contains('border-blue-600')) {
          htmlEl.style.borderColor = '#2563eb';
        }
        if (htmlEl.classList.contains('border-gray-300')) {
          htmlEl.style.borderColor = '#d1d5db';
        }
      });
      
      // Wait a moment for styles to apply
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 210 * 3.78, // Convert mm to pixels (1mm = 3.78px)
        height: 297 * 3.78, // A4 height in pixels
      });
      
      // Remove the clone
      document.body.removeChild(clone);
      element.style.opacity = '1';
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
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
                    className="bg-white p-8"
                    style={{ 
                      width: '210mm', 
                      minHeight: '297mm',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      fontSize: '10px',
                      color: '#000000',
                      background: '#ffffff',
                      lineHeight: '1.3'
                    }}
                  >
                    {/* Header Section - Modified with centered company info and larger logo */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #2563eb' }}>
                      {/* Left: Logo Only - Made Even Bigger */}
                      <div style={{ width: '25%' }}>
                        <div style={{ 
                          width: '200px', 
                          height: '200px', 
                          backgroundColor: '#2563eb', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: 'white', 
                          fontSize: '18px', 
                          fontWeight: 'bold',
                          boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '22px', fontWeight: 'bold' }}>TSK</div>
                            <div style={{ fontSize: '22px', fontWeight: 'bold' }}>AUTO</div>
                          </div>
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
                        <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      {/* Bill To Section */}
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #d1d5db' }}>BILL TO</h3>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                          <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '13px', marginBottom: '6px' }}>{formData.customerName || '[Customer Name]'}</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', color: '#374151' }}>
                            <p>{formData.customerEmail || '[Email Address]'}</p>
                            <p>{formData.customerPhone || '[Phone Number]'}</p>
                            <p style={{ color: '#4b5563' }}>{formData.address || '[Customer Address]'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Info Section */}
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #d1d5db' }}>VEHICLE INFORMATION</h3>
                        <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                              <p style={{ fontSize: '10px', color: '#4b5563', marginBottom: '2px' }}>Make & Model</p>
                              <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '11px' }}>{formData.make} {formData.model}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '10px', color: '#4b5563', marginBottom: '2px' }}>Year</p>
                              <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '11px' }}>{formData.year}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '10px', color: '#4b5563', marginBottom: '2px' }}>Color</p>
                              <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '11px' }}>{formData.color || 'N/A'}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '10px', color: '#4b5563', marginBottom: '2px' }}>Condition</p>
                              <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '11px' }}>{formData.condition}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '10px', color: '#4b5563', marginBottom: '2px' }}>Kilometers</p>
                              <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '11px' }}>
                                {formData.kilometers ? `${parseInt(formData.kilometers).toLocaleString()} km` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p style={{ fontSize: '10px', color: '#4b5563', marginBottom: '2px' }}>Chassis No</p>
                              <p style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 'bold', color: '#111827' }}>{formData.chassisNo || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Table */}
                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '12px', paddingBottom: '4px', borderBottom: '1px solid #d1d5db' }}>PRICING DETAILS</h3>
                      
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                            <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold', color: '#2563eb', border: '1px solid #bfdbfe' }}>Description</th>
                            <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold', color: '#2563eb', border: '1px solid #bfdbfe' }}>Quantity</th>
                            <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold', color: '#2563eb', border: '1px solid #bfdbfe' }}>Unit Price</th>
                            <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold', color: '#2563eb', border: '1px solid #bfdbfe' }}>Amount (ZAR)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ border: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>
                              <div>
                                <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '11px' }}>{formData.make} {formData.model}</p>
                                <p style={{ fontSize: '10px', color: '#4b5563', marginTop: '2px' }}>Vehicle Purchase - {formData.year} {formData.condition}</p>
                                <p style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>Chassis: {formData.chassisNo || 'N/A'} | Engine: {formData.engineNo || 'N/A'}</p>
                              </div>
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: '500', fontSize: '11px' }}>1</td>
                            <td style={{ padding: '8px', border: '1px solid #e5e7eb', fontWeight: '500', fontSize: '11px' }}>R {formatCurrency(formData.sellingPrice)}</td>
                            <td style={{ padding: '8px', border: '1px solid #e5e7eb', fontWeight: '500', fontSize: '11px' }}>R {formatCurrency(formData.sellingPrice)}</td>
                          </tr>
                          
                          {/* VAT Row */}
                          <tr style={{ border: '1px solid #e5e7eb' }}>
                            <td colSpan={3} style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#374151', fontWeight: '500', fontSize: '11px' }}>Subtotal</span>
                                <span style={{ fontWeight: '500', fontSize: '11px', marginLeft: '10px' }}>R {formatCurrency(formData.sellingPrice)}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                <span style={{ color: '#374151', fontWeight: '500', fontSize: '11px' }}>VAT (15%)</span>
                                <span style={{ fontWeight: '500', fontSize: '11px', marginLeft: '10px' }}>R {formatCurrency(formData.vatAmount)}</span>
                              </div>
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #e5e7eb', backgroundColor: '#eff6ff' }}>
                              <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '9px', color: '#4b5563', marginBottom: '2px' }}>VAT included</p>
                                <p style={{ fontWeight: '500', color: '#2563eb', fontSize: '11px' }}>R {formatCurrency(formData.vatAmount)}</p>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Total Row */}
                          <tr style={{ backgroundColor: '#2563eb', color: 'white' }}>
                            <td colSpan={3} style={{ padding: '12px', border: '1px solid #1d4ed8', textAlign: 'right' }}>
                              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>TOTAL AMOUNT DUE</p>
                              <p style={{ fontSize: '11px', opacity: '0.9', margin: '3px 0 0 0' }}>Including 15% VAT</p>
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #1d4ed8', textAlign: 'center' }}>
                              <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '0' }}>R {formatCurrency(formData.totalSellingPrice)}</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <div style={{ marginTop: '10px', fontSize: '10px', color: '#4b5563' }}>
                        <p>All prices are in South African Rand (ZAR)</p>
                      </div>
                    </div>

                    {/* Bank Details & Payment Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      {/* Bank Details */}
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #d1d5db' }}>BANKING DETAILS</h3>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                              <p style={{ fontSize: '10px', color: '#4b5563', marginBottom: '2px' }}>Bank Name</p>
                              <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#111827' }}>{bankInfo.name}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '10px', color: '#4b5563', marginBottom: '2px' }}>Account Holder</p>
                              <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '11px' }}>{bankInfo.holderName}</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div>
                                <p style={{ fontSize: '10px', color: '#4b5563', marginBottom: '2px' }}>Account Number</p>
                                <p style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#111827', fontSize: '11px' }}>{bankInfo.accountNumber}</p>
                              </div>
                              <div>
                                <p style={{ fontSize: '10px', color: '#4b5563', marginBottom: '2px' }}>Branch Code</p>
                                <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '11px' }}>{bankInfo.branchNumber}</p>
                              </div>
                            </div>
                            <div>
                              <p style={{ fontSize: '10px', color: '#4b5563', marginBottom: '2px' }}>Swift Code</p>
                              <p style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#111827', fontSize: '11px' }}>{bankInfo.swiftCode}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #d1d5db' }}>PAYMENT INFORMATION</h3>
                        <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                              <p style={{ fontSize: '10px', color: '#4b5563', marginBottom: '2px' }}>Payment Reference</p>
                              <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                                <p style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#2563eb', textAlign: 'center', margin: 0, fontSize: '11px' }}>{formData.invoiceNumber}</p>
                              </div>
                              <p style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>Please use this invoice number as payment reference</p>
                            </div>
                            
                            <div>
                              <p style={{ fontSize: '10px', color: '#4b5563', marginBottom: '2px' }}>Payment Terms</p>
                              <ul style={{ fontSize: '10px', color: '#374151', listStyleType: 'disc', paddingLeft: '15px', margin: 0 }}>
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
                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #d1d5db' }}>TERMS & CONDITIONS</h3>
                      <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div>
                            <h4 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '6px', fontSize: '12px' }}>General Terms</h4>
                            <ul style={{ fontSize: '10px', color: '#374151', margin: 0, padding: 0 }}>
                              <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '3px' }}>
                                <span style={{ color: '#2563eb', marginRight: '6px' }}>•</span>
                                Vehicle sold as-is unless otherwise stated
                              </li>
                              <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '3px' }}>
                                <span style={{ color: '#2563eb', marginRight: '6px' }}>•</span>
                                Ownership transfers upon full payment
                              </li>
                              <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ color: '#2563eb', marginRight: '6px' }}>•</span>
                                All documents provided upon completion
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h4 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '6px', fontSize: '12px' }}>Delivery & Collection</h4>
                            <ul style={{ fontSize: '10px', color: '#374151', margin: 0, padding: 0 }}>
                              <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '3px' }}>
                                <span style={{ color: '#2563eb', marginRight: '6px' }}>•</span>
                                Collection within 48 hours of payment
                              </li>
                              <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '3px' }}>
                                <span style={{ color: '#2563eb', marginRight: '6px' }}>•</span>
                                Delivery available at additional cost
                              </li>
                              <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ color: '#2563eb', marginRight: '6px' }}>•</span>
                                Valid driver's license required for test drive
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {formData.notes && (
                      <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #d1d5db' }}>ADDITIONAL NOTES</h3>
                        <div style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '4px', border: '1px solid #fbbf24' }}>
                          <p style={{ color: '#374151', fontSize: '10px' }}>{formData.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #d1d5db' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center' }}>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#111827', marginBottom: '3px', fontSize: '11px' }}>Thank You</p>
                          <p style={{ fontSize: '10px', color: '#4b5563' }}>We appreciate your business</p>
                        </div>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#111827', marginBottom: '3px', fontSize: '11px' }}>Contact Us</p>
                          <p style={{ fontSize: '10px', color: '#4b5563' }}>+27 11 123 4567</p>
                          <p style={{ fontSize: '10px', color: '#4b5563' }}>info@tskauto.co.za</p>
                        </div>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#111827', marginBottom: '3px', fontSize: '11px' }}>Authorized Signature</p>
                          <div style={{ height: '30px', borderBottom: '1px solid #9ca3af', marginTop: '6px' }}></div>
                          <p style={{ fontSize: '9px', color: '#6b7280', marginTop: '3px' }}>TSK Auto Representative</p>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'center', marginTop: '15px' }}>
                        <p style={{ fontSize: '9px', color: '#6b7280' }}>
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