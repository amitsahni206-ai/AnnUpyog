import React, { useState, useEffect } from "react";
import axios from "axios";

// --- 1. BACKGROUND COMPONENT (HIGH VISIBILITY INDIAN CONTEXT) ---
function BackgroundWrapper() {
  const images = [
    // 1. Slum/Poverty in India (Real Context)
    "https://images.unsplash.com/photo-1536483213842-593308d55291?auto=format&fit=crop&q=80&w=800",
    // 2. Child Eating (Emotional Connection)
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=800",
    // 3. Food Waste / Garbage Pile (The Problem)
    "https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&q=80&w=800",
    // 4. Community Food Distribution (The Solution)
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
    // 5. Hardship / Street Life
    "https://images.unsplash.com/photo-1567157577867-05ccb738daa6?auto=format&fit=crop&q=80&w=800",
    // 6. Food Grains / Ration (Hope)
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=800"
  ];

  return (
    <div 
      className="fixed inset-0 grid grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2 w-full h-full pointer-events-none"
      // UPDATED: Increased opacity to 0.5 for higher visibility
      style={{ zIndex: -1, opacity: 0.5 }} 
    >
      {images.map((src, index) => (
        <img 
          key={index} 
          src={src} 
          alt="Impact of food waste" 
          className="w-full h-full object-cover grayscale" 
          onError={(e) => e.target.style.display = 'none'} 
        />
      ))}
      {/* UPDATED: Reduced the white overlay from /60 to /30 so images pop more */}
      <div className="absolute inset-0 bg-white/30"></div>
    </div>
  );
}

