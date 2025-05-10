const { logToSupabase, updateItemLocation, logToOrderItems, handleTransactionAddressForItem } = require('../services/supabaseService');
const { logToBlockchain, logItemToChain } = require('../services/blockchainService');

const handleStage = async (req, res) => {
  try {
    const { uid, stage, action, order_id } = req.body;
    const status = action === 'entry' ? 'Present' : 'Left';

    const itemLocationResult = await updateItemLocation(uid, stage, action);
    const blockchainTx = await logToBlockchain(uid, stage, status);
    console.log(blockchainTx)
    const dbResult = await logToSupabase(uid, stage, status, blockchainTx);

    if (order_id != '') {
      const orderItemsResult = await logToOrderItems(order_id, uid, stage);
      // res.json({ success: true, dbResult, blockchainTx, itemLocationResult, orderItemsResult  });
      if (orderItemsResult.success) {
        const itemTx = await logItemToChain(order_id, uid, stage)
        const orderItemTxDatabase = await handleTransactionAddressForItem(uid, itemTx)
        return res.json({orderItemsResult, itemTx, orderItemTxDatabase});

      }
      return res.json(orderItemsResult);

    }

    // res.json({ success: true, dbResult, blockchainTx, itemLocationResult  });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging event');
  }
};

module.exports = { handleStage };
