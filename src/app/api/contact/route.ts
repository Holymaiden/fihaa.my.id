import { sendMessage } from "@/services/contact";
import { NextApiRequest, NextApiResponse } from "next";

const FORM_API_KEY = process.env.CONTACT_FORM_API_KEY as string;

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { formData } = req.body;

    const updatedFormData = new FormData();
    updatedFormData.append("access_key", FORM_API_KEY);

    for (const key in formData) {
      updatedFormData.append(key, formData[key]);
    }

    const response = await sendMessage(updatedFormData);
    res.status(200).json({ status: 200, message: response?.data?.message });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong!" });
  }
}
