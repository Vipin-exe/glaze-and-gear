import React from 'react';
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function CustomerInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true }
      },
      user: true
    }
  });

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  const customerName = order.customerName || order.user?.name || 'Anonymous';
  const customerEmail = order.customerEmail || order.user?.email || 'N/A';

  return (
    <div className="bg-white text-black min-h-screen p-8 md:p-16 max-w-4xl mx-auto font-sans">
      
      {/* Auto Print Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-16 pb-8 border-b-2 border-gray-200">
        <div>
          <h1 className="text-4xl font-serif font-black tracking-widest uppercase mb-2 text-[#98202E]">
            Glaze & Gear
          </h1>
          <p className="text-gray-500 text-sm">Automotive Excellence</p>
          <div className="mt-4 text-sm text-gray-600">
            <p>123 Auto Avenue, Bangalore</p>
            <p>Karnataka, India 560001</p>
            <p>support@glazeandgear.com</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-5xl font-black text-gray-200 uppercase tracking-widest mb-4">Invoice</h2>
          <div className="text-sm">
            <p className="font-bold text-gray-900 mb-1">Invoice Number:</p>
            <p className="text-gray-600 mb-4 font-mono">INV-{order.id.slice(-6).toUpperCase()}</p>
            
            <p className="font-bold text-gray-900 mb-1">Date of Issue:</p>
            <p className="text-gray-600 font-mono">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Billing & Shipping */}
      <div className="grid grid-cols-2 gap-16 mb-16">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Billed To</h3>
          <p className="font-bold text-xl text-gray-900 mb-1">{customerName}</p>
          <p className="text-gray-600">{customerEmail}</p>
          {order.customerPhone && <p className="text-gray-600 mt-1">{order.customerPhone}</p>}
        </div>
        
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Shipping Address</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {order.shippingAddress || 'Digital / No physical address provided.'}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-16">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-900 text-gray-900">
              <th className="py-4 text-sm font-bold uppercase tracking-widest">Description</th>
              <th className="py-4 text-sm font-bold uppercase tracking-widest text-center">Qty</th>
              <th className="py-4 text-sm font-bold uppercase tracking-widest text-right">Unit Price</th>
              <th className="py-4 text-sm font-bold uppercase tracking-widest text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item, idx) => (
              <tr key={idx} className="text-gray-800">
                <td className="py-6 pr-4">
                  <p className="font-bold">{item.product?.name || 'Unknown Product'}</p>
                  {item.product?.category && <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{item.product.category}</p>}
                </td>
                <td className="py-6 px-4 text-center">{item.quantity}</td>
                <td className="py-6 px-4 text-right">₹{item.price.toLocaleString()}</td>
                <td className="py-6 pl-4 text-right font-bold text-gray-900">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-16">
        <div className="w-72">
          <div className="flex justify-between py-3 border-b border-gray-200 text-gray-600">
            <span className="font-medium">Subtotal</span>
            <span>₹{order.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200 text-gray-600">
            <span className="font-medium">Tax (0%)</span>
            <span>₹0</span>
          </div>
          <div className="flex justify-between py-4 text-2xl font-black text-[#98202E]">
            <span>Total</span>
            <span>₹{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Method</h3>
          <p className="font-bold text-gray-900">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Razorpay Secure'}</p>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</h3>
          <span className={`px-3 py-1 rounded text-xs font-black tracking-widest uppercase ${
            order.paymentStatus === 'PAID' || (order.paymentStatus === 'PENDING' && order.status === 'DELIVERED')
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {order.paymentStatus || (order.paymentMethod === 'COD' ? 'PENDING' : 'PAID')}
          </span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-gray-200 text-center text-gray-400 text-sm">
        <p>Thank you for your business.</p>
        <p className="mt-2 text-xs">For any inquiries, please contact support@glazeandgear.com</p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body { background: white; -webkit-print-color-adjust: exact; }
            button, a { display: none !important; }
            .bg-[#98202E] { background-color: #98202E !important; }
            .text-[#98202E] { color: #98202E !important; }
          }
        `
      }} />
    </div>
  );
}
