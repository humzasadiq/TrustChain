const {
  getOrder,
  getItemsForOrder,
  getOrders,
  orderCreation,
  handleTransactionAddressForOrder,
  getDetailsForOrder,
  getOrderWithUID
} = require("../services/supabaseService")
const { logOrderToChain } = require("../services/blockchainService")
const { uploadFile } = require("../services/storageService")

const getOrderItems = async (req, res) => {
  try {
    const { orderId } = req.body

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Missing orderId in request" })
    }

    const items = await getItemsForOrder(orderId)

    return res.status(200).json({
      success: true,
      message: items.length === 0 ? "Order exists but has no items" : "Items fetched successfully",
      items,
    })
  } catch (err) {
    const isNotFound = err.message === "Order not found"
    return res.status(isNotFound ? 404 : 500).json({
      success: false,
      message: err.message,
    })
  }
}

const getOrderID = async (req, res) => {
  try {
    const { uid } = req.body

    if (!uid) {
      return res.status(400).json({ success: false, message: "Missing uid in request" })
    }

    const order_id = await getOrder(uid)
    return res.status(200).json({
      success: true,
      order_id,
    })
  } catch (err) {
    const isNotFound =
      err.message === "Error checking order existence: JSON object requested, multiple (or no) rows returned"
    return res.status(isNotFound ? 404 : 500).json({
      success: false,
      message: err.message,
    })
  }
}

const getAllOrders = async (req, res) => {
  try {
    const orders = await getOrders()
    return res.status(200).json({
      success: true,
      orders,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

const createOrder = async (req, res) => {
  try {
    const { name, car_rfid, description, brand, engine_type, engine_cc, body_type } = req.body
    const carImage = req.file

    if (!name || !car_rfid) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Handle image upload if exists
    let imageUrl = null
    if (carImage) {
      const uploadResult = await uploadFile(carImage, 'car', 'orders')
      
      if (!uploadResult.success) {
        console.error('Image upload failed:', uploadResult.error)
        // Continue with order creation even if image upload fails
      } else {
        imageUrl = uploadResult.publicUrl
        console.log('Image uploaded successfully:', uploadResult)
      }
    }

    const order = await orderCreation(name, car_rfid, description, brand, engine_type, engine_cc, body_type, imageUrl)
    
    if (!order.error) {
      const orderTx = await logOrderToChain(order.oid.data.order_id, car_rfid)
      const orderAddressResult = await handleTransactionAddressForOrder(order.oid.data.order_id, orderTx)
      return res.status(200).json({
        success: true,
        order,
        orderTx,
        orderAddressResult,
      })
    }
    return res.status(200).json({
      success: true,
      order,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.body

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Missing orderId in request" })
    }

    const details = await getDetailsForOrder(orderId)

    return res.status(200).json({
      success: true,
      details,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

const getOrderByUID = async (req, res) => {
  try {
    const { uid } = req.body

    if (!uid) {
      return res.status(400).json({ success: false, message: "Missing uid in request" })
    }

    const order = await getOrderWithUID(uid)
    return res.status(200).json({
      success: true,
      order
    })
  } catch (err) {
    const isNotFound =
      err.message === "Error checking order existence: JSON object requested, multiple (or no) rows returned"
    return res.status(isNotFound ? 404 : 500).json({
      success: false,
      message: err.message,
    })
  }
}

module.exports = { getOrderID, getOrderItems, getAllOrders, createOrder, getOrderDetails, getOrderByUID }
