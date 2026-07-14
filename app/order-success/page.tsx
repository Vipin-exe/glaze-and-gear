"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderSuccessPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [method, setMethod] = useState<string>("RAZORPAY");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setOrderId(params.get("orderId"));
      setMethod(params.get("method") || "RAZORPAY");
    }
  }, []);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/user/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (orderId === null) {
      // Waiting for first useEffect
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="min-h-screen pt-[160px] md:pt-[120px] bg-[#F9EAEA]/30 flex items-center justify-center px-[5%] py-12">
      <div className="max-w-2xl w-full">
        {/* Success Banner */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg shadow-green-100">
            ✅
          </div>
          <h1 className="text-4xl font-serif font-black text-gray-900 mb-3">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 text-lg">
            {method === "COD"
              ? "Your Cash on Delivery order has been placed. Please keep cash ready at delivery."
              : "Your payment was successful. We're preparing your order!"}
          </p>
        </div>

        {/* Order Details Card */}
        {loading ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-pulse">
            <div className="h-5 bg-gray-100 rounded w-1/3 mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        ) : order ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-[#98202E]/5 border border-[#98202E]/10 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Order ID
                </p>
                <p className="font-mono font-black text-gray-900">
                  #{order.id?.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Payment
                </p>
                <span
                  className={`text-xs font-black uppercase px-3 py-1 rounded-full ${method === "COD" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
                >
                  {method === "COD" ? "Cash on Delivery" : "Paid Online"}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-50">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center px-8 py-5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      {item.product?.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-[#98202E]">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Total + Shipping */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500 text-sm">
                  Order Total
                </span>
                <span className="text-2xl font-black text-[#98202E]">
                  ₹{order.totalAmount?.toLocaleString()}
                </span>
              </div>
              {order.shippingAddress && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Shipping To
                  </p>
                  <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center text-gray-400 italic">
            Order details unavailable.
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/account/orders"
            className="flex-1 text-center bg-[#98202E] text-white py-4 px-8 rounded-xl font-bold uppercase tracking-widest hover:bg-[#7a1a25] transition-all shadow-xl shadow-[#98202E]/20"
          >
            Track My Orders
          </Link>
          <Link
            href="/products"
            className="flex-1 text-center border-2 border-[#98202E] text-[#98202E] py-4 px-8 rounded-xl font-bold uppercase tracking-widest hover:bg-[#98202E]/5 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
