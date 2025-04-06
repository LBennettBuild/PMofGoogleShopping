import { NextResponse } from 'next/server';

// Определяем тип для параметров маршрута
interface Params {
  productId: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  const { productId } = params;

  // Проверка наличия productId
  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  const apiKey = process.env.ZENSERP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
  }

  const url = `https://app.zenserp.com/api/v1/shopping?apikey=${apiKey}&product_id=${encodeURIComponent(
    productId,
  )}&location=Manhattan,New%20York,United%20States`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Zenserp API error', details: data },
        { status: response.status },
      );
    }

    const product = {
      id: data.product_id || productId,
      name: data.title || 'Unknown',
      price:
        data.sellers?.[0]?.item_price?.value ||
        parseFloat(data.price?.replace(/[^0-9.]/g, '') || '0'),
      seller: data.sellers?.[0]?.merchant || data.source || 'Unknown',
      image: data.image || 'https://via.placeholder.com/150',
      shipping: data.sellers?.[0]?.shipping_price?.value || 0,
      totalPrice:
        data.sellers?.[0]?.total_price?.value || data.sellers?.[0]?.item_price?.value || 0,
      details: data.sellers?.[0]?.details || '',
      url: data.sellers?.[0]?.url || data.url || '',
      description: data.description || '',
      extensions: data.extensions || [],
      specifications: data.specifications || [],
    };

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error in product API route:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
