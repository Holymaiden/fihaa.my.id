import axios from 'axios';

const FORM_URL = 'https://api.web3forms.com/submit';

export const sendMessage = async (formData: FormData) => {
  const response = await axios.post(FORM_URL, formData);
  const status = response?.status;

  if (status >= 400) {
    return {
      status,
      message: response?.statusText,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = response.data;

  return {
    status,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    data,
  };
};
