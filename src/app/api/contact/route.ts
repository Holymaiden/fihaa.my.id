import { sendMessage } from '@/services/contact';

const FORM_API_KEY = process.env.CONTACT_FORM_API_KEY as string;

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await req.json()) as { formData: any };

    const updatedFormData = new FormData();
    updatedFormData.append('access_key', FORM_API_KEY);

    for (const key in data['formData']) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      updatedFormData.append(key, data['formData'][key]);
    }

    const response = await sendMessage(updatedFormData);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return new Response(JSON.stringify(response?.data?.message), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
    });
  }
}
