const express=require('express');
const User= require('../models/User')
const { Mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser=require('../middleware/fetchuser');
const router=express.Router();

const { body, validationResult, sanitizeBody } = require('express-validator');

const JWT_SECRET="Vikasisagoodboy";
//Rout 1:Create a user using: POST "/api/auth". Does'nt require auth
router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be atleast 6 characters').isLength({ min: 5 }),
], async (req, res) => {
  let success=false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success,errors: errors.array() });
  }
  try {
    // Check whether the user with this email exists already
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({success,error: "Sorry a user with this email already exists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,
    });
    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);

   
    // res.json(user)
    success=true;
    res.json({success, authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})
      // .then(user => res.json(user))
    //   .catch(err=>{console.log(err)
    // res.json({error:'Please enter a unique value for email'})})


//Rout 2: Authenticate a user using: POST "api/auth/login". No login required
router.post('/login',[ 
body('email',"Enter valid mail:").isEmail(),
body('password',"Password cannot be blank").exists()],async(req,res)=>{
  let success = false;
    //If ther is error, returns Bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {email,password}=req.body;
    try{
      let user=await User.findOne({email});
      if(!user){
        return res.status(400).json({error:"Please try to login with carrecyt credential"});
      }
      const passwordCompare=await bcrypt.compare(password,user.password);
      if(!passwordCompare){
        return res.status(400).json({success,error:"Please try to login with carrecyt credential"});
      }

      const data={
        user:{
          id:user.id
        }
      };

      //jsonwebtocken for sign user
     const authtoken = jwt.sign(data,JWT_SECRET);
     success=true;
  
      res.json({success,authtoken});
    }catch(error){
      console.error(error.message);
      res.staus(500).send("Internal server error occured");
    }

  });
  //ROUTE 3: Get loggedin user Details using :POST "api/auth/getuser", login required
  router.post('/getuser',fetchuser,async(req,res)=>{
    //Middlewere
  try{
    const userId=req.user.id;
    const user= await User.findOne({userId}).select("-password");
    res.send(user)
  }catch(error){
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});
module.exports=router