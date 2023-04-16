const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/orderItems");
const router = express.Router();

router.get(`/`, async () => {
  const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered':-1});//-1 is to sort from newest to oldest

  if (!orderList) {
    res.status(500).json({ sucess: false });
  }
  res.send(orderList);
});

router.get(`/:id`, async () => {
  const orderList = await Order.findById(req.params.id).populate('user', 'name').populate({
    path:'orderItems',populate:{
    path:'product', populate:'category'} 
  });

  if (!orderList) {
    res.status(500).json({ sucess: false });
  }
  res.send(orderList);
});

router.post('/', async(req, res)=>{
  try {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async(orderItem) =>{
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product
      });

      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    }));
    const orderItemsResolved = await orderItemsIds;

    let totalPrices =await Promise.all(orderItemsResolved.map(async(orderItem)=>{
      const orderitem = await OrderItem.findById(orderItemId).populate('product', 'price')
      const totalPrice = orderItem.product.price * orderitem.quantity;
      return totalPrice

    }))

    const totalPrice = totalPrices.reduce((a,b)=> a+b, 0)

    let order = new Order({
      orderItems: orderItemsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user
    });
    order = await order.save();
    if(!order){
      res.status(404).send('Order cannot be created');
    }
    res.send(order);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while creating the order.');
  }
});

router.put(`/:id`, async(req, res)=>{
  const order = await Order.findByIdAndUpdate(
      req.params.id,{

      }, 
      {new:true}
  )

  if(!order){
      res.status(500).json({success:false, message:'ordernot found'})
  }
  res.send(order)
})

router.delete(`/:id`, async(req, res)=>{
  Order.findByIdAndRemove(req.params.id).then(async order=>{
 if(order){
    await order.orderItems.map(async orderItem =>{
      await orderItem.findByIdAndRemove(orderItem)
    })
     return res.status(200).json({success: true, message:'the order has been deleted successfully'})
    }else{
     return res.status(404).json({success: false, message:'order not found'})
 }
  }).catch(err =>{
     return res.status(400).json({success: false, error:err})
  })
 
 })

 router.get(`/get/totalsales`, async(req, res)=>{
  const totalSales = await Order.aggregate([
    {$group:{_id:null, totalsales: {$sum:'$totalPrice'}}}
  ])
  if(!totalSales){
    return req.send(400).send('The order sales cannot be generated')
  }

  res.send({totalsales: totales.pop().totalsales})

 })

 router.get(`/get/count`, async(req, res)=>{

  try {
    orderCount = await Order.countDocuments()
  
    if(!orderCount){
      res.status(500).json({success:false, message:'Order count unavailable'})
    }
    res.send({orderCount})
  } catch (error) {
   res.status(500).json({success:false, message:'error getting Order count'})
  }
 
 })
 
 router.get(`/get/usersorders/:userid`, async () => {
  const userOrderList = await Order.find({user:req.params.userid}).populate({ 
    path:'orderItems', populate:{
    path:'product', populate:'category'}
    }).sort({'dateOrdered':-1});

  if (!userOrderList) {
    res.status(500).json({ sucess: false });
  }
  res.send(userOrderList);
});

module.exports = router;
 