import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const apiKey = process.env.ZENSERP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
  }

  const url = `https://app.zenserp.com/api/v2/search?apikey=${apiKey}&q=${encodeURIComponent(
    query,
  )}&tbm=shop`;

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

    const shoppingResults = data.shopping_results || [];
    const products = shoppingResults.map((item: any) => ({
      id: item.product_id || item.position,
      name: item.title,
      price: parseFloat(item.price?.replace(/[^0-9.]/g, '') || '0'),
      seller: item.source || 'Unknown',
      image: item.thumbnail || item.image || 'https://via.placeholder.com/150',
      productId: item.product_id, // Для дальнейшего запроса деталей
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
