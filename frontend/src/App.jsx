import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import { initialProducts } from './data/products';
import qrCodeImg from './Bar code/OR Code.png';

// Live Render Backend API URL
const API_BASE = 'https://gift-galore-backend.onrender.com/api/v1';

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'admin' | 'my-orders' | 'cart' | 'wishlist'
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cart & Wishlist state
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('omni_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('omni_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // User state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('omni_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('omni_token') || '');

  // Orders
  const [orders, setOrders] = useState([]);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Checkout modal & 2-step Payment state
  const [checkoutTarget, setCheckoutTarget] = useState(null); // { type: 'single', product, qty } OR { type: 'all', items: cart }
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Address Form, 2 = QR Code / Payment
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  // Admin Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    mrp: '',
    price: '', // Discounted Price
    discountPercentage: '',
    stock: '',
    image: '',
    description: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('omni_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('omni_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Load Products from MongoDB
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/get-products`);
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
        if (selectedProduct) {
          const updated = data.products.find(
            (p) => (p._id || p.id) === (selectedProduct._id || selectedProduct.id)
          );
          if (updated) setSelectedProduct(updated);
        }
      }
    } catch (err) {
      console.log('Backend server offline or sleeping, using fallback products');
    }
  };

  // Load Orders from MongoDB
  const fetchOrders = async () => {
    if (!token) return;
    try {
      const isAdmin = user?.email?.toLowerCase() === 'babymanna1975@gmail.com';
      const endpoint = isAdmin ? `${API_BASE}/orders/admin/all-orders` : `${API_BASE}/orders/my-orders`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user && token) {
      fetchOrders();
    }
  }, [user, token, activeTab]);

  // Auth Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignUp ? `${API_BASE}/user/register-user` : `${API_BASE}/user/login-user`;
    const payload = isSignUp
      ? { userName: authForm.name, email: authForm.email, password: authForm.password }
      : { email: authForm.email, password: authForm.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Authentication failed');
        return;
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('omni_user', JSON.stringify(data.user));
      localStorage.setItem('omni_token', data.token);

      setAuthModalOpen(false);
      setAuthForm({ name: '', email: '', password: '' });

      if (data.user.email?.toLowerCase() === 'babymanna1975@gmail.com') {
        setActiveTab('admin');
      }
    } catch (err) {
      alert('Backend server is not responding. Please make sure the service is awake and running on Render.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('omni_user');
    localStorage.removeItem('omni_token');
    setActiveTab('shop');
  };

  // Cart & Wishlist Handlers
  const handleAddToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => (item._id || item.id) === (product._id || product.id));
      if (existing) {
        return prev.map((item) =>
          (item._id || item.id) === (product._id || product.id)
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [...prev, { ...product, qty }];
    });
    alert(`Added ${product.name} to cart!`);
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((c) => (c._id || c.id) !== productId));
  };

  const handleToggleWishlist = (product) => {
    const id = product._id || product.id;
    setWishlist((prev) => {
      const exists = prev.some((p) => (p._id || p.id) === id);
      if (exists) {
        return prev.filter((p) => (p._id || p.id) !== id);
      }
      return [...prev, product];
    });
  };

  // Trigger Checkout Steps
  const handleInitiateSingleBuy = (product, qty = 1) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setCheckoutTarget({ type: 'single', product, qty: Number(qty) || 1 });
    setCheckoutStep(1);
  };

  const handleInitiateBuyAll = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (cart.length === 0) return;
    setCheckoutTarget({ type: 'all', items: cart });
    setCheckoutStep(1);
  };

  // Step 1: Validate address and open Step 2 (QR code payment screen)
  const handleAddressProceed = (e) => {
    e.preventDefault();
    if (!deliveryDetails.name || !deliveryDetails.phone || !deliveryDetails.address || !deliveryDetails.city) {
      alert('Please fill out all address details.');
      return;
    }
    setCheckoutStep(2);
  };

  // Step 2: Confirm Order after payment
  const handleFinalOrderSubmit = async () => {
    if (!token) {
      setAuthModalOpen(true);
      return;
    }

    try {
      let payload = {
        customerName: deliveryDetails.name,
        phone: deliveryDetails.phone,
        address: deliveryDetails.address,
        city: deliveryDetails.city,
        notes: deliveryDetails.notes
      };

      if (checkoutTarget.type === 'single') {
        payload.productId = checkoutTarget.product._id || checkoutTarget.product.id;
        payload.quantity = checkoutTarget.qty || 1;
      } else if (checkoutTarget.type === 'all') {
        payload.items = checkoutTarget.items.map((item) => ({
          productId: item._id || item.id,
          quantity: item.qty || 1,
        }));
      }

      const res = await fetch(`${API_BASE}/orders/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Order failed');
        return;
      }

      if (checkoutTarget.type === 'single') {
        handleRemoveFromCart(checkoutTarget.product._id || checkoutTarget.product.id);
      } else {
        setCart([]);
      }

      alert('Order placed successfully! We have received your order and payment details.');
      setCheckoutTarget(null);
      setCheckoutStep(1);
      fetchProducts();
      fetchOrders();
      setActiveTab('my-orders');
    } catch (err) {
      alert('Failed to place order.');
    }
  };

  // Handle Reviews
  const handleAddReview = async (productId, rating, comment) => {
    if (!token) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/products/${productId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Review failed');
        return;
      }
      alert('Review posted!');
      fetchProducts();
      if (selectedProduct) {
        setSelectedProduct(data.product);
      }
    } catch (err) {
      alert('Could not submit review to backend.');
    }
  };

  const processImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setNewProduct((prev) => ({ ...prev, image: e.target.result }));
    reader.readAsDataURL(file);
  };

  // Admin: Create Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in as admin.');
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/products/create-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Product upload failed');
        return;
      }
      alert('Product saved with MRP and Discounted Price!');
      setNewProduct({
        name: '',
        category: '',
        mrp: '',
        price: '',
        discountPercentage: '',
        stock: '',
        image: '',
        description: ''
      });
      fetchProducts();
    } catch (err) {
      alert('Failed to save product on backend.');
    }
  };

  const handleUpdateStock = async (productId, change) => {
    try {
      const res = await fetch(`${API_BASE}/products/update-stock/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ change })
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStock = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/products/toggle-stock/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/products/delete-product/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Product deleted successfully');
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_BASE}/orders/admin/update-status/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order request?')) return;
    try {
      const res = await fetch(`${API_BASE}/orders/admin/delete-order/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDeliveryFee = async (orderId, deliveryFee) => {
    try {
      const res = await fetch(`${API_BASE}/orders/admin/update-fee/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ deliveryFee })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin = user && user.email?.toLowerCase() === 'babymanna1975@gmail.com';
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);

  const getOrderItems = (ord) => {
    if (ord.items && ord.items.length > 0) return ord.items;
    if (ord.product) {
      return [{
        name: ord.product.name,
        price: ord.productPrice || ord.product.price,
        quantity: ord.quantity || 1,
        image: ord.product.image
      }];
    }
    return [];
  };

  const checkoutItemsSubtotal = checkoutTarget
    ? checkoutTarget.type === 'all'
      ? cartSubtotal
      : checkoutTarget.product.price * (checkoutTarget.qty || 1)
    : 0;

  const checkoutGrandTotal = checkoutItemsSubtotal + 70;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Header
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedProduct(null);
        }}
        pendingOrdersCount={orders.filter((o) => o.status === 'Pending Admin Review').length}
        cartCount={cart.reduce((sum, item) => sum + (item.qty || 1), 0)}
        wishlistCount={wishlist.length}
      />

      <div className="flex-1">
        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            allProducts={products}
            onBack={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            onBuyNow={(prod, qty) => handleInitiateSingleBuy(prod, qty)}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={wishlist.some((p) => (p._id || p.id) === (selectedProduct._id || selectedProduct.id))}
            onAddReview={handleAddReview}
            onSelectProduct={(prod) => setSelectedProduct(prod)}
            user={user}
          />
        ) : (
          <>
            {/* Catalog Page */}
            {activeTab === 'shop' && (
              <Home
                products={products}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
              />
            )}

            {/* SHOPPING CART PAGE */}
            {activeTab === 'cart' && (
              <div className="max-w-4xl mx-auto px-4 py-10 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900">
                    Shopping Cart ({cart.length})
                  </h2>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-3">
                    <p className="text-gray-400 font-medium">Your shopping cart is empty.</p>
                    <button
                      onClick={() => setActiveTab('shop')}
                      className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow hover:bg-rose-700 transition"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                    <div className="divide-y divide-gray-100">
                      {cart.map((item) => {
                        const itemId = item._id || item.id;
                        const itemMrp = item.mrp || item.price;
                        return (
                          <div key={itemId} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-xl border bg-gray-50 shrink-0 cursor-pointer"
                                onClick={() => {
                                  setSelectedProduct(item);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              />
                              <div>
                                <h4
                                  className="font-bold text-sm text-gray-900 hover:text-rose-600 cursor-pointer"
                                  onClick={() => {
                                    setSelectedProduct(item);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                >
                                  {item.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-bold text-gray-800">
                                    Qty: {item.qty || 1} × ₹{item.price}
                                  </span>
                                  {itemMrp > item.price && (
                                    <span className="text-[11px] text-gray-400 line-through">
                                      MRP: ₹{itemMrp}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 self-end sm:self-center">
                              <span className="font-black text-base text-gray-900">
                                ₹{(item.price * (item.qty || 1)).toLocaleString('en-IN')}
                              </span>

                              <button
                                onClick={() => handleInitiateSingleBuy(item, item.qty || 1)}
                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                              >
                                Buy
                              </button>

                              <button
                                onClick={() => handleRemoveFromCart(itemId)}
                                className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t pt-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <span className="text-xs text-gray-400 block font-medium uppercase">
                          Payable Total (Discounted Price)
                        </span>
                        <div className="text-2xl font-black text-gray-900">
                          ₹{cartSubtotal.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <button
                        onClick={handleInitiateBuyAll}
                        className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-gray-900 font-extrabold text-sm rounded-xl shadow hover:shadow-md transition flex items-center justify-center gap-2"
                      >
                        <span>Proceed to Buy All ({cart.length} items)</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST PAGE (CLICK OPENS PRODUCT DETAIL) */}
            {activeTab === 'wishlist' && (
              <div className="max-w-5xl mx-auto px-4 py-10 animate-in fade-in duration-200">
                <h2 className="text-2xl font-black mb-6">Your Wishlist ({wishlist.length})</h2>
                {wishlist.length === 0 ? (
                  <p className="text-gray-400">No items saved to your wishlist yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                      <div
                        key={item._id || item.id}
                        className="bg-white p-4 border border-rose-100 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                        onClick={() => {
                          setSelectedProduct(item);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <div>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-44 object-cover rounded-xl mb-3 hover:scale-[1.02] transition duration-200"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80';
                            }}
                          />
                          <span className="text-[10px] uppercase font-bold text-rose-500">{item.category}</span>
                          <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</h4>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="font-black text-rose-600">₹{item.price}</span>
                            {item.mrp && item.mrp > item.price && (
                              <span className="text-xs text-gray-400 line-through">₹{item.mrp}</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                            className="flex-1 py-1.5 bg-amber-400 hover:bg-amber-300 text-xs font-bold rounded-xl transition shadow-sm"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleWishlist(item);
                            }}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl transition border"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MY ORDERS PAGE */}
            {activeTab === 'my-orders' && !isAdmin && (
              <div className="max-w-4xl mx-auto px-4 py-10 animate-in fade-in duration-200">
                <h2 className="text-2xl font-black mb-6">My Orders</h2>
                {orders.length === 0 ? (
                  <p className="text-gray-400">No orders placed yet.</p>
                ) : (
                  orders.map((ord) => {
                    const items = getOrderItems(ord);
                    return (
                      <div key={ord._id || ord.orderId} className="bg-white border rounded-2xl p-5 mb-4 shadow-sm">
                        <div className="flex justify-between items-start border-b pb-3 mb-3">
                          <div>
                            <span className="text-xs font-bold text-gray-500">Order ID: {ord.orderId}</span>
                            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'Delivered'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'Accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.status}
                            </span>
                            {ord.deliveredAt && (
                              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                                Delivered: {ord.deliveredAt}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-400 block">Total Due / Paid</span>
                            <span className="text-lg font-black text-rose-600">₹{ord.totalAmount}</span>
                          </div>
                        </div>

                        {/* List all items within the order */}
                        <div className="space-y-2">
                          {items.map((itm, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{itm.name}</span>
                                <span className="bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                                  Qty: {itm.quantity || 1}
                                </span>
                              </div>
                              <span className="font-semibold">
                                ₹{itm.price} × {itm.quantity || 1} = ₹{(itm.price * (itm.quantity || 1)).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="text-right text-[11px] text-gray-400 pt-2">
                          Includes standard delivery fee: ₹{ord.deliveryFee !== undefined ? ord.deliveryFee : 70}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ADMIN DASHBOARD */}
            {activeTab === 'admin' && isAdmin && (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-black">Admin Dashboard</h1>
                  <span className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-bold">
                    Logged in as Admin ({user?.email})
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Admin Product Form */}
                  <div className="lg:col-span-4">
                    <form onSubmit={handleCreateProduct} className="bg-white p-6 rounded-2xl border space-y-3 sticky top-20 shadow-sm">
                      <h3 className="font-bold text-base text-gray-800">Add New Cosmetic / Gift</h3>
                      
                      <div>
                        <label className="text-[11px] font-semibold text-gray-600">Product Name</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Matte Red Lipstick"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          className="w-full text-xs border p-2.5 rounded-lg mt-0.5"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-600">Category</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Lipstick, Perfume, Gift Box"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="w-full text-xs border p-2.5 rounded-lg mt-0.5"
                        />
                      </div>

                      {/* 3 Price Inputs */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase">M.R.P. (₹)</label>
                          <input
                            required
                            type="number"
                            placeholder="e.g. 500"
                            value={newProduct.mrp}
                            onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                            className="w-full text-xs border p-2 rounded-lg mt-0.5"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-rose-600 uppercase">Discounted Price (₹)</label>
                          <input
                            required
                            type="number"
                            placeholder="e.g. 350"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            className="w-full text-xs border p-2 rounded-lg mt-0.5 font-bold text-rose-700 bg-rose-50/50"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Discount %</label>
                          <input
                            type="number"
                            placeholder="e.g. 30"
                            value={newProduct.discountPercentage}
                            onChange={(e) => setNewProduct({ ...newProduct, discountPercentage: e.target.value })}
                            className="w-full text-xs border p-2 rounded-lg mt-0.5"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-600">Stock Quantity</label>
                        <input
                          required
                          type="number"
                          placeholder="Available units"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                          className="w-full text-xs border p-2.5 rounded-lg mt-0.5"
                        />
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => processImageFile(e.target.files[0])}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-rose-300 p-4 rounded-xl text-center cursor-pointer bg-rose-50/50 hover:bg-rose-50 transition"
                      >
                        {newProduct.image ? (
                          <img src={newProduct.image} alt="preview" className="h-28 mx-auto object-cover rounded-lg" />
                        ) : (
                          <div className="py-2">
                            <p className="text-xs text-rose-600 font-bold">Browse / Drop Device Photo</p>
                            <p className="text-[10px] text-gray-400">PNG, JPG, WEBP</p>
                          </div>
                        )}
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Description..."
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="w-full text-xs border p-2.5 rounded-lg"
                      />

                      <button type="submit" className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition">
                        Save to MongoDB
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Inventory Stock Controller & Incoming Orders */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* 1. PRODUCT INVENTORY CONTROLLER */}
                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-bold text-base text-gray-800">
                            Product List & Stock Controller ({products.length})
                          </h3>
                          <p className="text-xs text-gray-400">Manage stock and view MRP vs Discounted Price.</p>
                        </div>
                      </div>

                      <div className="divide-y max-h-96 overflow-y-auto pr-1">
                        {products.map((p) => {
                          const pId = p._id || p.id;
                          const pMrp = p.mrp || p.price;
                          return (
                            <div key={pId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-12 h-12 object-cover rounded-lg border bg-gray-100 shrink-0"
                                />
                                <div>
                                  <p className="text-sm font-bold text-gray-800">{p.name}</p>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="font-bold text-rose-600">
                                      Discounted Price: ₹{p.price}
                                    </span>
                                    {pMrp > p.price && (
                                      <span className="text-gray-400 line-through">
                                        MRP: ₹{pMrp}
                                      </span>
                                    )}
                                    {p.discountPercentage > 0 && (
                                      <span className="bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded text-[10px]">
                                        -{p.discountPercentage}%
                                      </span>
                                    )}
                                  </div>
                                  <span
                                    className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      p.stock <= 0
                                        ? 'bg-rose-100 text-rose-700'
                                        : p.stock <= 5
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}
                                  >
                                    {p.stock <= 0 ? 'Out of Stock' : `${p.stock} available`}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <div className="flex items-center border rounded-lg bg-gray-50 px-1">
                                  <button
                                    onClick={() => handleUpdateStock(pId, -1)}
                                    className="w-6 h-6 hover:bg-gray-200 rounded font-bold text-gray-700 text-xs"
                                    title="Reduce stock"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs font-bold w-8 text-center">{p.stock}</span>
                                  <button
                                    onClick={() => handleUpdateStock(pId, 1)}
                                    className="w-6 h-6 hover:bg-gray-200 rounded font-bold text-gray-700 text-xs"
                                    title="Add stock"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleToggleStock(pId)}
                                  className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition ${
                                    p.stock > 0
                                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  }`}
                                >
                                  {p.stock > 0 ? 'Make Out of Stock' : 'Restock'}
                                </button>

                                <button
                                  onClick={() => handleDeleteProduct(pId)}
                                  className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. INCOMING ORDERS CONTROLLER */}
                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                      <h3 className="font-bold text-base text-gray-800 mb-4">
                        Incoming Delivery Requests ({orders.length})
                      </h3>

                      {orders.length === 0 ? (
                        <p className="text-xs text-gray-400 py-4 text-center">No orders received yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {orders.map((ord) => {
                            const items = getOrderItems(ord);
                            const itemsSubtotal = items.reduce(
                              (sum, itm) => sum + itm.price * (itm.quantity || 1),
                              0
                            );

                            return (
                              <div key={ord._id} className="border rounded-2xl p-4 bg-gray-50 flex flex-col space-y-3 text-xs">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                                  <div>
                                    <span className="font-extrabold text-gray-900 text-sm">
                                      Order {ord.orderId || ''}
                                    </span>
                                    <p className="text-gray-600 mt-1">
                                      Recipient: <span className="font-semibold">{ord.customerName}</span> ({ord.phone})
                                    </p>
                                    <p className="text-gray-500">Address: {ord.address}, {ord.city}</p>
                                    {ord.notes && <p className="text-gray-400 italic">Note / Ref: "{ord.notes}"</p>}
                                  </div>

                                  <span className={`px-2.5 py-1 rounded-full font-bold self-start ${
                                    ord.status === 'Delivered'
                                      ? 'bg-blue-100 text-blue-800'
                                      : ord.status === 'Accepted'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : ord.status === 'Rejected'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {ord.status}
                                  </span>
                                </div>

                                {/* COMBINED ITEMS LIST FOR THIS ORDER */}
                                <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1.5">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                    Ordered Items:
                                  </span>
                                  {items.map((itm, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-800">{itm.name}</span>
                                        <span className="bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.2 rounded text-[10px]">
                                          Qty: {itm.quantity || 1}
                                        </span>
                                      </div>
                                      <span className="text-gray-600">
                                        ₹{itm.price} × {itm.quantity || 1} = <strong>₹{(itm.price * (itm.quantity || 1)).toLocaleString('en-IN')}</strong>
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex flex-wrap items-center justify-between border-t pt-2 gap-2 bg-white p-2.5 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <span className="text-gray-500 text-[11px]">
                                      (Items: ₹{itemsSubtotal}) +
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <label className="text-gray-500 font-semibold text-[11px]">Delivery Fee (₹):</label>
                                      <input
                                        type="number"
                                        value={ord.deliveryFee !== undefined ? ord.deliveryFee : 70}
                                        onChange={(e) => handleUpdateDeliveryFee(ord._id, e.target.value)}
                                        className="w-16 px-2 py-0.5 border rounded font-semibold text-gray-800 text-xs"
                                      />
                                    </div>
                                    <span className="text-xs">
                                      Total: <strong className="font-black text-rose-600">₹{ord.totalAmount}</strong>
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {ord.status === 'Pending Admin Review' && (
                                      <>
                                        <button
                                          onClick={() => handleUpdateOrderStatus(ord._id, 'Accepted')}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                                        >
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => handleUpdateOrderStatus(ord._id, 'Rejected')}
                                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                    {ord.status === 'Accepted' && (
                                      <button
                                        onClick={() => handleUpdateOrderStatus(ord._id, 'Delivered')}
                                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
                                      >
                                        ✓ Mark Delivered
                                      </button>
                                    )}
                                    {(ord.status === 'Delivered' || ord.status === 'Rejected') && (
                                      <button
                                        onClick={() => handleDeleteOrder(ord._id)}
                                        className="px-2.5 py-1 bg-gray-100 hover:bg-rose-50 text-rose-600 font-bold rounded-lg border transition"
                                      >
                                        Delete Request
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 2-STEP CHECKOUT MODAL: STEP 1 (ADDRESS) -> STEP 2 (QR CODE & UPI PAYMENT) */}
      {checkoutTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* STEP 1: DELIVERY ADDRESS DETAILS */}
            {checkoutStep === 1 && (
              <>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-extrabold text-lg text-gray-900">
                    Step 1: Delivery Address
                  </h3>
                  <span className="text-[11px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                    1 of 2
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  {checkoutTarget.type === 'all'
                    ? `Ordering all ${checkoutTarget.items.length} items from cart.`
                    : `Ordering: ${checkoutTarget.product.name} (Qty: ${checkoutTarget.qty || 1})`}
                </p>

                <form onSubmit={handleAddressProceed} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-gray-600 block mb-1">Full Name</label>
                    <input
                      required
                      placeholder="Recipient Name"
                      value={deliveryDetails.name}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })}
                      className="w-full border p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 block mb-1">Mobile Number</label>
                    <input
                      required
                      placeholder="+91 98765 43210"
                      value={deliveryDetails.phone}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                      className="w-full border p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 block mb-1">Delivery Address</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House/Flat number, Street, Landmark"
                      value={deliveryDetails.address}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                      className="w-full border p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 block mb-1">City & PIN Code</label>
                    <input
                      required
                      placeholder="e.g. Kolkata 700001"
                      value={deliveryDetails.city}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                      className="w-full border p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-100 text-xs space-y-1 mt-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Product Amount (Discounted Price):</span>
                      <strong>₹{checkoutItemsSubtotal.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Standard Delivery Fee:</span>
                      <strong>₹70</strong>
                    </div>
                    <div className="border-t border-rose-200 pt-1 flex justify-between font-black text-rose-700 text-sm">
                      <span>Total Payable:</span>
                      <span>₹{checkoutGrandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutTarget(null)}
                      className="flex-1 py-2.5 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition"
                    >
                      Proceed to Payment →
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* STEP 2: PAYMENT SCREEN (QR CODE & UPI DETAILS) */}
            {checkoutStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-extrabold text-base text-gray-900">
                    Step 2: Complete Payment
                  </h3>
                  <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    Total: ₹{checkoutGrandTotal}
                  </span>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <img
                    src={qrCodeImg}
                    alt="Payment QR Code"
                    className="w-48 h-48 object-contain rounded-xl bg-white p-2 shadow-sm border border-gray-100"
                    onError={(e) => {
                      e.target.alt = 'QR Code file not found at "frontend/src/Bar code/OR Code.png"';
                    }}
                  />
                  <span className="text-[10px] text-gray-400 mt-1 font-medium">Scan using any UPI App</span>
                </div>

                {/* Instructions */}
                <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-100 text-xs text-gray-800 space-y-2 leading-relaxed">
                  <p className="font-semibold text-rose-900">
                    Please make the payment in the bar code or You can make payment UPI ID:
                  </p>
                  <div className="bg-white px-3 py-1.5 rounded-xl border border-rose-200 flex justify-between items-center font-mono font-bold text-xs text-rose-700">
                    <span>9330031119@okbizaxis</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    Or pay to this number: <strong className="font-mono text-gray-900">933003119</strong>
                  </p>
                  <p className="text-[11px] font-bold text-rose-600 pt-1">
                    If payment is done then press the confirm button please.
                  </p>
                </div>

                {/* Optional note / transaction ref */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    UPI Transaction ID / Ref No. (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 324512349876"
                    value={deliveryDetails.notes}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, notes: e.target.value })}
                    className="w-full border p-2 rounded-xl text-xs bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(1)}
                    className="flex-1 py-2.5 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition text-xs"
                  >
                    ← Edit Address
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalOrderSubmit}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition text-xs flex items-center justify-center gap-1"
                  >
                    <span>✓ Confirm Payment & Order</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="font-bold text-lg mb-1">{isSignUp ? 'Create Account' : 'Sign In'}</h3>
            <p className="text-xs text-gray-500 mb-4">Required to order products or open Admin dashboard.</p>
            <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
              {isSignUp && (
                <input
                  required
                  placeholder="Full Name"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full border p-2.5 rounded-lg"
                />
              )}
              <input
                required
                type="email"
                placeholder="Email Address"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full border p-2.5 rounded-lg"
              />
              <input
                required
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full border p-2.5 rounded-lg"
              />
              <button type="submit" className="w-full py-2.5 bg-rose-600 text-white font-bold rounded-xl shadow">
                {isSignUp ? 'Register to Database' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-center text-rose-600 underline font-semibold"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Create new account'}
              </button>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="w-full text-gray-400 text-center"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default App;
