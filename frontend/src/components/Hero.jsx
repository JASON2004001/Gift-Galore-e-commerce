import React from 'react';

const Hero = ({ onShopNow }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-rose-600 via-pink-700 to-purple-800 text-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl leading-tight">
          GIFT GALORE <br />
          <span className="text-amber-300 font-serif italic text-2xl sm:text-4xl block mt-2">
            Exclusive Gift & cosmetics
          </span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-rose-100 max-w-xl font-light">
          Discover premium cosmetics, luxury hampers, and curated gift boxes with prompt doorstep dispatch.
        </p>
        <div className="mt-7 flex gap-4">
          <button
            onClick={onShopNow}
            className="px-8 py-3 bg-white hover:bg-rose-50 text-rose-700 font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
          >
            Explore Collection
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;