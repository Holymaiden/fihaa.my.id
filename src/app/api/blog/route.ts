import { BLOG_ITEMS } from "@/common/constant/blog";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page: string = searchParams.get("page") || "1";
    const per_page: string = searchParams.get("per_page") || "9";
    const categories = searchParams.get("categories");
    const search = searchParams.get("search");

    const filteredItems = BLOG_ITEMS.filter((item) => {
      if (categories) {
        return item.categories.includes(parseInt(categories));
      }
      return true;
    }).filter((item) => {
      if (search) {
        return item.title.rendered.toLowerCase().includes(search.toLowerCase());
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
          total_posts: totalItems,
          page: parseInt(page),
          per_page: parseInt(per_page),
          posts: items,
          categories: categories,
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
