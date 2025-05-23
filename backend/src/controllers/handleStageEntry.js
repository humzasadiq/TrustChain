const { logToSupabase, updateItemLocation, logToOrderItems, handleTransactionAddressForItem, getAllEvents, getLastStageEvent, getItemOrOrder } = require('../services/supabaseService');
const { logToBlockchain, logItemToChain } = require('../services/blockchainService');

const handleStage = async (req, res) => {
  try {
    const { uid, stage, action, order_id } = req.body;
    const status = action === 'entry' ? 'Present' : 'Left';

    // Retrieve the last stage event for the uid
    const lastEvent = await getLastStageEvent(uid);
    if (lastEvent.error) {
      lastEvent = { status: 'Left', stage: 'Stage 0 (Pre-Stage)'}
      // return res.status(400).json({ success: false, message: 'No previous stage event found for this uid.' });
    }

    const itemOrOrder = await getItemOrOrder(uid);

    // For items, require exit from previous stage before entering a new stage
    if (lastEvent.status !== 'Left' && status == 'Present') {
      console.log('Previous stage must be exited before entering a new stage.')
      return res.status(400).json({ success: false, message: 'Previous stage must be exited before entering a new stage.' });
    }

    if (lastEvent.status == 'Left' && status == 'Left') {
      console.log('Can\'t exit stage before entering a stage.')
      return res.status(400).json({ success: false, message: 'Can\'t exit stage before entering a new stage.' });
    }

    // For orders, enforce sequential stage transitions
    if (itemOrOrder.message == "Tag is Order") {
      const orderStages = ['Stage 0 (Pre-Stage)', 'Stage 1 (Store)', 'Stage 2 (Sub-Assembly)', 'Stage 3 (Design)'];
      const lastStageIndex = orderStages.indexOf(lastEvent.stage);

      const newStageIndex = orderStages.indexOf(stage);

      if (newStageIndex !== lastStageIndex + 1 && status == "Present") {
        console.log('Orders must move sequentially through stages.')
        return res.status(400).json({ success: false, message: 'Orders must move sequentially through stages.' });
      }
    }


    const itemLocationResult = await updateItemLocation(uid, stage, action);
    const blockchainTx = await logToBlockchain(uid, stage, status);
    const dbResult = await logToSupabase(uid, stage, status, blockchainTx);

    if (order_id !== '') {
      const orderItemsResult = await logToOrderItems(order_id, uid, stage);
      if (orderItemsResult.success) {
        const itemTx = await logItemToChain(order_id, uid, stage);
        const orderItemTxDatabase = await handleTransactionAddressForItem(uid, itemTx);
        return res.json({ orderItemsResult, itemTx, orderItemTxDatabase, itemLocationResult, dbResult });
      }
      return res.json({ orderItemsResult, itemLocationResult, dbResult });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging event');
  }
};


const getStageEvents = async (req, res) => {
  try {
    const eventResult = await getAllEvents();
    return res.json({ success: true, eventResult });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error getting logs');
  }
}
module.exports = { handleStage, getStageEvents };
