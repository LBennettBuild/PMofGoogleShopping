'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

type Product = {
  id: string;
  name: string;
  price: number;
  seller: string;
  image: string;
  productId?: string;
  shipping?: number;
  totalPrice?: number;
  details?: string;
  url?: string;
  description?: string;
  extensions?: string[];
  specifications?: { key: string; value: string }[];
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState(query);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/products?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.error) {
          setError(data.error + (data.details ? `: ${JSON.stringify(data.details)}` : ''));
        } else if (data.products) {
          setProducts(data.products);
        }
      } catch {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    if (query) fetchProducts();
  }, [query]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!selectedProduct?.productId) return;
      try {
        const response = await fetch(`/api/product/${selectedProduct.productId}`);
        const data = await response.json();
        if (data.product) {
          setSelectedProduct(data.product);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      }
    };
    fetchProductDetails();
  }, [selectedProduct?.productId]);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-4xl font-extrabold text-gray-800 mb-6 text-center'>
          Search Results for &quot;{query}&quot;
        </h1>

        <div className='mb-8 flex justify-center'>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search by product name...'
            className='w-full max-w-md p-3 rounded-full border-2 border-blue-300 focus:outline-none focus:border-blue-500 shadow-md'
          />
        </div>

        {loading ? (
          <p className='text-center text-gray-600'>Loading...</p>
        ) : error ? (
          <p className='text-center text-red-500'>{error}</p>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className='bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer'
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className='w-full h-48 object-cover'
                  />
                  <div className='p-4'>
                    <h3 className='text-lg font-semibold text-gray-800 truncate'>{product.name}</h3>
                    <p className='text-gray-600 font-medium'>${product.price.toFixed(2)}</p>
                    <p className='text-sm text-gray-500'>Seller: {product.seller}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-center text-gray-500 col-span-full'>No products found</p>
            )}
          </div>
        )}

        {selectedProduct && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl'>
              <h2 className='text-2xl font-bold text-gray-800 mb-4'>{selectedProduct.name}</h2>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className='w-full h-64 object-cover rounded-lg mb-4'
              />
              <p className='text-gray-600 mb-2'>
                {selectedProduct.description || 'No description available'}
              </p>
              <p className='text-lg font-semibold text-gray-800 mb-2'>
                Price: ${selectedProduct.price.toFixed(2)}
              </p>
              {selectedProduct.shipping !== undefined && (
                <p className='text-gray-600 mb-2'>
                  Shipping: ${selectedProduct.shipping.toFixed(2)}
                </p>
              )}
              {selectedProduct.totalPrice !== undefined && (
                <p className='text-gray-600 mb-2'>
                  Total: ${selectedProduct.totalPrice.toFixed(2)}
                </p>
              )}
              <p className='text-gray-600 mb-2'>Seller: {selectedProduct.seller}</p>
              {selectedProduct.details && (
                <p className='text-gray-600 mb-2'>Details: {selectedProduct.details}</p>
              )}
              {selectedProduct.extensions && selectedProduct.extensions.length > 0 && (
                <div className='mb-4'>
                  <h3 className='text-lg font-semibold text-gray-800'>Features:</h3>
                  <ul className='list-disc pl-5 text-gray-600'>
                    {selectedProduct.extensions.map((ext, index) => (
                      <li key={index}>{ext}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedProduct.specifications && selectedProduct.specifications.length > 0 && (
                <div className='mb-4'>
                  <h3 className='text-lg font-semibold text-gray-800'>Specifications:</h3>
                  {selectedProduct.specifications.map((spec, index) => (
                    <p key={index} className='text-gray-600'>
                      <span className='font-medium'>{spec.key}:</span> {spec.value}
                    </p>
                  ))}
                </div>
              )}
              <div className='flex justify-between'>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className='py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition'
                >
                  Close
                </button>
                {selectedProduct.url && (
                  <a
                    href={`https://www.google.com${selectedProduct.url}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition'
                  >
                    Go to Product
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
