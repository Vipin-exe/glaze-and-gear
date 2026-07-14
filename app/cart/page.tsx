"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Addresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    shippingAddress: ""
  });

  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [razorpayKeysMissing, setRazorpayKeysMissing] = useState(false);

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [flatDiscountAmount, setFlatDiscountAmount] = useState<number | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }

    if (status === "authenticated") {
      // Check if razorpay key exists in env
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID) {
        setRazorpayKeysMissing(true);
        setPaymentMethod("COD"); // Force COD
      }

      Promise.all([
        fetch('/api/cart').then(res => res.json()),
        fetch('/api/user/profile').then(res => res.json()),
        fetch('/api/user/addresses').then(res => res.json())
      ]).then(([cartData, profileData, addrData]) => {
        if (Array.isArray(cartData)) setCart(cartData);
        
        let initialInfo = { name: "", email: "", phone: "", shippingAddress: "" };
        
        if (profileData && !profileData.error) {
          initialInfo = {
            ...initialInfo,
            name: profileData.name || "",
            email: profileData.email || "",
            phone: profileData.phone || ""
          };
        }

        if (Array.isArray(addrData) && addrData.length > 0) {
          setAddresses(addrData);
          const defaultAddr = addrData.find(a => a.isDefault) || addrData[0];
          setSelectedAddressId(defaultAddr.id);
          initialInfo.shippingAddress = `${defaultAddr.name}, ${defaultAddr.street}, ${defaultAddr.city}, ${defaultAddr.state} ${defaultAddr.zip} - Phone: ${defaultAddr.phone}`;
          // Override name and phone if using saved address
          initialInfo.name = defaultAddr.name;
          initialInfo.phone = defaultAddr.phone;
        }

        setCustomerInfo(initialInfo);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, [status]);

  const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAddressId(val);
    
    if (val === "new") {
      setCustomerInfo({...customerInfo, shippingAddress: "", name: session?.user?.name || "", phone: ""});
    } else {
      const addr = addresses.find(a => a.id === val);
      if (addr) {
        setCustomerInfo({
          ...customerInfo,
          name: addr.name,
          phone: addr.phone,
          shippingAddress: `${addr.name}, ${addr.street}, ${addr.city}, ${addr.state} ${addr.zip} - Phone: ${addr.phone}`
        });
      }
    }
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const applyPromo = async () => {
    setPromoError("");
    setPromoSuccess("");
    if (!promoCodeInput) return;
    
    setApplyingPromo(true);
    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: promoCodeInput,
          cartTotal: total,
          userEmail: session?.user?.email || "" 
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedPromo(promoCodeInput.toUpperCase());
        setDiscountType(data.discountType);
        setDiscountPercent(data.discountPercent || 0);
        setFlatDiscountAmount(data.flatDiscountAmount || null);
        setMaxDiscountAmount(data.maxDiscountAmount || null);
        
        if (data.discountType === 'FLAT' && data.flatDiscountAmount) {
          setPromoSuccess(`Applied ₹${data.flatDiscountAmount} off!`);
        } else {
          setPromoSuccess(`Applied ${data.discountPercent}% off!`);
        }
      } else {
        setPromoError(data.error || "Invalid promo code");
      }
    } catch (err) {
      setPromoError("Failed to validate promo code");
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setDiscountType(null);
    setDiscountPercent(0);
    setFlatDiscountAmount(null);
    setMaxDiscountAmount(null);
    setPromoCodeInput("");
    setPromoSuccess("");
    setPromoError("");
  };

  let discountAmount = 0;
  if (discountType === 'FLAT' && flatDiscountAmount) {
    discountAmount = flatDiscountAmount;
  } else if (discountType === 'PERCENTAGE' && discountPercent) {
    discountAmount = (total * discountPercent) / 100;
    if (maxDiscountAmount && discountAmount > maxDiscountAmount) {
      discountAmount = maxDiscountAmount;
    }
  }
  const finalTotal = total - discountAmount;

  const updateQuantity = async (index: number, newQuantity: number) => {
    const item = cart[index];
    
    // Validate bounds (min 1, max available stock)
    if (newQuantity < 1) return;
    if (newQuantity > item.product.stock) {
      setCheckoutError(`Only ${item.product.stock} items available in stock for ${item.product.name}.`);
      return;
    }
    
    setCheckoutError(null);
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    setCart(newCart);

    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.productId, quantity: newQuantity })
      });
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (index: number) => {
    const item = cart[index];
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);

    try {
      await fetch(`/api/cart?productId=${item.productId}`, { method: 'DELETE' });
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    await Promise.all(cart.map(item => fetch(`/api/cart?productId=${item.productId}`, { method: 'DELETE' })));
    setCart([]);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          customerInfo,
          items: cart.map(item => ({
            id: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          })),
          promoCode: appliedPromo,
          paymentMethod
        })
      });

      const data = await res.json();

      if (res.status === 409) {
        // Stock error — show inline message
        setCheckoutError(data.details?.join('\n') || data.error);
        setIsCheckingOut(false);
        return;
      }

      if (!res.ok) throw new Error('Failed to initialize payment');

      if (data.isCod) {
        await clearCart();
        router.push(`/order-success?orderId=${data.dbOrderId}&method=COD`);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_yourkeyidhere", 
        amount: data.amount,
        currency: data.currency,
        name: "Glaze & Gear",
        description: "Premium Gifts & Auto Gear",
        order_id: data.id, 
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: data.dbOrderId
            })
          });

          if (verifyRes.ok) {
            await clearCart();
            router.push(`/order-success?orderId=${data.dbOrderId}&method=RAZORPAY`);
          } else {
            setCheckoutError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        theme: { color: "#98202E" }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        setCheckoutError("Payment failed: " + response.error.description);
      });
      rzp1.open();

    } catch (err) {
      setCheckoutError("Checkout failed. Please try again.");

    } finally {
      setIsCheckingOut(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="pt-[150px] text-center min-h-screen text-[#98202E]">Loading cart...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="pt-[150px] min-h-screen bg-[#F9EAEA]/30 px-[5%]">
        <div className="max-w-3xl mx-auto text-center py-20 bg-white rounded-3xl shadow-sm border border-[#98202E]/10">
          <h2 className="text-3xl font-serif text-[#98202E] mb-6">Please login to view your cart.</h2>
          <Link href="/login" className="inline-block bg-[#98202E] text-white px-8 py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-colors shadow-xl shadow-[#98202E]/20">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[160px] md:pt-[100px] min-h-screen bg-[#F9EAEA]/30">
      <div className="max-w-7xl mx-auto px-[5%] py-12">
        <h1 className="text-4xl font-serif font-black text-[#98202E] tracking-widest uppercase mb-12 border-b border-[#98202E]/20 pb-4">
          Your Cart
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-[#98202E]/10">
            <h2 className="text-2xl font-serif text-gray-400 italic mb-6">Your cart is currently empty.</h2>
            <Link href="/" className="inline-block bg-[#98202E] text-white px-8 py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-colors shadow-xl shadow-[#98202E]/20">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {cart.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-6 items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                    <h3 className="font-bold text-gray-900 text-lg">{item.product.name}</h3>
                    <p className="text-sm text-gray-500 uppercase tracking-widest mb-3">{item.product.category}</p>
                    
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                        <button type="button" onClick={() => updateQuantity(index, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-200 text-gray-600 font-bold transition-colors">−</button>
                        <span className="px-3 py-1 font-bold text-sm min-w-[30px] text-center">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(index, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-200 text-gray-600 font-bold transition-colors">+</button>
                      </div>
                      <button type="button" onClick={() => removeItem(index)} className="text-xs font-bold text-red-500 uppercase tracking-wider hover:text-red-700 transition-colors">Remove</button>
                    </div>
                  </div>
                  <div className="text-xl font-black text-[#98202E] sm:pr-4">
                    ₹{(item.product.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Form */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-[#98202E]/5 border border-[#98202E]/10 h-fit sticky top-[120px]">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-lg font-bold">₹{total.toLocaleString()}</span>
                </div>
                
                {/* Promo Code Section */}
                <div className="mt-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter code" 
                      className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none uppercase"
                      value={promoCodeInput}
                      onChange={e => setPromoCodeInput(e.target.value)}
                      disabled={!!appliedPromo}
                    />
                    {!appliedPromo ? (
                      <button 
                        onClick={applyPromo}
                        disabled={applyingPromo || !promoCodeInput}
                        className="bg-gray-900 text-white px-4 rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50"
                      >
                        Apply
                      </button>
                    ) : (
                      <button 
                        onClick={removePromo}
                        className="bg-red-100 text-red-600 px-4 rounded-xl font-bold text-sm hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {promoError && <p className="text-xs text-red-500 mt-2 font-bold">{promoError}</p>}
                  {promoSuccess && <p className="text-xs text-green-600 mt-2 font-bold">{promoSuccess}</p>}
                </div>

                {appliedPromo && (
                  <div className="flex justify-between items-center text-green-600 font-bold mb-4">
                    <span>Discount ({discountType === 'FLAT' ? `₹${flatDiscountAmount} flat` : `${discountPercent}%`})</span>
                    <span>- ₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-8 pb-8 border-b border-gray-100">
                <span className="text-gray-900 font-black text-xl">Final Total</span>
                <span className="text-4xl font-black text-[#98202E]">₹{finalTotal.toLocaleString()}</span>
              </div>

              <form onSubmit={handleCheckout} className="flex flex-col gap-4">
                
                {/* Shipping Details */}
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest mb-2">Shipping Details</h3>
                
                {addresses.length > 0 && (
                  <select 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E] transition-all"
                    value={selectedAddressId}
                    onChange={handleAddressSelect}
                  >
                    {addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>{addr.name} - {addr.street}, {addr.city}</option>
                    ))}
                    <option value="new">+ Add a new address</option>
                  </select>
                )}

                {selectedAddressId === "new" && (
                  <>
                    <input required type="text" placeholder="Full Name" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E]" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                    <input required type="tel" placeholder="Phone Number" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E]" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                    <textarea required placeholder="Complete Shipping Address (Street, City, State, ZIP)" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E] min-h-[100px]" value={customerInfo.shippingAddress} onChange={e => setCustomerInfo({...customerInfo, shippingAddress: e.target.value})} />
                  </>
                )}

                {/* Payment Method */}
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest mt-4 mb-2">Payment Method</h3>
                <div className="flex flex-col gap-2">
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'RAZORPAY' ? 'border-[#98202E] bg-[#98202E]/5' : 'border-gray-200'} ${razorpayKeysMissing ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="RAZORPAY" 
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={() => setPaymentMethod("RAZORPAY")}
                      disabled={razorpayKeysMissing}
                      className="mr-3"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">Pay Online (Razorpay)</span>
                      {razorpayKeysMissing && <span className="text-xs text-red-500">Currently unavailable (Missing API Keys)</span>}
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#98202E] bg-[#98202E]/5' : 'border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="mr-3"
                    />
                    <span className="font-bold text-gray-900">Cash on Delivery</span>
                  </label>
                </div>

                {checkoutError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold whitespace-pre-line">
                    ⚠️ {checkoutError}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isCheckingOut}
                  className="w-full mt-6 bg-[#98202E] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-all shadow-xl shadow-[#98202E]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? "Processing..." : "Place Order"}
                </button>
              </form>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}