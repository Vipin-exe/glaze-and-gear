import prisma from '@/lib/prisma';
import { InvoiceDocument } from '@/components/InvoiceDocument';
import type { Order, OrderItem, Product, User } from '@prisma/client';

type FullOrder = Order & {
  items: (OrderItem & { product: Product | null })[];
  user: User | null;
};

// e.g. /admin/orders/print-batch?ids=abc,def,ghi  or  ?ids=all&from=2026-07-01&to=2026-07-06
export default async function PrintBatchPage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids } = await searchParams;
  const idList = ids?.split(',').filter(Boolean) ?? [];

  const orders = await prisma.order.findMany({
    where: { id: { in: idList } },
    include: { items: { include: { product: true } }, user: true },
  });

  return (
    <div>
      <div className="print:hidden p-4 text-center bg-gray-100 sticky top-0 z-10">
        <button
          id="print-all-btn"
          className="bg-black text-white px-6 py-2 rounded font-semibold"
        >
          Print all {orders.length} invoices
        </button>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `document.getElementById('print-all-btn').addEventListener('click', () => window.print());` }} />

      {orders.map((order, i) => (
        <div key={order.id} style={{ pageBreakAfter: i < orders.length - 1 ? 'always' : 'auto' }}>
          <InvoiceDocument order={order as FullOrder} showImages={false} />
        </div>
      ))}

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body { margin: 0; }
            .invoice-page { page-break-inside: avoid; }
          }
        `
      }} />
    </div>
  );
}
