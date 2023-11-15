import { NOVEL_CONTENTS } from "@/common/constant/novel";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page: string = searchParams.get("page") || "1";
    const per_page: string = searchParams.get("per_page") || "9";
    const is_new = searchParams.get("new");
    const search = searchParams.get("search");

    const filteredItems = NOVEL_CONTENTS.filter((item) => {
      if (String(is_new) === "true") {
        return String(item.is_new) === String(is_new);
      }
      return true;
    }).filter((item) => {
      if (search) {
        return item.title.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    });

    const totalItems = filteredItems.length;

    // Pagination
    const items = filteredItems.slice(
      (parseInt(page) - 1) * parseInt(per_page),
      parseInt(page) * parseInt(per_page)
    );

    return new Response(
      JSON.stringify({
        status: 200,
        data: {
          total_pages: Math.ceil(totalItems / parseInt(per_page)),
          total_datas: totalItems,
          page: parseInt(page),
          per_page: parseInt(per_page),
          datas: items,
        },
      }),
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        status: 500,
        error: error.message,
      }),
      {
        status: 500,
      }
    );
  }
}
