const { getItemInfo, getItemOrderInfo, getItems } = require('../services/supabaseService');

const getItem = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, message: 'Missing uid in request' });
    }

    const partInfo = await getItemInfo(uid);
    if (!partInfo) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    try {
      const partorderInfo = await getItemOrderInfo(uid);
      return res.status(200).json({
        success: true,
        partInfo,
        partorderInfo
      });
    } catch (err) {
      return res.json({ success: true, partInfo, partorderInfo: "No order related Information" })
    }

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getInventory = async (req, res) =>{
    try {
    const inventory = await getItems()
    return res.status(200).json({
      success: true,
      inventory,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

module.exports = { getItem, getInventory };
