"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function AdminInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // State for inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editThreshold, setEditThreshold] = useState<number>(5);
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/admin/inventory");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startEditing = (product: any) => {
    setEditingId(product.id);
    setEditStock(product.stock);
    setEditThreshold(product.lowStockThreshold || 5);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveInventory = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id, 
          stock: editStock,
          lowStockThreshold: editThreshold
        }),
      });

      if (res.ok) {
        showToast("Stock updated successfully!", "success");
        setProducts(products.map(p => p.id === id ? { ...p, stock: editStock, lowStockThreshold: editThreshold } : p));
        setEditingId(null);
      } else {
        showToast("Failed to update stock", "error");
      }
    } catch (error) {
      showToast("Error updating stock", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading inventory data...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-2xl z-50 animate-in slide-in-from-right-4 font-bold text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-serif font-black text-gray-900 tracking-tight">Inventory Management</h1>
          <p className="text-gray-500 mt-2 font-medium">Track stock levels and update quantities inline.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#98202E] w-64 md:w-80 shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest w-16">Image</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Product Details</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest w-40">Current Stock</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest w-40">Low Alert At</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500">No products found matching your search.</td></tr>
              ) : (
                filteredProducts.map((product) => {
                  const isEditing = editingId === product.id;
                  const threshold = product.lowStockThreshold || 5;
                  const isLowStock = product.stock > 0 && product.stock <= threshold;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-6">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200 shadow-sm">
                          {product.image ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">📦</div>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-gray-900 text-lg mb-1">{product.name}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{product.category}</span>
                          <span>₹{product.price.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        {isOutOfStock ? (
                          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-black uppercase tracking-widest rounded-full">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-black uppercase tracking-widest rounded-full">Low Stock</span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-black uppercase tracking-widest rounded-full">In Stock</span>
                        )}
                      </td>
                      <td className="p-6">
                        {isEditing ? (
                          <input 
                            type="number" 
                            min="0"
                            value={editStock} 
                            onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                            className="w-24 p-2 border border-[#98202E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98202E]/50 font-bold text-lg"
                          />
                        ) : (
                          <span className={`text-xl font-black ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-gray-900'}`}>
                            {product.stock}
                          </span>
                        )}
                      </td>
                      <td className="p-6">
                        {isEditing ? (
                          <input 
                            type="number" 
                            min="1"
                            value={editThreshold} 
                            onChange={(e) => setEditThreshold(parseInt(e.target.value) || 1)}
                            className="w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98202E]/50 font-bold"
                          />
                        ) : (
                          <span className="text-gray-500 font-medium">≤ {threshold}</span>
                        )}
                      </td>
                      <td className="p-6 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={cancelEditing}
                              className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                              disabled={saving}
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => saveInventory(product.id)}
                              className="px-4 py-2 bg-[#98202E] text-white font-bold rounded-lg hover:bg-[#60101a] transition-colors shadow-md shadow-[#98202E]/20"
                              disabled={saving}
                            >
                              {saving ? "Saving..." : "Save"}
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => startEditing(product)}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:border-[#98202E] hover:text-[#98202E] transition-all shadow-sm"
                          >
                            Update
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
