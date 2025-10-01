import { env } from '@/lib/env';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('📤 Query received:', body?.operationName);
    console.log('🌐 Using endpoint:', env.ZORA_GRAPHQL_ENDPOINT);
    
    // Preparar headers con autenticación si hay API key
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // No usar API key para evitar rate limits (la API funciona sin autenticación)
    console.log('🌐 Using unauthenticated request (no rate limits)');
    
    const response = await fetch(env.ZORA_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Log más detalles del error para debugging
      const errorText = await response.text();
      console.error('❌ API Response error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Si es una búsqueda de perfiles, filtrar solo los que tienen creatorCoin
    if (body?.operationName === 'SearchProfiles' && data?.data?.profileSearchV2?.edges) {
      const filteredEdges = data.data.profileSearchV2.edges.filter((edge: any) => 
        edge.node?.creatorCoin?.address
      );
      
      return Response.json({
        ...data,
        data: {
          ...data.data,
          profileSearchV2: {
            ...data.data.profileSearchV2,
            edges: filteredEdges
          }
        }
      });
    }
    
    return Response.json(data);
  } catch (error) {
    console.error('❌ API Route error:', error);
    
    // Para búsquedas, devolver datos vacíos en lugar de error
    if (request.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await request.clone().json();
        if (body?.operationName === 'SearchProfiles') {
          return Response.json({
            data: {
              profileSearchV2: {
                edges: []
              }
            }
          });
        }
      } catch {
        // Ignorar errores de parsing
      }
    }
    
    return Response.json(
      { 
        error: 'Service temporarily unavailable',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
