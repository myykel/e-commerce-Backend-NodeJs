const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
OrderItems:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'OrderItem',
    required:true
}],
shippingAddress1:{
    type:String,
    required:true
},
shippingAddress2:{
    type:String,
},
City:{
    type:String,
    required:true,
},

Zip:{
    type:String,
    required:true,
},
Country:{
    type:String,
    required:true,
},
Phone:{
    type:String,
    required:true
},
Status:{
    type:String,
    required:true,
    default:'Pending'
},
totalPrice:{
    type:Number,
},
user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
},
dateOrdered:{
    type:Date,
    default: Date.now,
}

});
orderSchema.virtual('id').get(function(){
    return this._id.toHexString()
  });

  orderSchema.set('toJSON',{
    virtuals:true
  })

exports.Order = mongoose.model('Order',orderSchema)