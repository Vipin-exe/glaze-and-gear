import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminComplaintsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      order: true,
      product: true,
      user: true
    }
  });

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Customer Complaints</h1>
            <p className="text-gray-500 text-sm">View and manage damage reports filed via Chatbot</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Order ID</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Product</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Complaint</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 align-top">
                        <p className="text-sm font-medium">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">{new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="p-4 align-top">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">
                          {complaint.orderId.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-3">
                          {complaint.product?.image ? (
                            <img src={complaint.product.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200"></div>
                          )}
                          <p className="text-sm font-bold line-clamp-2 max-w-[200px]">{complaint.product?.name}</p>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <p className="text-sm font-medium">{complaint.user?.name || complaint.order?.customerName || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{complaint.user?.email || complaint.order?.customerEmail}</p>
                      </td>
                      <td className="p-4 align-top max-w-xs">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
                      </td>
                      <td className="p-4 align-top text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                          complaint.status === 'OPEN' ? 'bg-red-100 text-red-800' :
                          complaint.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {complaint.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
