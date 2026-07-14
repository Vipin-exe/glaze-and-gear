import type { Order, OrderItem, Product, User } from '@prisma/client';

type FullOrder = Order & {
  items: (OrderItem & { product: Product | null })[];
  user: User | null;
};

export function InvoiceDocument({ order, showImages = true }: { order: FullOrder; showImages?: boolean }) {
  const customerName = order.customerName || order.user?.name || 'Anonymous';
  const customerEmail = order.customerEmail || order.user?.email || 'N/A';
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculatedDiscount = order.discountAmount || (subtotal > order.totalAmount ? subtotal - order.totalAmount : 0);
  const hasDiscount = calculatedDiscount > 0;

  return (
    <div className="invoice-page bg-white text-gray-900 max-w-3xl mx-auto p-10 text-sm">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-900 pb-6 mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-wide">GLAZE &amp; GEAR</h1>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">
            123 Auto Avenue, Bangalore, Karnataka 560001<br />
            support@glazeandgear.com
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-xs font-bold uppercase tracking-[3px] text-gray-400 mb-2">Tax Invoice</h2>
          <div className="text-xs space-y-0.5">
            <p><span className="text-gray-500">No: </span><span className="font-mono font-semibold">INV-{order.id.slice(-8).toUpperCase()}</span></p>
            <p><span className="text-gray-500">Date: </span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p><span className="text-gray-500">Payment: </span>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}</p>
            {order.paymentStatus === 'PAID' && <p className="font-bold">PAID</p>}
          </div>
        </div>
      </div>

      {/* Billed to / Ship to */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 mb-1">Billed To</h3>
          <p className="font-semibold">{customerName}</p>
          <p className="text-gray-600">{customerEmail}</p>
          {order.customerPhone && <p className="text-gray-600">{order.customerPhone}</p>}
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 mb-1">Shipping Address</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{order.shippingAddress || '—'}</p>
        </div>
      </div>

      {/* Items */}
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="border-b border-gray-900">
            <th className="text-left font-bold uppercase text-[10px] tracking-[2px] py-2">Item</th>
            <th className="text-center font-bold uppercase text-[10px] tracking-[2px] py-2 w-16">Qty</th>
            <th className="text-right font-bold uppercase text-[10px] tracking-[2px] py-2 w-24">Rate</th>
            <th className="text-right font-bold uppercase text-[10px] tracking-[2px] py-2 w-28">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-3 pr-2">
                <div className="flex items-center gap-3">
                  {showImages && item.product?.image && (
                    <img src={item.product.image} alt="" className="w-10 h-10 object-cover border border-gray-200" />
                  )}
                  <div>
                    <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                    {item.product?.category && <p className="text-[10px] text-gray-400 uppercase tracking-widest">{item.product.category}</p>}
                  </div>
                </div>
              </td>
              <td className="text-center py-3">{item.quantity}</td>
              <td className="text-right py-3">₹{item.price.toLocaleString()}</td>
              <td className="text-right py-3 font-semibold">₹{(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-56 text-sm">
          <div className="flex justify-between py-1.5 text-gray-600">
            <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
          </div>
          {hasDiscount && (
            <div className="flex justify-between py-1.5 text-gray-600">
              <span>Discount {order.promoCode && `(${order.promoCode})`}</span>
              <span>-₹{calculatedDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between py-1.5 text-gray-600">
            <span>Shipping</span><span>₹0</span>
          </div>
          <div className="flex justify-between pt-3 mt-1 border-t border-gray-900 font-bold text-base">
            <span>Total</span><span>₹{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-400 tracking-wide">
        Thank you for your business — support@glazeandgear.com
      </p>
    </div>
  );
}
