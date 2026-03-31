import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mint = searchParams.get('mint');
  if (!mint) return NextResponse.json({ error: 'No mint' }, { status: 400 });

  const rpcUrl = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
  if (!rpcUrl) return NextResponse.json({ error: 'No RPC Key' }, { status: 500 });

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'teft-pulse',
        method: 'getAsset',
        params: { id: mint, displayOptions: { showFungible: true } }
      })
    });
    const data = await response.json();
    const result = data.result;
    
    return NextResponse.json({ 
      name: result?.content?.metadata?.name || null,
      image: result?.content?.links?.image || result?.content?.metadata?.image || null 
    });
  } catch (e) { 
    return NextResponse.json({ error: 'Helius Error' }, { status: 500 }); 
  }
}
