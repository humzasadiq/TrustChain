const { getOrder, getItemsForOrder, getOrders } = require('../services/supabaseService');

const getOrderItems = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Missing orderId in request' });
    }

    const items = await getItemsForOrder(orderId);

    return res.status(200).json({
      success: true,
      message: items.length === 0 ? 'Order exists but has no items' : 'Items fetched successfully',
      items
    });

  } catch (err) {
    const isNotFound = err.message === 'Order not found';
    return res.status(isNotFound ? 404 : 500).json({
      success: false,
      message: err.message
    });
  }
};

const getOrderID = async(req, res) =>{
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, message: 'Missing uid in request' });
    }

    const order_id = await getOrder(uid);
    return res.status(200).json({
      success: true,
      order_id
    });

  } catch (err) {
    const isNotFound = err.message === 'Error checking order existence: JSON object requested, multiple (or no) rows returned';
    return res.status(isNotFound ? 404 : 500).json({
      success: false,
      message: err.message
    });
  }

}

const getAllOrders = async(req, res) =>{
  try {
    const orders = await getOrders();
    return res.status(200).json({
      success: true,
      orders
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }


}

module.exports = { getOrderID, getOrderItems, getAllOrders };