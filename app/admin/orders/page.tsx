"use client";
import React from "react";
import { useState, useEffect } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [trackingInput, setTrackingInput] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);
  const [confirmStatusModal, setConfirmStatusModal] = useState<{ id: string, newStatus: string } | null>(null);
  const [confirmRefundStatusModal, setConfirmRefundStatusModal] = useState<{ id: string, newRefundStatus: string } | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  const updateStatus = async () => {
    if (!confirmStatusModal) return;
    const { id, newStatus } = confirmStatusModal;

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      const updatedOrder = await res.json();
      setOrders(orders.map((o: any) => o.id === id ? { ...o, ...updatedOrder } : o));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, ...updatedOrder });
      }
      showToast("Order status updated successfully", "success");
    } catch (err) {
      showToast("Error updating order status", "error");
    } finally {
      setConfirmStatusModal(null);
    }
  };

  const updateRefundStatus = async () => {
    if (!confirmRefundStatusModal) return;
    const { id, newRefundStatus } = confirmRefundStatusModal;

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refundStatus: newRefundStatus }),
      });
      if (!res.ok) throw new Error("Failed to update refund status");

      const updatedOrder = await res.json();
      setOrders(orders.map((o: any) => o.id === id ? { ...o, ...updatedOrder } : o));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, ...updatedOrder });
      }
      showToast("Refund status updated successfully", "success");
    } catch (err) {
      showToast("Error updating refund status", "error");
    } finally {
      setConfirmRefundStatusModal(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setTrackingInput(order.trackingNumber || "");
  };

  const saveTracking = async () => {
    if (!selectedOrder) return;
    setSavingTracking(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: trackingInput }),
      });
      if (!res.ok) throw new Error();
      setOrders(orders.map((o: any) => o.id === selectedOrder.id ? { ...o, trackingNumber: trackingInput } : o));
      setSelectedOrder({ ...selectedOrder, trackingNumber: trackingInput });
      showToast("Tracking number saved!", "success");
    } catch {
      showToast("Failed to save tracking number", "error");
    } finally {
      setSavingTracking(false);
    }
  };

  const recentlyCancelledCount = orders.filter((o: any) => {
    if (o.status !== 'CANCELLED') return false;
    const cancelledDate = new Date(o.updatedAt || o.createdAt);
    const hoursSince = (new Date().getTime() - cancelledDate.getTime()) / (1000 * 60 * 60);
    return hoursSince <= 24;
  }).length;

  const statusBadgeClass = (status: string) =>
    status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
      status === 'PROCESSING' ? 'bg-purple-100 text-purple-800 border-purple-200' :
        status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
          status === 'DELIVERED' ? 'bg-green-100 text-green-800 border-green-200' :
            'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex gap-3">
            <span className="text-xl mt-1">📦</span>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Management</h1>
              <p className="text-gray-500 text-sm mt-1">View and manage customer orders ({orders.length} total)</p>
            </div>
          </div>
          {selectedOrderIds.size > 0 && (
            <button
              onClick={() => window.open(`/admin/orders/print-batch?ids=${Array.from(selectedOrderIds).join(',')}`, '_blank')}
              className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap h-fit"
            >
              <span className="text-lg">🖨️</span> Print Selected ({selectedOrderIds.size})
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap gap-3 w-full xl:w-auto">
          <input
            type="text"
            placeholder="Search by ID, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm w-full sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm w-full sm:w-auto cursor-pointer bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RECENTLY_CANCELLED">Recently Cancelled (24h)</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm w-full sm:w-auto cursor-pointer bg-white"
          >
            <option value="ALL">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending Payment</option>
            <option value="COD">Cash on Delivery</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="REFUND_PENDING">Refund Pending</option>
            <option value="REFUND_COMPLETED">Refund Completed</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm w-full sm:w-auto cursor-pointer bg-white"
          >
            <option value="ALL">All Dates</option>
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="7DAYS">Last 7 Days</option>
            <option value="30DAYS">Last 30 Days</option>
            <option value="CUSTOM">Custom Range</option>
          </select>
        </div>
      </div>

      {dateFilter === 'CUSTOM' && (
        <div className="mb-8 flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-gray-700">From:</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-gray-700">To:</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm" />
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-xl z-50 text-white font-medium animate-in slide-in-from-bottom-4 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {recentlyCancelledCount > 0 && statusFilter !== 'RECENTLY_CANCELLED' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-red-900 text-sm">Action Required: Recent Cancellations</h3>
              <p className="text-red-700 text-xs mt-0.5">There are <strong>{recentlyCancelledCount}</strong> order(s) cancelled in the last 24 hours. Please ensure they are not packed or shipped.</p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('RECENTLY_CANCELLED')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            View Cancelled
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="p-6 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-[#98202E] focus:ring-[#98202E]"
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Note: we can't easily access filteredOrders here without refactoring, 
                          // so we'll just select all visible orders by using a document query or refactoring.
                          // Actually, we'll just let the individual checkboxes handle it for now, or select ALL orders.
                          setSelectedOrderIds(new Set(orders.map((o: any) => o.id)));
                        } else {
                          setSelectedOrderIds(new Set());
                        }
                      }}
                      checked={orders.length > 0 && selectedOrderIds.size === orders.length}
                    />
                  </th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID / Date</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer Details</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Payment</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="p-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(() => {
                  const filteredOrders = orders.filter((o: any) => {
                    let matchesStatus = false;
                    if (statusFilter === 'ALL') matchesStatus = true;
                    else if (statusFilter === 'RECENTLY_CANCELLED') {
                      if (o.status === 'CANCELLED') {
                        const cancelledDate = new Date(o.updatedAt || o.createdAt);
                        const hoursSince = (new Date().getTime() - cancelledDate.getTime()) / (1000 * 60 * 60);
                        matchesStatus = hoursSince <= 24;
                      }
                    } else {
                      matchesStatus = o.status === statusFilter;
                    }

                    let matchesPayment = true;
                    if (paymentFilter !== 'ALL') {
                      const effectivePaymentStatus = o.paymentStatus || (o.paymentMethod === 'COD' ? 'PENDING' : 'PAID');
                      if (paymentFilter === 'PAID') matchesPayment = effectivePaymentStatus === 'PAID';
                      else if (paymentFilter === 'PENDING') matchesPayment = effectivePaymentStatus !== 'PAID';
                      else if (paymentFilter === 'COD') matchesPayment = o.paymentMethod === 'COD';
                      else if (paymentFilter === 'RAZORPAY') matchesPayment = o.paymentMethod !== 'COD';
                      else if (paymentFilter === 'REFUND_PENDING') {
                        const effectiveRefund = o.refundStatus || (o.status === 'CANCELLED' && o.paymentMethod !== 'COD' && o.paymentStatus === 'PAID' ? 'PENDING' : null);
                        matchesPayment = effectiveRefund === 'PENDING';
                      }
                      else if (paymentFilter === 'REFUND_COMPLETED') matchesPayment = o.refundStatus === 'COMPLETED';
                    }

                    const query = searchQuery.toLowerCase();
                    const matchesSearch = !query ||
                      o.id.toLowerCase().includes(query) ||
                      (o.customerName && o.customerName.toLowerCase().includes(query)) ||
                      (o.customerEmail && o.customerEmail.toLowerCase().includes(query)) ||
                      (o.user?.name && o.user.name.toLowerCase().includes(query)) ||
                      (o.user?.email && o.user.email.toLowerCase().includes(query));

                    let matchesDate = true;
                    if (dateFilter !== 'ALL') {
                      const orderDate = new Date(o.createdAt);
                      orderDate.setHours(0, 0, 0, 0);

                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      const yesterday = new Date(today);
                      yesterday.setDate(yesterday.getDate() - 1);

                      const sevenDaysAgo = new Date(today);
                      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                      const thirtyDaysAgo = new Date(today);
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                      if (dateFilter === 'TODAY') {
                        matchesDate = orderDate.getTime() === today.getTime();
                      } else if (dateFilter === 'YESTERDAY') {
                        matchesDate = orderDate.getTime() === yesterday.getTime();
                      } else if (dateFilter === '7DAYS') {
                        matchesDate = orderDate >= sevenDaysAgo && orderDate <= today;
                      } else if (dateFilter === '30DAYS') {
                        matchesDate = orderDate >= thirtyDaysAgo && orderDate <= today;
                      } else if (dateFilter === 'CUSTOM') {
                        const start = startDate ? new Date(startDate) : null;
                        const end = endDate ? new Date(endDate) : null;
                        if (start) start.setHours(0, 0, 0, 0);
                        if (end) end.setHours(23, 59, 59, 999);

                        if (start && end) {
                          matchesDate = orderDate >= start && orderDate <= end;
                        } else if (start) {
                          matchesDate = orderDate >= start;
                        } else if (end) {
                          matchesDate = orderDate <= end;
                        }
                      }
                    }

                    return matchesStatus && matchesSearch && matchesDate && matchesPayment;
                  });

                  if (filteredOrders.length === 0) {
                    return <tr><td colSpan={6} className="p-12 text-center text-gray-500">No orders found.</td></tr>;
                  }

                  return filteredOrders.map((o: any) => (
                    <React.Fragment key={o.id}>
                      <tr className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => openOrderDetails(o)}>
                        <td className="p-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-[#98202E] focus:ring-[#98202E] cursor-pointer"
                            checked={selectedOrderIds.has(o.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedOrderIds);
                              if (e.target.checked) newSet.add(o.id);
                              else newSet.delete(o.id);
                              setSelectedOrderIds(newSet);
                            }}
                          />
                        </td>
                        <td className="p-6">
                          <div className="font-mono text-xs font-bold text-gray-900 bg-gray-100 inline-block px-2 py-1 rounded">
                            ...{o.id.slice(-6).toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500 mt-2 font-medium">
                            {new Date(o.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="font-bold text-gray-900">{o.customerName || o.user?.name || 'Anonymous'}</div>
                          <div className="text-xs text-gray-500 mt-1">{o.customerEmail || o.user?.email || 'N/A'}</div>
                          {o.customerPhone && <div className="text-xs text-gray-500 mt-1">📞 {o.customerPhone}</div>}
                          {o.shippingAddress && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-[200px]" title={o.shippingAddress}>
                              📍 {o.shippingAddress}
                            </div>
                          )}
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${o.paymentMethod === 'COD' ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                              {o.paymentMethod || 'RAZORPAY'}
                            </span>
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${o.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {o.paymentStatus || (o.paymentMethod === 'COD' ? 'PENDING' : 'PAID')}
                            </span>
                            {(o.refundStatus || (o.status === 'CANCELLED' && o.paymentMethod !== 'COD' && o.paymentStatus === 'PAID')) && (
                              <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest mt-1 ${o.refundStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                }`}>
                                REFUND: {o.refundStatus || 'PENDING'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-6" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={o.status}
                            onChange={(e) => setConfirmStatusModal({ id: o.id, newStatus: e.target.value })}
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest outline-none cursor-pointer text-center appearance-none border ${statusBadgeClass(o.status)}`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="p-6 text-right font-black text-lg text-gray-900">
                          ₹{o.totalAmount.toLocaleString()}
                        </td>
                        <td className="p-6 text-right text-gray-400">
                          <button className="text-[#98202E] font-bold text-sm hover:underline">View</button>
                        </td>
                      </tr>
                    </React.Fragment>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============ ORDER DETAILS MODAL — REDESIGNED ============ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[5000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">

            {/* Header — sticky, compact, everything on one line on desktop */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    #{selectedOrder.id.slice(-6).toUpperCase()}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBadgeClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  {new Date(selectedOrder.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body — single scroll area, everything stacks cleanly on mobile */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">

              {/* Info cards — 1 col mobile, 3 col desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Customer</p>
                  <p className="font-bold text-gray-900 text-sm truncate" title={selectedOrder.customerName || selectedOrder.user?.name || 'Anonymous'}>
                    {selectedOrder.customerName || selectedOrder.user?.name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{selectedOrder.customerEmail || selectedOrder.user?.email || 'No email'}</p>
                  {selectedOrder.customerPhone && <p className="text-xs text-gray-500 mt-0.5">📞 {selectedOrder.customerPhone}</p>}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Shipping Address</p>
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-4">
                    {selectedOrder.shippingAddress || 'No shipping address provided.'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${selectedOrder.paymentMethod === 'COD' ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                      {selectedOrder.paymentMethod || 'RAZORPAY'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${selectedOrder.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {selectedOrder.paymentStatus || (selectedOrder.paymentMethod === 'COD' ? 'PENDING' : 'PAID')}
                    </span>
                  </div>

                  {selectedOrder.paymentMethod !== 'COD' && (selectedOrder.status === 'CANCELLED' || selectedOrder.refundStatus) && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Refund</p>
                      <select
                        value={selectedOrder.refundStatus || ""}
                        onChange={(e) => setConfirmRefundStatusModal({ id: selectedOrder.id, newRefundStatus: e.target.value })}
                        className={`w-full px-2 py-1.5 rounded text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer border ${selectedOrder.refundStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            selectedOrder.refundStatus === 'PENDING' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                      >
                        <option value="" disabled>Select</option>
                        <option value="PENDING">PENDING</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </div>
                  )}

                  {selectedOrder.paymentMethod !== 'COD' && (selectedOrder.razorpayOrderId || selectedOrder.razorpayPaymentId) && (
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                      {selectedOrder.razorpayOrderId && (
                        <p className="text-[10px] font-mono text-gray-500 truncate" title={selectedOrder.razorpayOrderId}>
                          Order: {selectedOrder.razorpayOrderId}
                        </p>
                      )}
                      {selectedOrder.razorpayPaymentId && (
                        <p className="text-[10px] font-mono text-gray-500 truncate" title={selectedOrder.razorpayPaymentId}>
                          Payment: {selectedOrder.razorpayPaymentId}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking — compact single row */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Shipment Tracking</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="e.g. DTDC1234567890"
                    value={trackingInput}
                    onChange={e => setTrackingInput(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#98202E]"
                  />
                  <button
                    onClick={saveTracking}
                    disabled={savingTracking}
                    className="px-5 py-2.5 bg-[#98202E] text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#7a1a25] transition-colors disabled:opacity-50 shrink-0"
                  >
                    {savingTracking ? "Saving..." : "Save"}
                  </button>
                </div>
                {selectedOrder.trackingNumber && (
                  <p className="text-xs text-green-600 font-bold mt-2">✓ Saved: {selectedOrder.trackingNumber}</p>
                )}
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Purchased Items</p>
                  <span className="bg-[#98202E]/10 text-[#98202E] px-2 py-0.5 rounded text-[10px] font-black tracking-widest">
                    {selectedOrder.items?.length || 0} ITEMS
                  </span>
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex gap-3 items-center p-3 bg-white">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                        {item.product?.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{item.product?.name || 'Unknown Product'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">₹{item.price.toLocaleString()} × {item.quantity}</p>
                      </div>
                      <div className="font-black text-gray-900 text-sm shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer — sticky, totals only, no wasted space */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-5 sm:px-6 py-4">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Subtotal</span>
                <span>₹{selectedOrder.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between items-center text-xs text-green-600 font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    Discount
                    {selectedOrder.promoCode && <span className="bg-green-100 text-green-800 text-[9px] px-1.5 py-0.5 rounded uppercase">{selectedOrder.promoCode}</span>}
                  </span>
                  <span>-₹{selectedOrder.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-200">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {selectedOrder.paymentMethod === 'COD' && selectedOrder.paymentStatus !== 'PAID' ? 'Amount to Collect' : 'Total Paid'}
                </span>
                <span className="text-2xl font-black text-gray-900 tracking-tight">₹{selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ============ END ORDER DETAILS MODAL ============ */}

      {/* Confirmation Modal */}
      {confirmStatusModal && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-black text-gray-900 mb-2">Confirm Status Change</h2>
              <p className="text-gray-600 text-sm">
                Are you sure you want to change the status of order <strong className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">...{confirmStatusModal.id.slice(-6).toUpperCase()}</strong> to <strong className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${statusBadgeClass(confirmStatusModal.newStatus)}`}>{confirmStatusModal.newStatus}</strong>?
              </p>
              {confirmStatusModal.newStatus === 'CANCELLED' && (
                <p className="mt-3 text-xs text-red-600 font-bold bg-red-50 p-2 rounded border border-red-100">
                  ⚠️ Warning: Cancelling this order will automatically restore stock and flag it for a refund if paid via Razorpay.
                </p>
              )}
              {confirmStatusModal.newStatus === 'SHIPPED' && (
                <p className="mt-3 text-xs text-blue-600 font-bold bg-blue-50 p-2 rounded border border-blue-100">
                  ℹ️ Info: The customer will receive an email notification that their order has shipped.
                </p>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setConfirmStatusModal(null)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateStatus}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#98202E] hover:bg-[#7a1a25] transition-colors shadow-md"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Status Confirmation Modal */}
      {confirmRefundStatusModal && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-black text-gray-900 mb-2">Confirm Refund Update</h2>
              <p className="text-gray-600 text-sm">
                Are you sure you want to change the refund status of order <strong className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">...{confirmRefundStatusModal.id.slice(-6).toUpperCase()}</strong> to <strong className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${confirmRefundStatusModal.newRefundStatus === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                    confirmRefundStatusModal.newRefundStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>{confirmRefundStatusModal.newRefundStatus}</strong>?
              </p>
              {confirmRefundStatusModal.newRefundStatus === 'COMPLETED' && (
                <p className="mt-3 text-xs text-blue-600 font-bold bg-blue-50 p-2 rounded border border-blue-100">
                  ℹ️ Info: This signifies that you have successfully processed the refund on the Razorpay dashboard.
                </p>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setConfirmRefundStatusModal(null)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateRefundStatus}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
              >
                Confirm Refund Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}