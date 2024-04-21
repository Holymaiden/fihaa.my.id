import { type NextRequest } from 'next/server';

import { getMdxFileCount } from '@/common/libs/mdx';

// eslint-disable-next-line @typescript-eslint/require-await
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const querySlug: string | undefined =
    searchParams.get('slug')?.toString() || '';

  const count = getMdxFileCount('learns', querySlug);

  return new Response(JSON.stringify({ count }), {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    },
  });
}
