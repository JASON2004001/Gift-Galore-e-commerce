import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="text-sm font-bold text-gray-200">
            GIFT GALORE Exclusive Gift & cosmetics
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Curated gifts, fragrances, skincare, and beauty deliveries.
          </p>
        </div>
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} GIFT GALORE. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;