const {User} = require('../models/user')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.get('/', async(req, res)=>{
    const userList = await User.find().select('-passwordHash');

    if(!userList){
        res.status(500).json({success:false})
    }
    res.send(userList)
})

router.post(`/`, async(req, res)=>{
try {
    let user = new User({
        name:req.body.name,
        email:req.body.email,
        color:req.body.color,
        passwordHash:bcrypt.hashSync(req.body.password, 10),
        phone:req.body.phone,
        isAdmin:req.body.isAdmin,
        street:req.body.street,
        apartment:req.body.apartment,
        zip:req.body.zip,
        city:req.body.city,
        country:req.body.country
    })
    
    if(!user){
        res.status(500).json({success:false, message:'unable to create user'})
    }
    user = await user.save()
    
    res.send(user)
    
} catch (error) {
    res.status(500).send(error)
}
})

router.get(`/:id`,async(req, res)=>{
try {
    let user;
    const {id}= req.params
    user= await User.findById(id).select('-passwordHash')
    
    if(!user){
         res.status(500).json({success:false, message:'User with Id not found'})
         return 
    }
     res.status(200).send(user)
    
} catch (error) {
    res.status(400).json({success:false,error})
}
})

router.post(`/login`, async(req, res)=>{
const user = await User.findOne({email:req.body.email})
const secret = process.env.secret
if(!user){
    return res.status(400).send('the user not found')
}

if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
    const token =jwt.sign(
        {
        userId:user.id,
        isAdmin:user.isAdmin
        },
        secret,
        {expiresIn : '1d'}
    )

    res.status(200).send({user:user.email, token:token})
}else{
    res.status(400).send('password is wrong')
}

})

router.post(`/register`, async(req, res)=>{
    try {
        let user = new User({
            name:req.body.name,
            email:req.body.email,
            color:req.body.color,
            passwordHash:bcrypt.hashSync(req.body.password, 10),
            phone:req.body.phone,
            isAdmin:req.body.isAdmin,
            street:req.body.street,
            apartment:req.body.apartment,
            zip:req.body.zip,
            city:req.body.city,
            country:req.body.country
        })

        user = await user.save()

        if(!user){
            res.status(500).json({success:false, message:'unable to register user'})
        }
       
        res.send(user)
        
    } catch (error) {
        res.status(500).send(error)
    }
    })

    router.get(`/get/count`, async (req, res) => {
        try {
          const countUsers = await User.countDocuments((count)=>count);
          if (!countUsers) {
            res.status(500).json({ success: false });
          } 
           res.send({ 
            countUsers : countUsers 
        });   
         
        } catch (error) {
          res.status(500).json({ success: false, message: error});
          console.log(error)
        }
      });

      router.delete(`/:id`, (req, res)=>{
        User.findByIdAndRemove(req.params.id).then(user =>{
            if(user){
                return res.status(200).json({sucess:true, message:"The user was deleted successfully"})
            }else{
                return res.status(404).json({sucess:false, error:err})
            }
        }).catch(err=>{
            return res.status(500).json({succes:false, error:err})
        })
      })
      

module.exports = router