"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, MapPin, Heart, LogOut, ChevronRight, Edit2, Plus, ShieldAlert } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { authService, dbService } from "@/backend";

export default function AccountPage() {
  const { products, wishlist, toggleWishlist, setQuickAddProduct } = useStore();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "wishlist">("profile");

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [dbPhone, setDbPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    id: "", label: "", name: "", street: "", city: "", state: "", zipCode: "", country: "India", phone: "", isDefault: false
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.displayName || "");
      setEditEmail(user.email || "");
      
      // Fetch extended user profile for phone number and addresses
      dbService.getUserProfile(user.uid).then((profile) => {
        if (profile) {
          const phone = profile.phone || user.phoneNumber || "";
          setEditPhone(phone);
          setDbPhone(phone);
          setAddresses(profile.addresses || []);
        } else {
          setEditPhone(user.phoneNumber || "");
          setDbPhone(user.phoneNumber || "");
        }
      }).catch(err => {
        console.error("Failed to load user profile from DB", err);
        setEditPhone(user.phoneNumber || "");
        setDbPhone(user.phoneNumber || "");
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === "orders") {
      setLoadingOrders(true);
      dbService.getUserOrders(user.uid).then(data => {
        setOrders(data);
        setLoadingOrders(false);
      }).catch(err => {
        console.error("Failed to fetch orders", err);
        setLoadingOrders(false);
      });
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-luxury-sand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setErrorMsg("Full name is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editEmail && !emailRegex.test(editEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (editPhone && !phoneRegex.test(editPhone.replace(/\s+/g, ''))) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await authService.updateUserProfile(editName);
      if (user) {
        await dbService.updateUserProfile(user.uid, { phone: editPhone });
        setDbPhone(editPhone);
      }
      setIsEditing(false);
      setSuccessMsg("Details successfully updated!");
      setTimeout(() => {
        setSuccessMsg(null);
      }, 2000);
    } catch (error: any) {
      console.error("Failed to update profile", error);
      setErrorMsg(error.message || "Failed to update profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (addressForm.phone && !phoneRegex.test(addressForm.phone.replace(/\s+/g, ''))) {
      alert("Please enter a valid phone number for the address.");
      return;
    }

    setIsSavingAddress(true);
    try {
      let updatedAddresses = [...addresses];
      const newAddress = { ...addressForm };

      if (!newAddress.id) {
        newAddress.id = Math.random().toString(36).substring(2, 10);
      }

      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
      } else if (updatedAddresses.length === 0) {
        newAddress.isDefault = true;
      }

      if (editingAddressId) {
        updatedAddresses = updatedAddresses.map(a => a.id === editingAddressId ? newAddress : a);
      } else {
        updatedAddresses.push(newAddress);
      }

      await dbService.updateUserProfile(user.uid, { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch (error) {
      console.error("Failed to save address", error);
      alert("Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user || !confirm("Are you sure you want to delete this address?")) return;
    try {
      const updatedAddresses = addresses.filter(a => a.id !== id);
      await dbService.updateUserProfile(user.uid, { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error("Failed to delete address", error);
      alert("Failed to delete address");
    }
  };

  const handleEditAddress = (address: any) => {
    setAddressForm({ ...address });
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
      try {
        setIsSaving(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        const file = e.target.files[0];

        if (!file.type.startsWith("image/")) {
          throw new Error("Invalid file type. Please select an image file.");
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("File size exceeds 5MB limit.");
        }

        const photoURL = await authService.uploadProfilePicture(file);
        await authService.updateUserProfile(user.displayName || "", photoURL);
        setSuccessMsg("Profile photo updated successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err: any) {
        console.error("Failed to upload image", err);
        let msg = err.message || "Failed to upload image.";
        if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("restricted")) {
          msg = "Firebase Storage upload denied. Please check your Firebase Storage security rules. They must allow authenticated users to write/upload to 'users/{userId}/...'.";
        }
        setErrorMsg(msg);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!user || !user.photoURL) return;
    if (!confirm("Are you sure you want to remove your profile photo?")) return;
    try {
      setIsSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      await authService.updateUserProfile(user.displayName || "", "");
      setSuccessMsg("Profile photo removed successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      console.error("Failed to remove image", err);
      setErrorMsg(err.message || "Failed to remove image.");
    } finally {
      setIsSaving(false);
    }
  };

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen text-white bg-black selection:bg-luxury-taupe selection:text-black flex flex-col lg:flex-row pb-20 lg:pb-0">
      {/* 1. Sidebar Navigation (Sticky) */}
      <div className="hidden lg:flex w-72 flex-shrink-0 sticky top-0 h-screen bg-black border-r border-white/10 z-40 flex-col pt-[150px] px-4 pb-6 space-y-2 overflow-y-auto shadow-2xl">
        <div className="px-2 mb-8">
          <h2 className="text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold">Dashboard</h2>
        </div>
        
        <button 
          onClick={() => setActiveTab("profile")}
          className={`w-full text-left px-5 py-4 text-[11px] uppercase tracking-widest font-bold flex justify-between items-center transition-all border-b border-white/5 ${
            activeTab === "profile" 
              ? "bg-white/10 text-white border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]" 
              : "hover:bg-white/10 text-white/60 hover:text-white border-transparent hover:border-white/20 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]"
          }`}
        >
          <span className="flex items-center gap-3"><User className="w-4 h-4" /> Personal Profile</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        </button>

        <button 
          onClick={() => setActiveTab("orders")}
          className={`w-full text-left px-5 py-4 text-[11px] uppercase tracking-widest font-bold flex justify-between items-center transition-all border-b border-white/5 ${
            activeTab === "orders" 
              ? "bg-white/10 text-white border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]" 
              : "hover:bg-white/10 text-white/60 hover:text-white border-transparent hover:border-white/20 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]"
          }`}
        >
          <span className="flex items-center gap-3"><Package className="w-4 h-4" /> Order History</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        </button>

        <button 
          onClick={() => setActiveTab("addresses")}
          className={`w-full text-left px-5 py-4 text-[11px] uppercase tracking-widest font-bold flex justify-between items-center transition-all border-b border-white/5 ${
            activeTab === "addresses" 
              ? "bg-white/10 text-white border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]" 
              : "hover:bg-white/10 text-white/60 hover:text-white border-transparent hover:border-white/20 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]"
          }`}
        >
          <span className="flex items-center gap-3"><MapPin className="w-4 h-4" /> Saved Addresses</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        </button>

        <button 
          onClick={() => setActiveTab("wishlist")}
          className={`w-full text-left px-5 py-4 text-[11px] uppercase tracking-widest font-bold flex justify-between items-center transition-all border-b border-white/5 ${
            activeTab === "wishlist" 
              ? "bg-white/10 text-white border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]" 
              : "hover:bg-white/10 text-white/60 hover:text-white border-transparent hover:border-white/20 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]"
          }`}
        >
          <span className="flex items-center gap-3"><Heart className="w-4 h-4" /> Wishlist ({wishlist.length})</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        </button>
        
        <div className="pt-6 mt-auto border-t border-luxury-sand/10">
          <button onClick={async () => { await logout(); router.push('/login'); }} className="w-full text-left px-6 py-4 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-[10px] uppercase tracking-widest font-bold flex justify-between items-center transition-all hover:backdrop-blur-md border border-transparent hover:border-red-500/30">
            <span className="flex items-center gap-3"><LogOut className="w-4 h-4" /> Secure Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Navigation */}
      <div className="lg:hidden w-full bg-black pt-[160px] px-4 pb-4 border-b border-white/10">
        <div className="flex flex-col border border-white/10 rounded-2xl overflow-hidden">
           <button onClick={() => setActiveTab("profile")} className={`w-full text-left px-5 py-4 text-[11px] uppercase tracking-widest font-bold flex justify-between items-center transition-all border-b border-white/5 ${"text-white"}`}>
            <span className="flex items-center gap-3"><User className="w-4 h-4" /> Personal Profile</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </button>
          <button onClick={() => setActiveTab("orders")} className={`w-full text-left px-5 py-4 text-[11px] uppercase tracking-widest font-bold flex justify-between items-center transition-all border-b border-white/5 ${"text-white"}`}>
            <span className="flex items-center gap-3"><Package className="w-4 h-4" /> Order History</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </button>
          <button onClick={() => setActiveTab("addresses")} className={`w-full text-left px-5 py-4 text-[11px] uppercase tracking-widest font-bold flex justify-between items-center transition-all border-b border-white/5 ${"text-white"}`}>
            <span className="flex items-center gap-3"><MapPin className="w-4 h-4" /> Saved Addresses</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </button>
          <button onClick={() => setActiveTab("wishlist")} className={`w-full text-left px-5 py-4 text-[11px] uppercase tracking-widest font-bold flex justify-between items-center transition-all border-b border-white/5 ${"text-white"}`}>
            <span className="flex items-center gap-3"><Heart className="w-4 h-4" /> Wishlist</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </button>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="flex-1 pt-12 lg:pt-[150px] pb-24 w-full">
        {/* Header Section */}
        <div className="max-w-5xl mx-auto px-6 md:px-12 mb-8 text-left">
          <span className="text-xs uppercase tracking-[0.25em] text-white font-semibold">
            {activeTab === "profile" && "My Profile"}
            {activeTab === "orders" && "Orders"}
            {activeTab === "addresses" && "Locations"}
            {activeTab === "wishlist" && "Wishlist"}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-white mt-2 font-light">
            My Account
          </h1>
          <p className="text-xs md:text-sm text-white font-sans font-light mt-4 leading-relaxed max-w-lg lg:mx-0">
            Welcome back. Manage your orders, shipping details, and saved items.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-12">
          {/* Main Dashboard Content Area */}
          <div className="space-y-10">
            <AnimatePresence mode="wait">

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Error and Success Banners */}
                  {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-700 p-6 rounded-2xl text-xs space-y-2 flex gap-3 items-start">
                      <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-semibold uppercase tracking-wider">An Error Occurred</p>
                        <p className="mt-1 text-red-600/90 font-light leading-relaxed">{errorMsg}</p>
                        {errorMsg.includes("Firebase Storage") && (
                          <div className="mt-4 p-4 bg-black/5 rounded-xl border border-red-500/15 space-y-2">
                            <p className="font-bold text-red-800 uppercase tracking-widest text-[10px]">How to fix Firebase Storage security rules:</p>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] text-red-700/80 leading-relaxed font-light">
                              <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-950 font-medium">Firebase Console</a></li>
                              <li>Select your project: <strong>thefutbol-store</strong></li>
                              <li>Click on <strong>Storage</strong> in the left sidebar, then click the <strong>Rules</strong> tab</li>
                              <li>Change the rules to allow authenticated writes:
                                <pre className="bg-black/95 text-green-400 p-3 rounded-lg mt-2 overflow-x-auto text-[10px] font-mono leading-normal">
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}
                                </pre>
                              </li>
                              <li>Click <strong>Publish</strong>. That's it! Try uploading again.</li>
                            </ol>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {successMsg && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-800 p-6 rounded-2xl text-xs flex gap-3 items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <div>
                        <p className="font-semibold uppercase tracking-wider">Success</p>
                        <p className="mt-0.5 text-green-700/90 font-light">{successMsg}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-[#121212] rounded-3xl p-8 md:p-12 border border-white/10 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-luxury-dark text-white flex items-center justify-center text-2xl font-serif shadow-inner overflow-hidden relative group">
                          {user.photoURL ? (
                            <Image src={user.photoURL} alt="Profile" fill className="object-cover" />
                          ) : (
                            user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-8 h-8" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-2xl font-serif text-white font-medium">{user.displayName || "GUEST USER"}</h2>
                          <p className="text-xs font-sans text-white mt-1">{user.email || user.phoneNumber || "No contact info"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSaving}
                          className="px-6 py-2.5 bg-transparent border border-white/30 hover:border-luxury-dark hover:bg-luxury-dark hover:text-white text-white rounded-full text-[10px] tracking-widest uppercase font-semibold transition-all duration-300 disabled:opacity-50"
                        >
                          {isSaving ? "Processing..." : "Upload Image"}
                        </button>
                        {user.photoURL && (
                          <button
                            onClick={handleDeletePhoto}
                            disabled={isSaving}
                            className="p-2.5 bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all duration-300 disabled:opacity-50"
                            title="Remove Photo"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#121212] rounded-3xl p-8 md:p-12 border border-white/10 shadow-sm">
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                      <h3 className="text-xl font-serif text-white font-medium">Personal Details</h3>
                      {!isEditing ? (
                        <button 
                          onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                          className="text-[9px] uppercase tracking-widest font-bold text-white hover:text-white transition-colors flex items-center gap-2"
                        >
                          <Edit2 className="w-3 h-3" /> Edit Details
                        </button>
                      ) : (
                        <div className="flex gap-4">
                          <button 
                            onClick={(e) => { e.preventDefault(); setIsEditing(false); setEditName(user?.displayName || ""); setEditEmail(user?.email || ""); setEditPhone(dbPhone); }}
                            className="text-[9px] uppercase tracking-widest font-bold text-white/50 hover:text-white transition-colors flex items-center gap-2"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={(e) => { e.preventDefault(); handleSaveProfile(); }}
                            disabled={isSaving}
                            className="text-[9px] uppercase tracking-widest font-bold text-green-600 hover:text-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            {isSaving ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      )}
                    </div>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white">Full Name</label>
                        <input 
                          type="text" 
                          value={isEditing ? editName : (user.displayName || "")} 
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={!isEditing} 
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-luxury-dark transition-colors disabled:opacity-70" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white">User ID</label>
                        <input type="text" value={`TFS-${user.uid.substring(0, 6).toUpperCase()}`} disabled className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-luxury-dark transition-colors font-mono text-xs font-bold tracking-widest" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white">Email Address</label>
                        <input type="email" value={isEditing ? editEmail : (user.email || "")} onChange={(e) => setEditEmail(e.target.value)} disabled={!isEditing} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-luxury-dark transition-colors disabled:opacity-70" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-white">Phone Number</label>
                        <input type="tel" value={isEditing ? editPhone : dbPhone} onChange={(e) => setEditPhone(e.target.value)} disabled={!isEditing} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-luxury-dark transition-colors disabled:opacity-70" />
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#121212] rounded-3xl p-8 md:p-12 border border-white/10 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                    <h3 className="text-xl font-serif text-white font-medium">Recent Orders</h3>
                  </div>

                  <div className="space-y-6">
                    {loadingOrders ? (
                      <div className="text-center py-10">
                        <div className="w-8 h-8 border-2 border-luxury-dark border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs mt-4 uppercase tracking-widest text-white font-semibold">Loading Orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-10 space-y-4 bg-black/50 rounded-2xl border border-white/5">
                        <Package className="w-10 h-10 text-white mx-auto" />
                        <p className="text-xs uppercase tracking-widest text-white font-semibold">No recent orders</p>
                        <p className="text-[11px] text-white font-light font-sans max-w-sm mx-auto leading-relaxed">
                          Your collection awaits. Explore our latest arrivals to buy your next classic jersey.
                        </p>
                        <Link 
                          href="/clubs"
                          className="inline-block mt-4 px-8 py-3 bg-luxury-dark text-white rounded-full text-[10px] uppercase tracking-widest font-semibold hover:bg-luxury-taupe hover:text-white transition-colors duration-300"
                        >
                          Explore Collections
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {orders.map((order, idx) => (
                          <div key={order.id || idx} className="bg-black/50 p-6 rounded-2xl border border-white/10 shadow-sm">
                            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                              <div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-white/70">Order ID: {order.id}</p>
                                <p className="text-xs font-sans text-white mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full ${
                                  order.status === 'Rejected (Out of Stock)' || order.status?.toLowerCase().includes('cancel')
                                    ? 'bg-red-500/10 text-red-400'
                                    : order.status === 'Delivered'
                                    ? 'bg-green-500/10 text-green-400'
                                    : 'bg-white/10 text-white/70'
                                }`}>{order.status}</span>
                                <p className="text-lg font-serif font-bold text-white mt-2">₹{order.totalAmount?.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="space-y-4 mb-4">
                              {order.items?.map((item: any, i: number) => (
                                <div key={i} className="flex gap-4 items-center">
                                  <div className="w-12 h-16 relative bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                    <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-serif text-white font-bold leading-tight">{item.name}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-white/70 mt-1">Qty: {item.quantity} | Size: {item.size}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="pt-4 border-t border-white/10 text-right">
                              {order.status === 'Rejected (Out of Stock)' || order.status?.toLowerCase().includes('cancel') ? (
                                <span className="inline-flex items-center gap-2 px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] uppercase tracking-widest font-bold rounded-full">
                                  ✕ Order Cancelled
                                </span>
                              ) : (
                                <Link
                                  href={`/track/${order.id}`}
                                  className="inline-block px-6 py-2 bg-white text-black hover:bg-neutral-200 text-[10px] uppercase tracking-widest font-bold rounded-full transition-colors"
                                >
                                  Track Order
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === "addresses" && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-serif text-white font-medium">Saved Locations</h3>
                    {!showAddressForm && (
                      <button 
                        onClick={() => {
                          setAddressForm({ id: "", label: "Home", name: "", street: "", city: "", state: "", zipCode: "", country: "India", phone: "", isDefault: false });
                          setShowAddressForm(true);
                        }}
                        className="px-6 py-2.5 bg-luxury-dark text-white hover:bg-luxury-taupe hover:text-white rounded-full text-[10px] tracking-widest uppercase font-semibold transition-all duration-300 flex items-center gap-2 shadow-sm"
                      >
                        <Plus className="w-3 h-3" /> Add Address
                      </button>
                    )}
                  </div>
                  
                  {showAddressForm ? (
                    <div className="bg-[#121212] p-8 rounded-3xl border border-white/10 shadow-sm">
                      <h4 className="text-lg font-serif text-white mb-6">{editingAddressId ? "Edit Address" : "Add New Address"}</h4>
                      <form onSubmit={handleSaveAddress} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white">Address Label</label>
                            <input type="text" placeholder="e.g. Home, Work" value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-luxury-dark transition-colors" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white">Full Name</label>
                            <input type="text" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-luxury-dark transition-colors" required />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white">Street Address</label>
                            <input type="text" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-luxury-dark transition-colors" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white">City</label>
                            <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-luxury-dark transition-colors" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white">State</label>
                            <input type="text" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-luxury-dark transition-colors" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white">Postal Code</label>
                            <input type="text" value={addressForm.zipCode} onChange={e => setAddressForm({...addressForm, zipCode: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-luxury-dark transition-colors" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white">Phone</label>
                            <input type="tel" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-luxury-dark transition-colors" required />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} className="w-4 h-4 rounded border-white/20 bg-black/50 text-luxury-dark focus:ring-luxury-dark focus:ring-offset-black" />
                          <label htmlFor="isDefault" className="text-xs text-white">Set as default delivery address</label>
                        </div>
                        <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                          <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }} className="px-6 py-3 text-white hover:bg-white/10 rounded-xl text-xs uppercase tracking-widest font-bold transition-colors">Cancel</button>
                          <button type="submit" disabled={isSavingAddress} className="px-8 py-3 bg-luxury-dark text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-luxury-taupe hover:text-luxury-dark transition-all duration-300 disabled:opacity-50">
                            {isSavingAddress ? "Saving..." : "Save Address"}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.length === 0 ? (
                        <div onClick={() => setShowAddressForm(true)} className="md:col-span-2 bg-[#FFEEE2]/20 backdrop-blur-md rounded-3xl p-8 border border-dashed border-white/30 hover:border-luxury-taupe hover:bg-white/40 transition-all shadow-sm flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px]">
                          <Plus className="w-8 h-8 text-white mb-3" />
                          <span className="text-xs uppercase tracking-widest text-white font-bold">Add New Location</span>
                          <p className="text-white/60 text-xs mt-2 font-sans font-light">You haven't saved any addresses yet.</p>
                        </div>
                      ) : (
                        <>
                          {addresses.map(address => (
                            <div key={address.id} className="bg-[#121212] rounded-3xl p-8 border border-white/10 shadow-sm relative group transition-all hover:border-white/20">
                              <div className="absolute top-6 right-6 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditAddress(address)} className="p-2 text-white/60 hover:text-white bg-black/50 hover:bg-luxury-dark rounded-full transition-colors" title="Edit Address"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteAddress(address.id)} className="p-2 text-red-400 hover:text-red-300 bg-black/50 hover:bg-red-500/20 rounded-full transition-colors" title="Delete Address">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                              {address.isDefault && (
                                <span className="text-[9px] uppercase tracking-widest text-luxury-sand font-bold block mb-4">Default Delivery</span>
                              )}
                              {!address.isDefault && (
                                <span className="text-[9px] uppercase tracking-widest text-white/50 font-bold block mb-4">{address.label || "Address"}</span>
                              )}
                              <h4 className="text-base font-serif text-white font-medium mb-1">{address.name}</h4>
                              <p className="text-sm text-white/80 font-sans font-light leading-relaxed">
                                {address.street}<br/>
                                {address.city}, {address.state} {address.zipCode}<br/>
                                {address.country}
                              </p>
                              <p className="text-sm text-white/80 font-sans font-light mt-4 flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-white">Phone:</span> {address.phone}
                              </p>
                            </div>
                          ))}
                          <div onClick={() => { setAddressForm({ id: "", label: "Home", name: "", street: "", city: "", state: "", zipCode: "", country: "India", phone: "", isDefault: false }); setShowAddressForm(true); }} className="bg-[#FFEEE2]/10 backdrop-blur-md rounded-3xl p-8 border border-dashed border-white/20 hover:border-luxury-taupe hover:bg-white/20 transition-all shadow-sm flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px]">
                            <Plus className="w-8 h-8 text-white mb-3 opacity-50 group-hover:opacity-100" />
                            <span className="text-xs uppercase tracking-widest text-white font-bold opacity-70 group-hover:opacity-100">Add New Location</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* WISHLIST TAB */}
              {activeTab === "wishlist" && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                    <h3 className="text-xl font-serif text-white font-medium">Wishlist</h3>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-white">{wishlist.length} Items</span>
                  </div>

                  {wishlistProducts.length === 0 ? (
                    <div className="text-center py-20 space-y-4 bg-black/50 rounded-2xl border border-white/5">
                      <Heart className="w-10 h-10 text-white mx-auto" />
                      <p className="text-xs uppercase tracking-widest text-white font-semibold">Your wishlist is empty</p>
                      <p className="text-[11px] text-white font-light font-sans max-w-sm mx-auto leading-relaxed">
                        Discover premium pieces to add to your personal collection.
                      </p>
                      <Link 
                        href="/clubs"
                        className="inline-block mt-4 px-8 py-3 bg-luxury-dark text-white rounded-full text-[10px] uppercase tracking-widest font-semibold hover:bg-luxury-taupe hover:text-white transition-colors duration-300"
                      >
                        Explore Collections
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      <AnimatePresence>
                        {wishlistProducts.map((product) => (
                          <motion.div
                            key={product.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-2xl border border-white/10 bg-luxury-dark p-3 md:p-0 md:bg-[#FFEEE2]/60 md:hover:bg-white flex flex-col justify-between transition-colors duration-500 shadow-sm relative overflow-hidden group/card"
                          >
                            <div className="relative w-full aspect-[35/32] md:aspect-auto md:h-[200px] bg-neutral-100 rounded-lg md:rounded-none overflow-hidden group">
                              <Link href={`/product/${product.id}`}>
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-contain md:object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
                                />
                              </Link>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleWishlist(product.id);
                                }}
                                className="absolute top-3 right-3 p-2 bg-[#FFEEE2]/80 backdrop-blur-md rounded-full text-white hover:text-white transition-colors shadow-sm z-10"
                                aria-label="Remove from Wishlist"
                              >
                                <Heart className="w-3.5 h-3.5 fill-luxury-taupe text-white" />
                              </button>
                            </div>

                            <div className="p-2 pt-3 md:p-4 flex flex-col justify-between flex-grow">
                              <div>
                                <span className="text-[9px] uppercase tracking-widest font-semibold text-white/80 md:text-white block mb-1">
                                  {product.category}
                                </span>
                                <Link href={`/product/${product.id}`}>
                                  <h3 className="text-[14px] md:text-sm font-serif text-white font-medium leading-tight hover:text-luxury-ivory md:hover:text-white transition-colors line-clamp-2">
                                    {product.name}
                                  </h3>
                                </Link>
                              </div>
                              <div className="flex justify-between items-end border-t border-white/20 md:border-white/10 pt-3 mt-3">
                                <span className="font-serif text-base text-white">{product.priceStr}</span>
                                <button
                                  onClick={() => setQuickAddProduct(product)}
                                  className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-semibold text-white/80 md:text-white hover:text-white flex items-center gap-1 transition-colors"
                                >
                                  Quick Add <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
