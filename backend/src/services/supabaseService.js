const { createClient } = require('@supabase/supabase-js');
const { DateTime } = require('luxon');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const signup = async (username, email, password) => {
  try {
    // Check if email or username already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingEmail) {
      return { error: 'Email already in use' };
    }

    if (existingUsername) {
      return { error: 'Username already taken' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error: insertError } = await supabase
      .from('users')
      .insert([{ username, email, password: hashedPassword }])
      .select()
      .single();

    if (insertError) throw insertError;

    const token = jwt.sign({ id: data.id, email: data.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { message: 'User registered successfully', token, user: { id: data.id, username: data.username, email: data.email } };
  } catch (err) {
    return { error: err.message };
  }
};

const login = async (email, password) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return { success: false, error: 'Invalid credentials' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, error: 'Invalid credentials' };
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return { 
      success: true,
      message: 'Login successful', 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      } 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};


const logToSupabase = async (uid, stage, status, transaction_address) => {
  const karachiTime = DateTime.now().setZone('Asia/Karachi');
  const formattedDate = karachiTime.toFormat('yyyy-MM-dd HH:mm:ss');

  const { data, error } = await supabase.from('stage_events').insert([
    { uid, stage, status, timestamp: formattedDate, transaction_address }
  ]);
  if (error) throw error;
  return data;
};

const logToOrderItems = async (oid, uid, stage) => {
  try {
    const karachiTime = DateTime.now().setZone('Asia/Karachi');
    const formattedDate = karachiTime.toFormat('yyyy-MM-dd HH:mm:ss');

    const { data: orderData, error } = await supabase.from('orders').select('car_rfid').eq('car_rfid', uid).single();
    if (orderData) {
      return { success: false, message: "It is RFID of an order" };
    }

    const { data, error: insertError } = await supabase.from('order_items').insert([
      { order_id: oid, item_uid: uid, stage, timestamp: formattedDate }
    ]);

    if (insertError) {
      // Check if it's a unique constraint violation
      if (insertError.message.includes('duplicate key value') || insertError.message.includes('unique constraint')) {
        return { success: false, message: `Item with UID ${uid} is already assigned to an order.` };
      }

      // Other insert errors
      console.error('Insert error:', insertError);
      return { success: false, message: 'Insert failed.', error: insertError.message };
    }

    return { success: true, data };

  } catch (err) {
    console.error('Catch block error:', err);
    return { success: false, message: 'Unexpected server error.', error: err.message };
  }
};

const handleTransactionAddressForItem = async (item_uid, transaction_address) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .update({ transaction_address })
      .eq('item_uid', item_uid);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, message: 'Server error', error: err.message };
  }
};
const updateItemLocation = async (uid, stage, action) => {
  const { data: existing, error: findError } = await supabase
    .from('item_location')
    .select('*')
    .eq('uid', uid)
    .single();

  if (findError && findError.code !== 'PGRST116') {
    // Unexpected Supabase error
    throw findError;
  }

  if (!existing) {
    // UID doesn't exist — insert new
    const { data, error } = await supabase
      .from('item_location')
      .insert([{ uid, stage: action === 'entry' ? stage : '' }]);
    if (error) throw error;
    return { status: 'Inserted', data };
  } else {
    // UID exists — update stage if action is "entry"
    const updatedStage = action === 'entry' ? stage : '';
    const { data, error } = await supabase
      .from('item_location')
      .update({ stage: updatedStage })
      .eq('uid', uid);
    if (error) throw error;
    return { status: 'Updated', data };
  }
};

const getItemsForOrder = async (orderId) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('order_id')
    .eq('order_id', orderId)
    .maybeSingle();

  if (orderError) {
    throw new Error(`Error checking order existence: ${orderError.message}`);
  }

  if (!order) {
    throw new Error('Order not found');
  }

  // Step 2: Fetch items for the order
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (itemsError) {
    throw new Error(`Error fetching order items: ${itemsError.message}`);
  }

  return items;
};

const getOrder = async (uid) => {
  const { data, error } = await supabase
    .from('orders')
    .select('order_id')
    .ilike('car_rfid', uid)
    .single();

  if (error) {
    throw new Error(`Error checking order existence: ${error.message}`);
  }

  if (!data) {
    throw new Error('Invalid RFID tag for order');
  }


  return data.order_id;
};

