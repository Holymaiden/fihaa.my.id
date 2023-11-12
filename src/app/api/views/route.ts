import { type NextRequest } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryId: string = searchParams.get("id") || "";
  const querySlug: string = searchParams.get("slug") || "";

  const id = parseInt(queryId);
  const slug = querySlug;

  try {
    await sql`INSERT INTO views (blog_id, slug) VALUES (${id}, ${slug})`;
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryId: string = searchParams.get("id") || "";
  const querySlug: string = searchParams.get("slug") || "";

  const id = parseInt(queryId);
  const slug = querySlug;

  try {
    const result: any = await sql`
      SELECT COUNT(*) AS count
      FROM views
      WHERE blog_id = ${id}
      AND slug = ${slug}
      LIMIT 1
    `;

    return new Response(JSON.stringify({ count: result.count }), {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  }
}
