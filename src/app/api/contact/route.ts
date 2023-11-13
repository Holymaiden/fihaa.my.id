import { sendMessage } from "@/services/contact";

const FORM_API_KEY = process.env.CONTACT_FORM_API_KEY as string;

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const updatedFormData = new FormData();
    updatedFormData.append("access_key", FORM_API_KEY);

    for (const key in data["formData"]) {
      updatedFormData.append(key, data[key]);
    }

    const response = await sendMessage(updatedFormData);
    return new Response(JSON.stringify(response?.data?.message), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify(error), {
      status: 500,
    });
  }
}
