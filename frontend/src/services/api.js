import axios from 'axios';
const baseUrl = 'http://localhost:5000/api';

//these functions are being called on the frontend for sending data from frintend to the backend which will then send it to the api for data fetching.

const getItem = async (id) => {
    const response = await axios.post(baseUrl+"/", id);
    return response.data;
}

const getProductList = async () => {
    const response = await axios.post(baseUrl+"/");
    return response.data;
}


const jobServices = { getJobList, getJobList1 };

export default jobServices;
