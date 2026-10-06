import React from 'react';

const ProductCard = ({ product, onSelectProduct, onAddToCart, onToggleWishlist, isWishlisted }) => {
  const isOutOfStock = product.stock <= 0;
  const mrp = product.mrp || product.price;
  const discountPrice = product.price; // The discounted price customer pays
  const discountPercentage = product.discountPercentage || 0;

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden relative group">
      {/* Discount Percentage Badge */}
      {discountPercentage > 0 && (
        <span className="absolute top-2.5 left-2.5 z-10 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
          -{discountPercentage}% OFF
        </span>
      )}

      {/* Wishlist Heart */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product);
        }}
        className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition shadow-sm ${
          isWishlisted
            ? 'bg-rose-500 text-white'
            : 'bg-white/80 text-gray-500 hover:text-rose-500 hover:bg-white'
        }`}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      {/* Product Image & Info */}
      <div 
        onClick={() => onSelectProduct(product)} 
        className="cursor-pointer"
      >
        <div className="relative w-full h-48 bg-rose-50/50 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80';
            }}
          />
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            {product.category}
          </div>
        </div>

        <div className="p-4 pb-2">
          <h3 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-rose-600 transition">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-xs font-semibold text-gray-700">5.0</span>
            <span className="text-xs text-gray-300">•</span>
            <span className={`text-[10px] font-bold ${isOutOfStock ? 'text-rose-500' : 'text-emerald-600'}`}>
              {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing: MRP struck out & Discounted Price */}
      <div className="p-4 pt-2 mt-auto border-t border-rose-50 flex items-center justify-between gap-2">
        <div>
          {mrp > discountPrice && (
            <div className="text-[11px] text-gray-400 line-through">
              M.R.P: ₹{Number(mrp).toLocaleString('en-IN')}
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-gray-900">
              ₹{Number(discountPrice).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-gray-900 shadow-sm'
            }`}
          >
            Add
          </button>
          <button
            onClick={() => onSelectProduct(product)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;