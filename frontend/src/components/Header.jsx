import React, { useState } from 'react';

const Header = ({ 
  user, 
  onOpenAuth, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  pendingOrdersCount,
  cartCount,
  wishlistCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user && user.email?.toLowerCase() === 'babymanna1975@gmail.com';

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => handleTabSwitch('shop')} 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
          >
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white font-extrabold text-lg sm:text-xl shadow-md shadow-pink-200 shrink-0">
              G
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-black tracking-tight text-gray-900 leading-tight">
                GIFT <span className="text-rose-600">GALORE</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-rose-500 tracking-wider uppercase">
                Exclusive Gift & cosmetics
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => handleTabSwitch('shop')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'shop' ? 'bg-rose-50 text-rose-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Catalog
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => handleTabSwitch('wishlist')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'wishlist' ? 'bg-rose-50 text-rose-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>♡ Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-rose-500 text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => handleTabSwitch('cart')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'cart' ? 'bg-amber-100 text-amber-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>🛒 Cart</span>
              {cartCount > 0 && (
                <span className="bg-amber-500 text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {user && !isAdmin && (
              <button
                onClick={() => handleTabSwitch('my-orders')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === 'my-orders' ? 'bg-rose-50 text-rose-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Orders
              </button>
            )}

            {/* Admin Dashboard */}
            {isAdmin && (
              <button
                onClick={() => handleTabSwitch(activeTab === 'admin' ? 'shop' : 'admin')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-rose-600 text-white shadow'
                    : 'border border-rose-300 text-rose-700 hover:bg-rose-50'
                }`}
              >
                <span>Admin Dashboard</span>
                {pendingOrdersCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile */}
            <div className="border-l border-gray-200 pl-3 ml-1 flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-800 leading-tight">
                      {user.name} {isAdmin && <span className="text-[10px] text-rose-600 font-bold">(Admin)</span>}
                    </p>
                    <p className="text-[11px] text-gray-400">{user.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="text-xs text-rose-600 font-medium hover:underline px-2 py-1 rounded-md hover:bg-rose-50 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </nav>

          {/* Mobile hamburger toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => handleTabSwitch('cart')}
              className="p-1.5 text-gray-700 relative"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] px-1 rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-rose-50"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-rose-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <button
            onClick={() => handleTabSwitch('shop')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold"
          >
            Catalog
          </button>
          <button
            onClick={() => handleTabSwitch('wishlist')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex justify-between"
          >
            <span>Wishlist</span>
            <span>{wishlistCount}</span>
          </button>
          <button
            onClick={() => handleTabSwitch('cart')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex justify-between"
          >
            <span>Cart</span>
            <span>{cartCount}</span>
          </button>
          {user && !isAdmin && (
            <button
              onClick={() => handleTabSwitch('my-orders')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold"
            >
              My Orders
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => handleTabSwitch('admin')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600"
            >
              Admin Dashboard ({pendingOrdersCount})
            </button>
          )}
          <div className="pt-2 border-t">
            {user ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 text-xs text-rose-600 font-bold bg-rose-50 rounded-lg"
              >
                Logout ({user.email})
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-rose-600 text-white font-bold text-xs rounded-lg"
              >
                Sign In / Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;