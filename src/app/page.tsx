'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/products?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='w-full max-w-md p-6 bg-white rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold mb-4 text-center'>Search Product</h1>
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Enter the product name...'
          className='w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <button
          onClick={handleSearch}
          className='w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition'
        >
          Search
        </button>
      </div>
    </div>
  );
}
