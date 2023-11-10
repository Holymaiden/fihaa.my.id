import { type NextRequest } from "next/server";

import { getGithubUser } from "@/services/github";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryType = searchParams.get("type");

  let type = "";

  if (typeof queryType === "string") {
    type = queryType;
  } else if (Array.isArray(queryType)) {
    type = queryType[0];
  }

  const response = await getGithubUser(type);

  return new Response(JSON.stringify(response.data), {
    status: response.status,
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