const getDetailsForOrder = async (oid) => {
  const { data, error } = await supabase.from("orders").select("*").eq("order_id", oid).single()

  if (error) {
    throw new Error(`Error fetching order details: ${error.message}`)
  }

  if (!data) {
    throw new Error("Order not found")
  }
  return data
}


// Fetch item info from rfid_items table
async function getItemInfo(uid) {
  const { data, error } = await supabase
    .from('rfid_items')
    .select('*')
    .eq('uid', uid)
    .single();

  if (error) throw new Error(error.message);

  if (data.item_details_id) {
    const { data: detail_data, error: detail_error } = await supabase
      .from('item_details')
      .select('*')
      .eq('item_uid', uid) // Use uid, not item_details_id
      .maybeSingle();
    return ({ ...data, ...detail_data })
  }
  return {data};
}

// Fetch related order info from order_items table
async function getItemOrderInfo(uid) {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('item_uid', uid)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

const getOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select("*")

  if (error) {
    throw new Error('Error fetching orders')
  }

  if (!data) {
    throw new Error('No Orders Found')
  }

  return data;
}


const orderCreation = async (name, car_rfid, description, brand, engine_type, engine_cc, body_type, image) => {
  const { data: rfidItem, error: rfidError } = await supabase
    .from('rfid_items')
    .select('*')
    .eq('uid', car_rfid)
    .single();

  if (rfidError && rfidError.code !== 'PGRST116') {
    return { error: 'Error querying rfid_items', details: rfidError };
  }

  // If car_rfid not in rfid_items, insert it
  if (!rfidItem) {
    const { error: insertError } = await supabase
      .from('rfid_items')
      .insert({ uid: car_rfid, name, description });

    if (insertError) {
      return { error: 'Error inserting into rfid_items', details: insertError };
    }
  }

  // Check if car_rfid is already part of an order_item
  const { data: itemMatch } = await supabase
    .from('order_items')
    .select('item_uid')
    .eq('item_uid', car_rfid)
    .maybeSingle();

  if (itemMatch) {
    return { error: 'This item is a part and cannot be used as an order' };
  }

  // Check if order already exists
  const { data: orderMatch } = await supabase
    .from('orders')
    .select('*')
    .eq('car_rfid', car_rfid)
    .maybeSingle();

  if (orderMatch) {
    return { error: 'Order already exists for this RFID' };
  }

  // Create new order
  const karachiTime = DateTime.now().setZone('Asia/Karachi');
  const formattedDate = karachiTime.toFormat('yyyy-MM-dd HH:mm:ss');
  const { error: orderInsertError } = await supabase
    .from('orders')
    .insert({ car_rfid, name, description, status: "incomplete", created_at: formattedDate, brand, engine_type, engine_cc, body_type, image });

  if (orderInsertError) {
    return { error: 'Error inserting into orders', details: orderInsertError };
  }

  const oid = await supabase
    .from('orders')
    .select('order_id')
    .eq('car_rfid', car_rfid)
    .single();

  return { success: true, message: 'Order created successfully', oid };
}

const handleTransactionAddressForOrder = async (oid, transaction_address) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ transaction_address })
      .eq('order_id', oid);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, message: 'Server error', error: err.message };
  }
};


const getAllEvents = async () => {
  const { data, error } = await supabase
    .from('stage_events')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return { error: 'No logs Found' };
  }

  return data;
};

const getItems = async () => {
  const { data, error } = await supabase
    .from('item_location')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return { error: 'No items Found' };
  }

  return data;
};

const getOrderWithUID = async (uid) => {
  const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('car_rfid', uid)
  .single();

    if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return { error: 'No order Found' };
  }

  return data;
}

module.exports = {
  logToSupabase,
  updateItemLocation,
  logToOrderItems,
  handleTransactionAddressForItem,  
  getOrder,
  getDetailsForOrder,
  getItemsForOrder,
  getOrders,
  getItemInfo,
  getItemOrderInfo,
  orderCreation,
  handleTransactionAddressForOrder,
  signup,
  login,
  getAllEvents,
  getItems,
  getOrderWithUID
};
