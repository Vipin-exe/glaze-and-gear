import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true }
      },
      user: true
    }
  });

  if (!order) {
    notFound();
  }

  const customerName = order.customerName || order.user?.name || 'Anonymous';
  const customerEmail = order.customerEmail || order.user?.email || 'N/A';

  // Calculate actual subtotal
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hasDiscount = order.discountAmount && order.discountAmount > 0;

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 font-sans text-gray-900">
      
      {/* Action Bar (Hidden in Print) */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center px-4 print:hidden">
        <a href="/admin/orders" className="text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm flex items-center gap-2">
          ← Back to Orders
        </a>
        <button 
          className="bg-[#0a0a0a] text-white px-6 py-2.5 rounded-lg font-bold tracking-wide hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2 text-sm"
          id="print-btn"
        >
          🖨️ Print Invoice
        </button>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById('print-btn').addEventListener('click', function() { window.print(); });`
        }}
      />

      {/* Invoice Document */}
      <div className="bg-white shadow-xl max-w-5xl mx-auto rounded-none md:rounded-xl overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Header Section */}
        <div className="p-10 md:p-16 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <h1 className="text-4xl font-serif font-black tracking-tight text-[#98202E] mb-2">
              GLAZE & GEAR
            </h1>
            <p className="text-gray-500 text-xs tracking-[2px] uppercase font-bold mb-6">Automotive Excellence</p>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p>123 Auto Avenue, Bangalore</p>
              <p>Karnataka, India 560001</p>
              <p>support@glazeandgear.com</p>
            </div>
          </div>
          <div className="md:text-right relative">
            {order.paymentStatus === 'PAID' && (
              <div className="absolute -top-4 right-0 md:-right-8 opacity-10 rotate-12 pointer-events-none print:opacity-20">
                <span className="text-6xl font-black text-green-600 border-4 border-green-600 rounded-xl px-4 py-1 uppercase tracking-widest">PAID</span>
              </div>
            )}
            <h2 className="text-3xl font-black text-gray-200 uppercase tracking-widest mb-6">TAX INVOICE</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="text-gray-500 font-medium">Invoice No:</div>
              <div className="font-mono font-bold text-gray-900 truncate max-w-[150px]" title={`INV-${order.id}`}>INV-{order.id.slice(-8).toUpperCase()}</div>
              
              <div className="text-gray-500 font-medium">Order Date:</div>
              <div className="font-mono text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              
              <div className="text-gray-500 font-medium">Payment:</div>
              <div className="font-bold text-gray-900">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online (Razorpay)'}</div>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="p-10 md:p-16 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row gap-12">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[2px] mb-4">Billed To</h3>
            <p className="font-bold text-lg text-gray-900 mb-1">{customerName}</p>
            <p className="text-gray-600 mb-1">{customerEmail}</p>
            {order.customerPhone && <p className="text-gray-600">{order.customerPhone}</p>}
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[2px] mb-4">Shipping Address</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {order.shippingAddress || 'Digital Product / No physical address provided.'}
            </p>
          </div>
          
          {/* Transaction Info (Razorpay) */}
          {order.paymentMethod !== 'COD' && (order.razorpayOrderId || order.razorpayPaymentId) && (
            <div className="flex-1">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[2px] mb-4">Transaction Details</h3>
              {order.razorpayOrderId && (
                <div className="mb-2">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Order Ref</p>
                  <p className="text-xs font-mono text-gray-700">{order.razorpayOrderId}</p>
                </div>
              )}
              {order.razorpayPaymentId && (
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Payment Ref</p>
                  <p className="text-xs font-mono text-gray-700">{order.razorpayPaymentId}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="p-10 md:p-16">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900 text-gray-900">
                <th className="pb-4 text-xs font-bold uppercase tracking-[2px]">Item Description</th>
                <th className="pb-4 text-xs font-bold uppercase tracking-[2px] text-center w-24">Qty</th>
                <th className="pb-4 text-xs font-bold uppercase tracking-[2px] text-right w-32">Rate</th>
                <th className="pb-4 text-xs font-bold uppercase tracking-[2px] text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <tr key={idx} className="group">
                  <td className="py-6 pr-4">
                    <div className="flex items-center gap-4">
                      {item.product?.image ? (
                        <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-white">
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                          <span className="text-gray-400 text-xs">No Img</span>
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                        {item.product?.category && <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{item.product.category}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center text-gray-700">{item.quantity}</td>
                  <td className="py-6 px-4 text-right text-gray-700">₹{item.price.toLocaleString()}</td>
                  <td className="py-6 pl-4 text-right font-bold text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-sm">
              <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
                <span className="font-medium">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              
              {hasDiscount && (
                <div className="flex justify-between py-3 border-b border-gray-100 text-green-600">
                  <span className="font-medium flex items-center gap-2">
                    Discount 
                    {order.promoCode && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{order.promoCode}</span>}
                  </span>
                  <span className="font-bold">-₹{order.discountAmount?.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
                <span className="font-medium">Shipping</span>
                <span>₹0</span>
              </div>
              
              <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
                <span className="font-medium">Taxes (Inclusive)</span>
                <span>₹0</span>
              </div>
              
              <div className="flex justify-between py-6 text-2xl font-black text-gray-900">
                <span>Total</span>
                <span>₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-900 text-white p-10 md:p-16 text-center text-sm">
          <p className="font-medium tracking-wide mb-2">THANK YOU FOR YOUR BUSINESS</p>
          <p className="text-gray-400">If you have any questions about this invoice, please contact support@glazeandgear.com</p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body { background: white !important; -webkit-print-color-adjust: exact; padding: 0 !important; }
            .print\\:hidden { display: none !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:rounded-none { border-radius: 0 !important; }
          }
        `
      }} />
    </div>
  );
}