// --- 2. NGO COMPONENT ---
function NGOFeed({ foods, fetchFood }) {
  const [filterType, setFilterType] = useState('All'); 

  const available = foods.filter((item) => {
    const isApproved = item.status === "approved";
    const matchesCategory = filterType === 'All' || item.foodCategory === filterType;
    const expiryDate = new Date(item.expiryTime);
    const now = new Date();
    const isFresh = expiryDate > now; 
    return isApproved && matchesCategory && isFresh;
  });

  const handleClaim = async (id) => {
    try {
      await axios.put(`/api/claim/${id}`);
      alert("✅ Food Claimed! Thank you for helping reduce food waste.");
      fetchFood();
    } catch (err) {
      alert("Error claiming food");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-green-700">🏢 NGO Dashboard</h3>
        <select 
          className="bg-white border border-green-300 text-xs rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">Show All</option>
          <option value="Veg">🥦 Veg Only</option>
          <option value="Non-Veg">🍗 Non-Veg</option>
          <option value="Raw/Ration">📦 Raw Kits</option>
        </select>
      </div>

      {available.length === 0 ? (
        <p className="text-gray-500 italic text-sm">No fresh food found for this category.</p>
      ) : (
        available.map((item) => (
          <div key={item._id} className="bg-green-50/90 backdrop-blur-sm p-4 rounded-xl border border-green-200 mb-4 shadow-md relative overflow-hidden">
            <span className="absolute top-0 right-0 bg-green-200 text-green-800 text-[10px] px-2 py-1 rounded-bl-lg font-bold uppercase">
              {item.foodCategory || "General"}
            </span>
            <h4 className="font-bold text-green-800">{item.foodItem}</h4>
            <div className="flex gap-3 text-[11px] font-bold text-gray-500 uppercase mt-1">
              <span>📦 {item.quantity}</span>
              <span>⏰ Expires: {new Date(item.expiryTime).toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-600 mt-2 mb-3">📍 {item.address}</p>
            {item.image && (
              <img 
                src={`https://annupyog-backend.onrender.com${item.image}`} 
                alt="food" 
                className="w-full h-48 object-cover rounded-xl mb-3 shadow-md border-2 border-white"
                onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
              />
            )}
            <div className="flex gap-2">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white text-[10px] px-3 py-2 rounded-lg font-bold uppercase no-underline flex-1 text-center">View Map</a>
              {item.donorPhone && (
                 <a href={`tel:${item.donorPhone}`} className="bg-orange-500 text-white text-[10px] px-3 py-2 rounded-lg font-bold uppercase no-underline flex-1 text-center">📞 Call</a>
              )}
              <button onClick={() => handleClaim(item._id)} className="bg-green-600 text-white text-[10px] px-3 py-2 rounded-lg font-bold uppercase flex-1">Claim</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// --- 3. ADMIN COMPONENT ---
function FoodList({ foods, fetchFood, isAdmin }) {
  const handleApprove = async (id) => {
    await axios.put(`https://annupyog-backend.onrender.com/api/approve/${id}`);
    fetchFood();
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this post?")) {
      await axios.delete(`https://annupyog-backend.onrender.com/api/food/${id}`);
      fetchFood();
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-blue-700">🛠️ Admin Verification</h3>
      {foods.filter((f) => f.status !== "claimed").map((item) => {
          const isExpired = new Date(item.expiryTime) < new Date();
          return (
            <div key={item._id} className={`border-b pb-5 mb-5 ${isExpired ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-800">{item.foodItem}</h4>
                {isAdmin && (
                  <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-600 text-xs font-bold">Delete</button>
                )}
              </div>
              {isExpired && (
                <div className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">⚠️ EXPIRED - Not visible to NGOs</div>
              )}
              <div className="flex gap-4 text-xs mb-3 text-gray-600 italic">
                <span>📦 Qty: {item.quantity || "N/A"}</span>
                <span>⏰ {new Date(item.expiryTime).toLocaleString()}</span>
              </div>
              {item.image && (
                <div className="mb-3">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Evidence Photo:</p>
                  <img src={`https://annupyog-backend.onrender.com${item.image}`} alt="verification" className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm" onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Image+Not+Found"; }} />
                </div>
              )}
              <p className="text-xs text-gray-500 uppercase font-semibold">Status: <span className={item.status === "pending" ? "text-orange-500" : "text-green-500"}>{item.status}</span></p>
              {isAdmin && item.status === "pending" && !isExpired && (
                <button onClick={() => handleApprove(item._id)} className="bg-blue-500 text-white text-[10px] px-3 py-1.5 rounded mt-3 font-bold uppercase hover:bg-blue-600 transition-colors w-full shadow-sm">Approve This Food</button>
              )}
            </div>
          );
        })}
    </div>
  );
}

// --- 4. MAIN APP ---
function App() {
  const [foods, setFoods] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState({ donorName: "", donorPhone: "", foodItem: "", foodCategory: "Veg", quantity: "", expiryTime: "", address: "" });

  const fetchFood = () => {
    axios.get("https://annupyog-backend.onrender.com/api/food-list")
      .then((res) => setFoods(res.data))
      .catch((err) => console.log(err));
  };
  useEffect(() => { fetchFood(); }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "admin123") { setIsAdmin(true); setPassword(""); alert("Admin Access Granted"); } 
    else { alert("Incorrect Password"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("donorName", formData.donorName);
    data.append("foodItem", formData.foodItem);
    data.append("quantity", formData.quantity);
    data.append("expiryTime", formData.expiryTime);
    data.append("address", formData.address);
    data.append("donorPhone", formData.donorPhone);
    data.append("foodCategory", formData.foodCategory);
    const fileInput = document.getElementById("foodImage");
    if (fileInput && fileInput.files[0]) { data.append("image", fileInput.files[0]); }

    try {
      const response = await axios.post("https://annupyog-backend.onrender.com/api/donate", data, { headers: { "Content-Type": "multipart/form-data" } });
      if (response.status === 200 || response.status === 201) {
        setFormData({ donorName: "", donorPhone: "", foodItem: "", foodCategory: "Veg", quantity: "", expiryTime: "", address: "" });
        if (fileInput) fileInput.value = "";
        fetchFood();
        alert("🌟 Donation Posted! Admin will verify shortly.");
      }
    } catch (err) { console.log("Error details:", err); fetchFood(); }
  };

  return (
    // UPDATED: bg-transparent to allow background to show through
    <div className="min-h-screen bg-transparent py-10 px-4 font-sans text-gray-900 relative">
      
      {/* 1. BACKGROUND */}
      <BackgroundWrapper />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HERO SECTION */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl mb-12 flex flex-col md:flex-row items-center border border-gray-100">
          <div className="p-10 md:w-1/2">
            <h1 className="text-6xl font-black text-green-600 leading-none mb-4 italic">AnnUpyog</h1>
            <p className="text-2xl text-gray-700 font-medium mb-6">Feed a Soul, Save a Meal.</p>
            <p className="text-gray-500 leading-relaxed mb-8">Join our mission to bridge the gap between surplus food and empty plates. Every donation counts.</p>
            <div className="flex gap-4 items-center">
              <button className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-green-700">Get Started</button>
              <span className="text-sm text-gray-500 font-medium">+500 Volunteers</span>
            </div>
          </div>
          <div className="md:w-1/2 h-64 md:h-[450px] w-full">
            <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" alt="Impact" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* LOGIN SECTION */}
        <div className="mb-12 text-center">
          {!isAdmin ? (
            <form onSubmit={handleLogin} className="flex justify-center gap-2">
              <input type="password" placeholder="Admin Password" className="border p-2 rounded-lg text-sm outline-none bg-white/90 shadow-md" onChange={(e) => setPassword(e.target.value)} value={password} />
              <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">Admin Login</button>
            </form>
          ) : (
            <div>
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-md">Admin Mode Active ✅</span>
              <button onClick={() => setIsAdmin(false)} className="ml-4 text-xs text-red-500 font-bold hover:underline bg-white/80 px-2 py-1 rounded">Logout</button>
            </div>
          )}
        </div>

        {/* FORM SECTION */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-12 max-w-2xl mx-auto border-t-8 border-green-500">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🎁 Share Surplus</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="w-full border-2 p-3 rounded-xl outline-none focus:border-green-400 shadow-sm bg-white" type="tel" placeholder="Phone Number" onChange={(e) => setFormData({ ...formData, donorPhone: e.target.value })} value={formData.donorPhone} required />
              <select className="w-full border-2 p-3 rounded-xl outline-none focus:border-green-400 shadow-sm bg-white" onChange={(e) => setFormData({ ...formData, foodCategory: e.target.value })} value={formData.foodCategory}>
                <option value="Veg">🥦 Veg</option>
                <option value="Non-Veg">🍗 Non-Veg</option>
                <option value="Raw/Ration">📦 Raw/Ration</option>
                <option value="Cooked Meal">🍱 Cooked Meal</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="w-full border-2 p-3 rounded-xl outline-none focus:border-green-400 shadow-sm bg-white" type="text" placeholder="Your Name" onChange={(e) => setFormData({ ...formData, donorName: e.target.value })} value={formData.donorName} required />
              <input className="w-full border-2 p-3 rounded-xl outline-none focus:border-green-400 shadow-sm bg-white" type="text" placeholder="Food Item (e.g. Rice)" onChange={(e) => setFormData({ ...formData, foodItem: e.target.value })} value={formData.foodItem} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="w-full border-2 p-3 rounded-xl outline-none focus:border-green-400 shadow-sm mt-6 bg-white" type="text" placeholder="Quantity" onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} value={formData.quantity} required />
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wide">⏰ Expiry Date & Time</label>
                <input className="w-full border-2 p-3 rounded-xl outline-none focus:border-green-400 shadow-sm text-gray-600 font-medium bg-white" type="datetime-local" onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })} value={formData.expiryTime} required />
              </div>
            </div>
            <textarea className="w-full border-2 p-3 rounded-xl outline-none focus:border-green-400 h-20 shadow-sm bg-white" placeholder="Full Pickup Address" onChange={(e) => setFormData({ ...formData, address: e.target.value })} value={formData.address} required />
            <div className="mt-2 bg-gray-50 p-3 rounded-xl border-2 border-dashed border-gray-200">
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">📸 Upload Verification Photo</label>
              <input id="foodImage" type="file" accept="image/*" className="w-full text-xs text-gray-500" />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all text-lg transform active:scale-95">Post Donation</button>
          </form>
        </div>

        {/* DASHBOARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-md border-b-4 border-blue-500">
            <FoodList foods={foods} fetchFood={fetchFood} isAdmin={isAdmin} />
          </div>
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-md border-b-4 border-green-500">
            <NGOFeed foods={foods} fetchFood={fetchFood} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;