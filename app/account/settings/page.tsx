"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "", phone: "", street: "", city: "", state: "", zip: "", isDefault: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const fetchProfileAndAddresses = () => {
    Promise.all([
      fetch("/api/user/profile").then(res => res.json()),
      fetch("/api/user/addresses").then(res => res.json())
    ]).then(([profileData, addressData]) => {
      if (profileData && !profileData.error) {
        setProfile({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
        });
      }
      if (Array.isArray(addressData)) {
        setAddresses(addressData);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchProfileAndAddresses();
    }
  }, [status, router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        })
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (error) {
      setMessage("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress)
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewAddress({ name: "", phone: "", street: "", city: "", state: "", zip: "", isDefault: false });
        fetchProfileAndAddresses();
      } else {
        alert("Failed to add address.");
      }
    } catch (err) {
      alert("Error adding address.");
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProfileAndAddresses();
      }
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    
    setPasswordSaving(true);
    setPasswordMessage("");
    
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage("success: Password updated successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordMessage(data.error || "Failed to update password.");
      }
    } catch (err) {
      setPasswordMessage("An error occurred.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="pt-[150px] min-h-screen text-center text-[#98202E]">Loading...</div>;
  }

  return (
    <div className="pt-[160px] md:pt-[120px] min-h-screen bg-[#F9EAEA]/30">
      <div className="max-w-4xl mx-auto px-[5%] py-12 flex flex-col gap-8">
        
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#98202E]/20 gap-4">
          <h1 className="text-4xl font-serif font-black text-[#98202E] tracking-widest uppercase">
            Account Settings
          </h1>
          <Link href="/account/orders" className="text-sm font-bold text-[#98202E] uppercase tracking-widest hover:underline">
            View My Orders →
          </Link>
        </div>

        {/* Basic Profile Info */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-[#98202E]/5 border border-[#98202E]/10">
          <h2 className="text-2xl font-serif text-[#98202E] mb-6">Personal Information</h2>
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E]"
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  className="w-full p-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  value={profile.email}
                  disabled
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Phone Number</label>
              <input 
                type="tel" 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E]"
                value={profile.phone}
                onChange={e => setProfile({...profile, phone: e.target.value})}
                placeholder="+91 98765 43210"
              />
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-bold ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={saving}
              className="mt-4 bg-[#98202E] text-white px-8 py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-all disabled:opacity-50 inline-flex items-center justify-center w-full sm:w-auto self-start"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        {/* Address Book */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-[#98202E]/5 border border-[#98202E]/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif text-[#98202E]">Address Book</h2>
            {!showAddForm && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="text-sm font-bold bg-[#98202E] text-white px-4 py-2 rounded uppercase tracking-wider"
              >
                + Add New
              </button>
            )}
          </div>

          {showAddForm && (
            <form onSubmit={handleAddAddress} className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-4">
              <h3 className="font-bold text-sm uppercase tracking-widest text-gray-700 border-b pb-2 mb-2">New Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="text" placeholder="Name" className="p-3 border rounded-lg" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} />
                <input required type="tel" placeholder="Phone" className="p-3 border rounded-lg" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
              </div>
              <input required type="text" placeholder="Street Address" className="p-3 border rounded-lg" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
              <div className="grid grid-cols-3 gap-4">
                <input required type="text" placeholder="City" className="p-3 border rounded-lg" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                <input required type="text" placeholder="State" className="p-3 border rounded-lg" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                <input required type="text" placeholder="ZIP" className="p-3 border rounded-lg" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-4 h-4" />
                Make this my default address
              </label>
              <div className="flex gap-4 mt-2">
                <button type="submit" className="bg-[#98202E] text-white px-6 py-2 rounded font-bold uppercase text-sm">Save Address</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-500 font-bold uppercase text-sm px-4 hover:bg-gray-200 rounded">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.length > 0 ? addresses.map((addr) => (
              <div key={addr.id} className={`p-4 border rounded-xl relative ${addr.isDefault ? 'border-[#98202E] bg-[#98202E]/5' : 'border-gray-200'}`}>
                {addr.isDefault && <span className="absolute top-4 right-4 text-[10px] bg-[#98202E] text-white px-2 py-1 rounded uppercase tracking-wider font-bold">Default</span>}
                <p className="font-bold text-gray-900">{addr.name}</p>
                <p className="text-gray-600 text-sm mt-1">{addr.street}</p>
                <p className="text-gray-600 text-sm">{addr.city}, {addr.state} {addr.zip}</p>
                <p className="text-gray-500 text-sm mt-2">Phone: {addr.phone}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4">
                  <button onClick={() => deleteAddress(addr.id)} className="text-xs text-red-500 font-bold uppercase hover:underline">Delete</button>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 italic">No addresses saved yet.</p>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-[#98202E]/5 border border-[#98202E]/10">
          <h2 className="text-2xl font-serif text-[#98202E] mb-6">Security & Password</h2>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-6 max-w-md">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Current Password</label>
              <input 
                type="password" 
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E]"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">New Password</label>
              <input 
                type="password" 
                required
                minLength={6}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E]"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Confirm New Password</label>
              <input 
                type="password" 
                required
                minLength={6}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E]"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              />
            </div>

            {passwordMessage && (
              <div className={`p-4 rounded-xl text-sm font-bold ${passwordMessage.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {passwordMessage.replace("success: ", "")}
              </div>
            )}

            <button 
              type="submit" 
              disabled={passwordSaving}
              className="mt-4 bg-[#98202E] text-white px-8 py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-all disabled:opacity-50 inline-flex items-center justify-center self-start"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
