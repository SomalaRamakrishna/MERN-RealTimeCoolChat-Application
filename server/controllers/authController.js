const bcrypt=require('bcryptjs')
const router=require('express').Router();
const User=require('../models/user')
const jwt=require('jsonwebtoken')


router.post('/signup', async (req, res) => {
   const { firstname,lastname,email, password} = req.body;
    try {
        const userEmail = await User.findOne({ email });
        if (userEmail) {
            return res.status(400).send({message:"Email already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword
        });
        const data=await newUser.save();

        res.status(201).json({ message: "User registered successfully",data });
        console.log('registered,',data);
        

    } catch (error) {
        console.error(error,error.message);
        res.status(500).json({ error:"Internal server error",message:error.message })
    }

}
)


router.post('/login', async (req, res) => {
    try{
        console.log("back entered")
        if (!req.body.email || !req.body.password) {
            return res.send({
                message: 'Missing email or password in request body',
                success: false
            });
            }
        //1. Check if user exists
        const user = await User.findOne({email: req.body.email});
        console.log("useru",user)
        if(!user){
            return res.status(400).send({
                message: 'User does not exist',
                success: false
            })
        }
        console.log('req.body.password:', req.body.password);
        console.log('user.password:', user.password);
        //2. check if the password is correct
        const isvalid = await bcrypt.compare(req.body.password, user.password);
        if(!isvalid){
            return res.status(400).send({
                message: 'invalid password',
                success: false
            })
        }

        //3. If the user exists & password is correct, assign a JWT
        const token = jwt.sign({userId: user._id}, process.env.SECRET_KEY, {expiresIn: "1d"});
        
        
        res.status(200).send({
            message: 'user logged-in successfully',
            success: true,
            token,
        });

    }catch(error){
        res.status(500).send({
            message: error.message,
            data:error.stack,
            success: false
        })
    }
});


module.exports=router
