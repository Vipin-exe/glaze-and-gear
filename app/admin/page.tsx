import prisma from '@/lib/prisma';
import Link from 'next/link';
import DashboardCharts from '@/components/DashboardCharts';

export default async function AdminDashboard() {
  const totalProducts = await prisma.product.count();
  const lowStock = await prisma.product.count({ where: { stock: { lt: 5 } } });
  
  const totalOrders = await prisma.order.count();
  const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
  
  const sales = await prisma.order.aggregate({ _sum: { totalAmount: true } });
  const totalRevenue = sales._sum.totalAmount || 0;
  
  // Real revenue calc
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const salesThisMonth = await prisma.order.aggregate({
    where: { createdAt: { gte: firstDayThisMonth } },
    _sum: { totalAmount: true }
  });
  const revThisMonth = salesThisMonth._sum.totalAmount || 0;

  // Calculate total cost from items this month
  const itemsThisMonth = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: firstDayThisMonth } } },
    select: { quantity: true, costPrice: true }
  });
  const totalCostThisMonth = itemsThisMonth.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0);
  const profitThisMonth = revThisMonth - totalCostThisMonth;

  const salesLastMonth = await prisma.order.aggregate({
    where: { createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } },
    _sum: { totalAmount: true }
  });
  const revLastMonth = salesLastMonth._sum.totalAmount || 0;

  const itemsLastMonth = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } } },
    select: { quantity: true, costPrice: true }
  });
  const totalCostLastMonth = itemsLastMonth.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0);
  const profitLastMonth = revLastMonth - totalCostLastMonth;

  let profitPercentChange = 0;
  if (profitLastMonth > 0) {
    profitPercentChange = ((profitThisMonth - profitLastMonth) / profitLastMonth) * 100;
  } else if (profitThisMonth > 0) {
    profitPercentChange = 100;
  }
  
  const isPositiveProfit = profitPercentChange >= 0;
  
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true, items: true }
  });

  // --- NEW: Dashboard Analytics Data ---
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentOrdersForChart = await prisma.order.findMany({
    where: { createdAt: { gte: sevenDaysAgo }, status: { not: 'CANCELLED' } },
    select: { createdAt: true, totalAmount: true }
  });

  const revenueByDate: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    revenueByDate[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
  }

  recentOrdersForChart.forEach(order => {
    const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (revenueByDate[dateStr] !== undefined) {
      revenueByDate[dateStr] += order.totalAmount;
    }
  });

  const revenueData = Object.keys(revenueByDate).map(date => ({
    date,
    revenue: revenueByDate[date]
  }));

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentOrderItems = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'CANCELLED' } } },
    include: { product: true }
  });

  const productStats: Record<string, { id: string, name: string, revenue: number, sales: number }> = {};
  recentOrderItems.forEach(item => {
    if (!productStats[item.productId]) {
      productStats[item.productId] = {
        id: item.productId,
        name: item.product.name,
        revenue: 0,
        sales: 0
      };
    }
    productStats[item.productId].sales += item.quantity;
    productStats[item.productId].revenue += (item.quantity * item.price);
  });

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  // -------------------------------------

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-black text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-2 font-medium">Welcome back to the Glaze & Gear command center.</p>
        </div>
      </header>

      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Main Revenue Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-[#98202E] to-[#60101a] rounded-3xl p-8 text-white shadow-xl shadow-[#98202E]/20 flex flex-col justify-between">
          <div>
            <p className="text-white/70 font-medium uppercase tracking-widest text-xs mb-2">Total Revenue</p>
            <h2 className="text-5xl font-black tracking-tighter">₹{totalRevenue.toLocaleString()}</h2>
          </div>
          <div className="mt-12 bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10 flex justify-between items-center">
            <div>
              <p className="text-xs text-white/70 uppercase tracking-widest mb-1">This Month's Profit</p>
              <p className="font-bold text-lg">₹{profitThisMonth.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${isPositiveProfit ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {isPositiveProfit ? '↑' : '↓'} {Math.abs(profitPercentChange).toFixed(1)}%
              </span>
              <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">vs last month</p>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 text-xl">📦</div>
            <p className="text-gray-500 font-medium uppercase tracking-widest text-xs mb-1">Total Orders</p>
            <h3 className="text-4xl font-black text-gray-900">{totalOrders}</h3>
          </div>
          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="text-yellow-600 font-bold">{pendingOrders} Pending</span>
            <Link href="/admin/orders" className="text-gray-400 hover:text-gray-900 transition-colors">→</Link>
          </div>
        </div>

        {/* Inventory Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4 text-xl">🏷️</div>
            <p className="text-gray-500 font-medium uppercase tracking-widest text-xs mb-1">Products</p>
            <h3 className="text-4xl font-black text-gray-900">{totalProducts}</h3>
          </div>
          <div className="mt-6 flex items-center justify-between text-sm">
            <span className={`${lowStock > 0 ? 'text-red-600' : 'text-gray-500'} font-bold`}>{lowStock} Low Stock</span>
            <Link href="/admin/products" className="text-gray-400 hover:text-gray-900 transition-colors">→</Link>
          </div>
        </div>
      </div>
      
      <DashboardCharts revenueData={revenueData} topProducts={topProducts} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Recent Orders Table (Spans 3 cols) */}
        <div className="md:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm font-bold text-[#98202E] hover:underline">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-500">No orders yet.</td></tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-gray-900">{order.customerName || order.user?.name || 'Anonymous'}</div>
                        <div className="text-xs text-gray-500">{order.customerEmail || order.user?.email || 'N/A'}</div>
                      </td>
                      <td className="py-4 text-sm text-gray-600 font-medium">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions (1 col) */}
        <div className="bg-[#0a0a0a] rounded-3xl p-8 text-white shadow-xl shadow-black/10 flex flex-col gap-4">
          <h3 className="font-bold text-lg mb-2 text-white/90">Quick Actions</h3>
          <Link href="/admin/products" className="w-full py-4 px-4 bg-white/10 hover:bg-white/20 transition-colors rounded-2xl flex items-center gap-3 border border-white/5">
            <span className="text-xl">➕</span>
            <span className="font-medium text-sm">Add Product</span>
          </Link>
          <a href="/api/admin/export" className="w-full py-4 px-4 bg-white/10 hover:bg-white/20 transition-colors rounded-2xl flex items-center gap-3 border border-white/5 text-left">
            <span className="text-xl">🖨️</span>
            <span className="font-medium text-sm">Export Orders (CSV)</span>
          </a>
        </div>

      </div>
    </div>
  );
}
