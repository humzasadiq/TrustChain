import axios from "axios"
const baseUrl = "http://localhost:5000/api"

const getItem = async (id) => {
  const response = await axios.post(baseUrl + "/", id)
  return response.data
}

const getProductList = async () => {
  const response = await axios.post(baseUrl + "/")
  return response.data
}

const fetchOrderById = async (orderId) => {
  try {
    const itemsResponse = await axios.post(`${baseUrl}/get-order-items`, {
      orderId: orderId,
    })

    if (!itemsResponse.data.success) {
      throw new Error(itemsResponse.data.message)
    }

    return {
      items: itemsResponse.data.items,
    }
  } catch (error) {
    if (error.response?.status === 404) {
      return null
    }
    // Handle network errors specifically
    if (error.code === "ERR_NETWORK") {
      throw new Error("Unable to connect to server. Please check your connection or try again later.")
    }
    throw new Error(error.response?.data?.message || error.message)
  }
}

const fetchOrderDetails = async (orderId) => {
  try {
    const response = await axios.post(`${baseUrl}/get-order-details`, {
      orderId: orderId,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data
  } catch (error) {
    if (error.response?.status === 404) {
      return null
    }
    // Handle network errors specifically
    if (error.code === "ERR_NETWORK") {
      throw new Error("Unable to connect to server. Please check your connection or try again later.")
    }
    throw new Error(error.response?.data?.message || error.message)
  }
}

const fetchPartById = async (partId) => {
  try {
    const response = await axios.post(`${baseUrl}/get-item`, {
      uid: partId,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    // Return the whole response as it contains both part and order info
    return response.data
  } catch (error) {
    if (error.response?.status === 404) {
      return null
    }
    // Handle network errors specifically
    if (error.code === "ERR_NETWORK") {
      throw new Error("Unable to connect to server. Please check your connection or try again later.")
    }
    throw new Error(error.response?.data?.message || error.message)
  }
}

const jobServices = {
  getItem,
  getProductList,
  fetchOrderById,
  fetchPartById,
  fetchOrderDetails,
}

export default jobServices
