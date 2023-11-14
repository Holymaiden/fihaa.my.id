import { type NextRequest } from "next/server";

import { loadMdxFiles } from "@/common/libs/mdx";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryCategory: string | undefined =
    searchParams.get("category")?.toString() || "";

  const dataMdx = await loadMdxFiles("learns", queryCategory);

  const data = dataMdx.map((data: any) => {
    return data.frontMatter;
  });

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
