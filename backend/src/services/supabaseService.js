const { createClient } = require('@supabase/supabase-js');
const { DateTime } = require('luxon');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const logToSupabase = async (uid, stage, status, transaction_address) => {
  const karachiTime = DateTime.now().setZone('Asia/Karachi');
  const formattedDate = karachiTime.toFormat('yyyy-MM-dd HH:mm:ss');

  const { data, error } = await supabase.from('stage_events').insert([
    // { uid, stage, status, timestamp: new Date().toISOString() }
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
    console.log(orderData);
    if(orderData){
      return { message: "It is RFID of an order"};
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

const signup = async (username, email, password) => {
  try {
    // Check if email or username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingUser) {
      // Determine which field is taken
      const { data: checkEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      const { data: checkUsername } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      let conflictMsg = 'User already exists with ';
      if (checkEmail) conflictMsg += 'this email';
      if (checkEmail && checkUsername) conflictMsg += ' and ';
      if (checkUsername) conflictMsg += 'this username';

      return { message: conflictMsg };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error: insertError } = await supabase.
      from('users').insert([{ username, email, password: hashedPassword }])
      .select()
      .single();

    if (insertError) throw insertError;

    const token = jwt.sign({ id: data.id, email: data.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { message: 'User registered', token };
  } catch (err) {
    return { message: 'Signup failed.', error: err.message };
  }
}

const login = async (email, password) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return { message: 'Invalid credentials' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return ({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return { message: 'Login successful', token };
  } catch (err) {
    return { message: 'Server error', error: err.message };
  }
}

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


  return data.order_id ;
};

const getOrders = async() =>{
  const { data, error } = await supabase
  .from('orders')
  .select("*")

  if (error){
    throw new Error('Error fetching orders')
  }

  if (!data){
    throw new Error('No Orders Found')
  }
  
  return data;
}
module.exports = { logToSupabase, updateItemLocation, logToOrderItems, signup, login, getOrder, getItemsForOrder, getOrders };
