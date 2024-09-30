import axios from 'axios';
const apiUrl = 'https://metroappgateway.azurewebsites.net/load';

const api = axios.create({
  baseURL:apiUrl , 
});

export const CallApi = async (method, url, data = null, headers = null) => {

  try {
    const response = await api({
      method,
      url,
      data,
      headers,
    });
    return response.data;
  } catch (error) {
      console.log(error);
    throw error;
  }
};
export const SubmitCallApi = async (method, url, data) => {
  try {
    const response = await api({
      method,
      url,
      data,
      headers: {
        'Content-Type': 'application/json', // Set Content-Type header to application/json
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};