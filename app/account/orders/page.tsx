"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchOrders = () => {
    fetch("/api/user/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching orders", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    setCancelling(orderId);
    try {
      const res = await fetch(`/api/user/orders/${orderId}/cancel`, {
        method: "PATCH"
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to cancel order.");
      }
    } catch (err) {
      alert("An error occurred.");
    } finally {
      setCancelling(null);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="pt-[150px] min-h-screen text-center text-[#98202E]">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="pt-[150px] pb-[100px] px-[5%] max-w-[1200px] mx-auto min-h-screen">
      <h1 className="text-4xl font-black font-serif text-[#98202E] tracking-tight mb-12">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#98202E]/10 rounded-[20px]">
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Link href="/products" className="inline-block px-8 py-3 bg-[#98202E] text-white font-bold text-xs uppercase tracking-widest rounded transition-all hover:bg-[#7a1a25]">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white border border-[#98202E]/10 rounded-[20px] overflow-hidden shadow-sm">
              {/* Order Header */}
              <div className="bg-[#98202E]/5 p-6 border-b border-[#98202E]/10 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Order Placed</p>
                  <p className="font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total</p>
                  <p className="font-bold text-[#D09399]">₹{order.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Order #</p>
                  <p className="font-bold text-gray-900 font-mono text-sm">{order.id}</p>
                </div>
              </div>

              {/* Order Statuses & Actions */}
              <div className="p-6 border-b border-[#98202E]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex-1 w-full max-w-md">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 ${
                    order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Payment: {order.paymentStatus}
                  </span>
                  
                  {/* Order Timeline */}
                  {order.status === 'CANCELLED' ? (
                    <div className="text-red-600 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      Order Cancelled
                    </div>
                  ) : (
                    <div className="relative pt-2">
                      <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 rounded"></div>
                      <div 
                        className={`absolute top-4 left-0 h-1 bg-[#98202E] rounded transition-all duration-1000 ${
                          order.status === 'DELIVERED' ? 'w-full' : 
                          order.status === 'SHIPPED' ? 'w-1/2' : 'w-0'
                        }`}
                      ></div>
                      
                      <div className="relative flex justify-between w-full text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500">
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full mb-2 z-10 flex items-center justify-center border-2 ${['PENDING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-[#98202E] border-[#98202E] text-white' : 'bg-white border-gray-300'}`}>✓</div>
                          <span className={['PENDING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-[#98202E]' : ''}>Placed</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full mb-2 z-10 flex items-center justify-center border-2 ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-[#98202E] border-[#98202E] text-white' : 'bg-white border-gray-300'}`}>
                            {['SHIPPED', 'DELIVERED'].includes(order.status) && '✓'}
                          </div>
                          <span className={['SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-[#98202E]' : ''}>Shipped</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full mb-2 z-10 flex items-center justify-center border-2 ${order.status === 'DELIVERED' ? 'bg-[#98202E] border-[#98202E] text-white' : 'bg-white border-gray-300'}`}>
                            {order.status === 'DELIVERED' && '✓'}
                          </div>
                          <span className={order.status === 'DELIVERED' ? 'text-[#98202E]' : ''}>Delivered</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <a 
                    href={`/account/orders/${order.id}/invoice`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-[#98202E] text-[#98202E] rounded text-xs font-bold uppercase tracking-widest hover:bg-[#98202E]/5 transition-colors text-center"
                  >
                    Download Invoice
                  </a>
                  {order.status === 'PENDING' && (
                    <button 
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancelling === order.id}
                      className="px-4 py-2 bg-red-500 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {cancelling === order.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="flex flex-col gap-6">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-6 items-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                        {item.product?.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.product?.name || "Unknown Product"}</h4>
                        <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-bold text-[#98202E]">
                        ₹{item.price.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
