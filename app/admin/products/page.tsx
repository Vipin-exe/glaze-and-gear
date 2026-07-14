"use client";
import { useState, useEffect } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  
  // form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("0");
  const [category, setCategory] = useState("glaze");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("0");
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Secure requirement: Image Size Limit (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        showToast("Image exceeds 2MB limit. Please choose a compressed file.", "error");
        return;
      }
      setImageFile(file);
      setImage(URL.createObjectURL(file)); // preview
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const uploadToCloudinary = async (file: File) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
      timestamp,
      transformation: "w_1000,c_limit,q_auto,f_auto" // Secure requirement: compression & resizing
    };
    
    // 1. Get secure signature from our backend
    const signRes = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paramsToSign })
    });
    
    if (!signRes.ok) throw new Error("Failed to securely sign the upload request. Check API Secret.");
    const { signature } = await signRes.json();
    
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!apiKey || !cloudName) throw new Error("Missing Cloudinary public keys in .env");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("api_key", apiKey);
    formData.append("transformation", "w_1000,c_limit,q_auto,f_auto");
    
    // 2. Upload securely to Cloudinary REST API
    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });
    
    if (!uploadRes.ok) throw new Error("Failed to upload image to Cloudinary");
    const uploadData = await uploadRes.json();
    return uploadData.secure_url;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImageUrl = image;
      
      // Upload file to Cloudinary ONLY if a new file was selected
      if (imageFile) {
        setUploadingImage(true);
        finalImageUrl = await uploadToCloudinary(imageFile);
      }
      
      const payload = { name, price, costPrice, category, description, image: finalImageUrl, stock, isFeatured };

      const url = editingProductId ? `/api/products/${editingProductId}` : "/api/products";
      const method = editingProductId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(`Product ${editingProductId ? "updated" : "added"} securely!`, "success");
        setShowForm(false);
        setEditingProductId(null);
        fetchProducts();
        resetForm();
      } else {
        showToast("Error saving product to database.", "error");
      }
    } catch (err) {
      showToast("Error: " + (err as Error).message, "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setName(""); setPrice(""); setCostPrice("0"); setDescription(""); setImage(""); setImageFile(null); setStock("0"); setIsFeatured(false); setEditingProductId(null);
  };

  const handleEditClick = (p: any) => {
    setName(p.name);
    setPrice(p.price.toString());
    setCostPrice(p.costPrice?.toString() || "0");
    setCategory(p.category || "glaze");
    setDescription(p.description || "");
    setImage(p.image || "");
    setImageFile(null); // No new file by default
    setStock(p.stock.toString());
    setIsFeatured(p.isFeatured);
    setEditingProductId(p.id);
    setShowForm(true);
    // scroll to top smooth
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Product deleted successfully", "success");
      fetchProducts();
    } else {
      showToast("Failed to delete product", "error");
    }
  };

  const handleInlineStockUpdate = async (id: string, newStock: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        showToast("Stock updated", "success");
        setProducts(products.map((p: any) => p.id === id ? { ...p, stock: parseInt(newStock) } : p));
      } else {
        showToast("Failed to update stock", "error");
      }
    } catch (err) {
      showToast("Error updating stock", "error");
    }
  };

  const totalPages = Math.ceil(products.length / productsPerPage);
  const currentProducts = products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  return (
    <div className="animate-in fade-in duration-500">
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-xl z-[4000] text-white font-medium animate-in slide-in-from-bottom-4 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900 tracking-tight">Products</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">Manage your inventory and catalog.</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              setShowForm(true);
            }
          }} 
          className="bg-[#0a0a0a] text-white px-6 py-3 rounded-xl font-bold tracking-wide hover:bg-gray-800 transition-colors shadow-lg shadow-black/10 flex items-center gap-2"
        >
          {showForm ? "Cancel" : "➕ Add Product"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-200/60 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-4">
            {editingProductId ? "Edit Product" : "Create New Product"}
          </h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none" placeholder="Product name" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Selling Price (₹)</label>
              <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none" placeholder="1999" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Cost Price (₹)</label>
              <input required type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none" placeholder="1000" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none">
                <option value="glaze">Glaze (Home Decor)</option>
                <option value="gears">Gears (Automotive)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Stock Quantity</label>
              <input required type="number" value={stock} onChange={e => setStock(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none" placeholder="50" />
            </div>

            {/* SECURE CLOUDINARY UPLOAD INPUT */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700">Product Image (Max 2MB)</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer overflow-hidden group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                
                {image ? (
                  <div className="relative z-0 w-full max-w-[200px] h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-bold text-sm">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-4xl block mb-2">☁️</span>
                    <span className="text-sm font-bold text-[#98202E] underline">Click to upload</span>
                    <span className="text-sm text-gray-500 ml-1">or drag and drop</span>
                    <p className="text-xs text-gray-400 mt-2">Images will be compressed securely.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none min-h-[100px]" placeholder="Detailed product description..." />
            </div>

            <div className="flex items-center gap-3 md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <input type="checkbox" id="featured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-5 h-5 accent-[#98202E]" />
              <label htmlFor="featured" className="text-sm font-bold text-gray-700 cursor-pointer">Feature on Homepage</label>
              <span className="text-xs text-gray-500 ml-2">(Will appear in the main hero/shop section)</span>
            </div>

            <div className="md:col-span-2 pt-4">
              <button 
                type="submit" 
                disabled={uploadingImage}
                className="w-full bg-[#98202E] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-colors shadow-lg shadow-[#98202E]/30 disabled:opacity-50"
              >
                {uploadingImage ? "Uploading & Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table section remains identical... */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Loading inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest w-16">Image</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Details</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Price</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Stock</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentProducts.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-gray-500">No products found.</td></tr>
                ) : (
                  currentProducts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{p.name} {p.isFeatured && <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full uppercase tracking-widest">Featured</span>}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{p.category}</div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">₹{p.price.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            defaultValue={p.stock}
                            onBlur={(e) => {
                              if (e.target.value !== p.stock.toString()) {
                                handleInlineStockUpdate(p.id, e.target.value);
                              }
                            }}
                            className={`w-20 px-2 py-1 rounded text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-[#98202E] ${p.stock > 10 ? 'bg-green-50 border-green-200 text-green-800' : p.stock > 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                          />
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-white hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-blue-600 text-sm font-medium shadow-sm mr-2">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-white hover:bg-red-500 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-600 text-sm font-medium shadow-sm">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-200 flex justify-between items-center bg-gray-50/50">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                  Showing {(currentPage - 1) * productsPerPage + 1} to {Math.min(currentPage * productsPerPage, products.length)} of {products.length}
                </p>
                <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-gray-100 transition-colors bg-white shadow-sm"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-gray-100 transition-colors bg-white shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
