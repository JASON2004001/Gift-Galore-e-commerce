import React, { useState } from 'react';

const ProductDetail = ({
  product,
  allProducts = [],
  onBack,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onAddReview,
  onSelectProduct,
  user
}) => {
  const [selectedQty, setSelectedQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const isOutOfStock = product.stock <= 0;
  const mrp = Number(product.mrp || product.price);
  const discountPrice = Number(product.price);
  const discountPercentage = Number(product.discountPercentage || 0);

  // Identify related products (same category, or fallback to catalog products)
  const currentCat = (product.category || '').trim().toLowerCase();
  const currentId = product._id || product.id;

  let relatedItems = allProducts.filter((p) => {
    const pId = p._id || p.id;
    const pCat = (p.category || '').trim().toLowerCase();
    return pId !== currentId && pCat === currentCat;
  });

  if (relatedItems.length === 0) {
    relatedItems = allProducts.filter((p) => (p._id || p.id) !== currentId).slice(0, 4);
  } else {
    relatedItems = relatedItems.slice(0, 4);
  }

  // Reviews calculation
  const reviewsList = product.reviews || [];
  const averageRating = reviewsList.length > 0
    ? (reviewsList.reduce((acc, r) => acc + Number(r.rating || 5), 0) / reviewsList.length).toFixed(1)
    : '5.0';

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (onAddReview) {
      onAddReview(product._id || product.id, Number(rating), comment.trim());
    }
    setComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Navigation Breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:underline mb-6 transition"
      >
        <span>←</span>
        <span>Back to Catalog</span>
      </button>

      {/* 1. MAIN PRODUCT DETAIL CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm">
        
        {/* Left: Product Image */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-rose-50/40 border border-rose-100 relative group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80';
              }}
            />
            <button
              onClick={() => onToggleWishlist(product)}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition shadow ${
                isWishlisted ? 'bg-rose-600 text-white' : 'bg-white/80 text-gray-600 hover:text-rose-600'
              }`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Center: Details & Descriptions */}
        <div className="lg:col-span-4 flex flex-col">
          <span className="text-xs uppercase font-bold text-rose-600 tracking-wider">
            {product.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 leading-tight">
            {product.name}
          </h1>

          {/* Star Rating & Count */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex text-amber-400 text-base">
              {'★'.repeat(Math.round(Number(averageRating)))}
              {'☆'.repeat(5 - Math.round(Number(averageRating)))}
            </div>
            <span className="text-sm font-bold text-gray-800">{averageRating}</span>
            <span className="text-xs text-gray-400">
              ({reviewsList.length} verified ratings)
            </span>
          </div>

          {/* Special Discount Pricing Block */}
          <div className="border-t border-b border-gray-100 my-4 py-3 space-y-1">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wide">
              Special Discount Offer
            </span>
            <div className="flex items-baseline gap-2.5">
              {discountPercentage > 0 && (
                <span className="text-2xl font-black text-rose-600">
                  -{discountPercentage}%
                </span>
              )}
              <span className="text-3xl font-black text-gray-900">
                ₹{discountPrice.toLocaleString('en-IN')}
              </span>
            </div>
            {mrp > discountPrice && (
              <div className="text-xs text-gray-400">
                M.R.P.: <span className="line-through">₹{mrp.toLocaleString('en-IN')}</span>
              </div>
            )}
            <p className="text-[11px] text-emerald-600 font-semibold pt-1">
              Discounted Price: ₹{discountPrice.toLocaleString('en-IN')} (Inclusive of all taxes)
            </p>
          </div>

          <div className="text-sm text-gray-600 space-y-2 leading-relaxed">
            <h4 className="font-bold text-gray-900">About this item</h4>
            <p className="whitespace-pre-line">{product.description || 'Exclusive gift item.'}</p>
          </div>

          <div className="mt-6 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="text-rose-500 font-bold text-base">✓</span> 100% Genuine
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-rose-500 font-bold text-base">📦</span> Fast Delivery
            </div>
          </div>
        </div>

        {/* Right: Buy / Checkout Box */}
        <div className="lg:col-span-3 border border-gray-200 rounded-2xl p-5 bg-gray-50/50 flex flex-col justify-between h-fit space-y-4">
          <div>
            <div className="text-2xl font-black text-gray-900 mb-1">
              ₹{(discountPrice * selectedQty).toLocaleString('en-IN')}
            </div>
            {mrp > discountPrice && (
              <div className="text-xs text-gray-400 line-through mb-2">
                Total M.R.P: ₹{(mrp * selectedQty).toLocaleString('en-IN')}
              </div>
            )}
            
            {/* Delivery fee updated to ₹70 */}
            <p className="text-xs text-gray-500">
              Door-to-door delivery: <span className="font-bold text-gray-800">₹70</span>
            </p>

            <div className="mt-3">
              {isOutOfStock ? (
                <span className="text-sm font-bold text-rose-600">Currently out of stock.</span>
              ) : (
                <span className="text-sm font-bold text-emerald-600">In Stock ({product.stock} available)</span>
              )}
            </div>

            {!isOutOfStock && (
              <div className="mt-4 flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-600">Quantity:</label>
                <select
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(Number(e.target.value))}
                  className="bg-white border rounded-lg px-3 py-1.5 text-xs font-bold"
                >
                  {[...Array(Math.min(10, product.stock || 1)).keys()].map((i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-4">
            <button
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product, selectedQty)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-gray-900 transition shadow-sm disabled:bg-gray-200 disabled:text-gray-400"
            >
              Add to Cart
            </button>
            <button
              disabled={isOutOfStock}
              onClick={() => onBuyNow(product, selectedQty)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm disabled:bg-gray-200 disabled:text-gray-400"
            >
              Buy Now
            </button>
          </div>
        </div>

      </div>

      {/* 2. SIMILAR PRODUCTS SECTION (ABOVE REVIEWS) */}
      {relatedItems.length > 0 && (
        <div className="mt-12 bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-gray-900">Similar Products You May Like</h3>
              <p className="text-xs text-gray-400 mt-0.5">Recommended gifts & cosmetics from our collection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedItems.map((item) => {
              const itemMrp = Number(item.mrp || item.price);
              const itemDiscountPrice = Number(item.price);
              const itemDiscountPct = Number(item.discountPercentage || 0);

              return (
                <div
                  key={item._id || item.id}
                  onClick={() => {
                    if (onSelectProduct) {
                      onSelectProduct(item);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                >
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-rose-50/30 mb-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80';
                      }}
                    />
                    {itemDiscountPct > 0 && (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        -{itemDiscountPct}%
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-500">{item.category}</span>
                    <h4 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-rose-600 transition">
                      {item.name}
                    </h4>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-base font-black text-gray-900">
                        ₹{itemDiscountPrice.toLocaleString('en-IN')}
                      </span>
                      {itemMrp > itemDiscountPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{itemMrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectProduct) {
                        onSelectProduct(item);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="mt-3 w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition"
                  >
                    View Product
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. CUSTOMER FEEDBACK & 5-STAR RATINGS SECTION (BELOW SIMILAR PRODUCTS) */}
      <div className="mt-12 bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div>
            <h3 className="text-xl font-black text-gray-900">Customer Feedback & Reviews</h3>
            <p className="text-xs text-gray-400 mt-0.5">Ratings and reviews from verified buyers</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <span className="text-amber-500 font-black text-lg">★</span>
            <span className="text-base font-extrabold text-amber-900">{averageRating}</span>
            <span className="text-xs text-amber-700 font-semibold">/ 5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Feedback Form */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
            <h4 className="font-bold text-gray-800 text-sm mb-3">Rate & Write Your Feedback</h4>
            {user ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Your Star Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full text-xs font-bold border rounded-xl p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
                  >
                    <option value={5}>★★★★★ (5 Stars - Excellent)</option>
                    <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                    <option value={2}>★★☆☆☆ (2 Stars - Below Average)</option>
                    <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Your Comment / Review</label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts on product quality, packaging, fragrance, or shade..."
                    className="w-full text-xs border rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Submit Feedback
                </button>
              </form>
            ) : (
              <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 text-center space-y-2">
                <p className="text-xs font-bold text-rose-900">Want to write a review?</p>
                <p className="text-[11px] text-rose-600">Please sign in to rate this product and share your feedback.</p>
              </div>
            )}
          </div>

          {/* All Customer Reviews List */}
          <div className="md:col-span-7 space-y-4">
            <h4 className="font-bold text-gray-800 text-sm">
              All Customer Feedback ({reviewsList.length})
            </h4>

            {reviewsList.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-medium">No reviews written for this product yet.</p>
                <p className="text-[11px] text-gray-400 mt-1">Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {reviewsList.map((rev, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{rev.userName || 'Customer'}</span>
                      <span className="text-amber-500 font-bold">
                        {'★'.repeat(Number(rev.rating || 5))}
                        <span className="text-gray-300">{'☆'.repeat(5 - Number(rev.rating || 5))}</span>
                      </span>
                    </div>
                    <p className="text-gray-700 text-xs leading-relaxed pt-1">{rev.comment}</p>
                    {rev.createdAt && (
                      <span className="text-[10px] text-gray-400 block pt-1">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;