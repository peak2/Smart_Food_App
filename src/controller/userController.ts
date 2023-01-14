import {Request, Response} from 'express';
import { registerSchema, loginSchema, option, GeneratePassword, GenerateSalt, GenerateOTP, onRequestOTP, 
    emailHtml, mailSent, GenerateSignature, verifySignature, validatePassword, updateSchema} from '../utils';
import {UserAttributes, UserInstance} from '../model/userModel'
import {v4 as uuidv4} from 'uuid'
import { FromAdminMail, userSubject } from '../config';
import { JwtPayload } from 'jsonwebtoken';



/** =============================== User Register =============================== **/

export const Register = async(req:Request, res:Response) => { 
try {
    const { email, phone, password, confirm_password } = req.body
    const uuiduser = uuidv4()

   const validateResult = registerSchema.validate(req.body, option)
   if(validateResult.error){
    return res.status(400).json({
        Error:validateResult.error.details[0].message
    })
   }

   //Generate salt
   const salt = await GenerateSalt();
   const userPassword = await GeneratePassword(password, salt)
   
   //Generate OTP
   const {otp, expiry} = GenerateOTP();

   //check if user exist before creating the user record
   const User = await UserInstance.findOne({where: {email:email}})

   //Create User
   if(!User){
        let user = await UserInstance.create({
            id: uuiduser,
            email,
            password:userPassword,
            firstName:'',
            lastName:'',
            salt,
            address:'',
            phone,
            otp,
            otp_expiry:expiry,
            lng: 0,
            lat: 0,
            verified: false,
            role:'user'
        })
        //send OTP to user
        // await onRequestOTP(otp, phone)

        //Send Email
        const html = emailHtml(otp)

        await mailSent(FromAdminMail, email, userSubject, html)

        //Recheck again if the user already exist, bcoz b4 u generate identity/signature 4 user, 
        //u need to reconfirm if the user info has been saved on ur app
        const User = await UserInstance.findOne({where: {email:email}}) as unknown as UserAttributes

        //Generate a signature 
        let signature = await GenerateSignature({
            id: User.id,
            email:User.email,
            verified:User.verified
        })

        return res.status(201).json({
            message: "User created successfully, check your email or phone for verification", 
            signature,
            verified:User.verified,
        })
   }

   return res.status(400).json({
        Error: "User already exist"
})

} catch (err) {
    res.status(500).json({
        Error: "Internal server error",
        route: "/users/signup"
    })
}

}




/** =============================== Verify =============================== **/

export const verifyUser = async(req:Request, res:Response) => {
    try {
        const token = req.params.signature
        const decode = await verifySignature(token)
        
        //Check if the user is a registered user
        const User = await UserInstance.findOne({where: {email: decode.email}}) as unknown as UserAttributes

        if(User){
            const {otp} = req.body;
            if(User.otp === parseInt(otp) && User.otp_expiry >= new Date()){
                const updatedUser = await UserInstance.update({verified:true}, {where: {email:decode.email}}) as unknown as UserAttributes

                // GENERATE A NEW SIGNATURE
                let signature = await GenerateSignature({
                id: updatedUser.id,
                email:updatedUser.email,
                verified:updatedUser.verified
        })

        if(updatedUser){
            const User = (await UserInstance.findOne ({where: { email: decode.email }})) as unknown as UserAttributes
        

            return res.status(200).json({
                message:"You have successfully verified your account",
                signature,
                verified:User.verified
            })
            }
        }
    }

        return res.status(400).json({
            Error:"Invalid credential or OTP already expired"
        })
    } catch (error) {
        res.status(500).json({
            Error: "Internal server error",
            route: "/users/verify/:signature"
        })
    }
}



/** =============================== Login Users =============================== **/

export const Login = async(req:Request, res:Response) => { 
    try {
        const { email, password } = req.body
        const validateResult = loginSchema.validate(req.body, option)
        if(validateResult.error){
        return res.status(400).json({
            Error:validateResult.error.details[0].message
        })
       }

       //check if user exist.....Below gives us all d user information
       const User = await UserInstance.findOne({where: {email:email}}) as unknown as UserAttributes
    
        if(User.verified){
            const validation = await validatePassword(password, User.password, User.salt)
           
            if(validation){
                //Generate signature for user
                let signature = await GenerateSignature({
                    id: User.id,
                    email: User.email,
                    verified: User.verified
                })
                return res.status(200).json({
                    message:"You have successfully logged in",
                    signature,
                    email: User.email,
                    verified: User.verified
                })
            }
        }

        return res.status(400).json({
            Error:"Wrong Username or Password or not Verified "
        })
    
    } catch (err) {
        res.status(500).json({
            Error: "Internal server error",
            route: "/users/login"
        })
    }
    }



    /** =============================== Resend OTP =============================== **/

    export const resendOTP = async(req:Request, res:Response) => {
        try {
            const token = req.params.signature
            const decode = await verifySignature(token)   //confirm if id is dsame user requesting for the token  
            
            //check if the user is a registered user
            const User = await UserInstance.findOne({where: {email: decode.email}}) as unknown as UserAttributes
            
            //Generate OTP
            const {otp, expiry} = GenerateOTP();

            //Update the otp 
            const updatedUser = await UserInstance.update({otp, otp_expiry:expiry}, {where: {email:decode.email}}) as unknown as UserAttributes

            if(updatedUser){
            const User = await UserInstance.findOne({where: {email: decode.email}}) as unknown as UserAttributes
                //ReSend otp to user
                await onRequestOTP(otp, User.phone);

                // Send Mail to user
                const html = emailHtml(otp)
                await mailSent(FromAdminMail, updatedUser.email, userSubject, html)
                return res.status(200).json({
                    message:"OTP resend to registered phone number and email"
                })
            }
            return res.status(400).json({
                Error:"Error sending OTP"
            })

        } catch (error) {
            res.status(500).json({
                Error: "Internal server error",
                route: "/users/resend-otp/:signature"
            })
        }
    }


/** =============================== PROFILE ( GET ALL USERS ) =============================== **/

export const getAllUsers = async(req:Request, res:Response) => {
    try {
        const limit = req.query.limit as number | undefined              //const limit = req.query.sort
        const users = await UserInstance.findAndCountAll({              //const users = await UserInstance.findAll({})
            limit:limit                                                 // (1)limit : (2)limit ......
        })        
        return res.status(200).json({
            message:"You have successfully retrieved all users",
            Count:users.count,                                          //This line cannot b used using findAll({})
            Users:users.rows                                            //This line cannot b used using findAll({})
        })
    } catch (err) {
        return res.status(500).json({
            Error:"Internal server Error",
            route:"/users/get-all-users"
        })
    }
}



/** =============================== GET SINGLE USER =============================== **/

export const getSingleUser = async(req:JwtPayload, res:Response) => {
    try {
        const id = req.user.id
        
        //find the user by id
        const User = await UserInstance.findOne({where: {id:id} }) as unknown as UserAttributes

    if(User){
        return res.status(200).json({
            User
    })
    }

    return res.status(400).json({
        message: "User not found"
    })

    } catch (err) {
        return res.status(500).json({
            Error:"Internal server Error",
            route:"/users/get-user"
    })
    }
}



/** =============================== UPDATE USER PROFILE ( GET ALL USERS ) =============================== **/

export const updateUserProfile = async(req: JwtPayload, res:Response) => {
    try{
        const id = req.user.id;
        const { firstName, lastName, address, phone} = req.body

    //Joi validation
    const validateResult = updateSchema.validate(req.body, option)
    if(validateResult.error){
    return res.status(400).json({
        Error:validateResult.error.details[0].message
    })
   }

   //Check if the user is a registered user
   const User = await UserInstance.findOne({where: {id: id}}) as unknown as UserAttributes
   if(!User){
    return res.status(400).json({
        Error:"You are not authorized to update your profile"
    })
   }

    //Update Record
   const updatedUser = await UserInstance.update(
    {
        firstName,
        lastName,
        address,
        phone
    
    }, {where: {id:id}}) as unknown as UserAttributes
   
    if(updatedUser){
        const User = await UserInstance.findOne({where: {id: id}}) as unknown as UserAttributes
        return res.status(200).json({
            Error:"You have successfully updated your profile",
            User
        })
    }

    return res.status(400).json({
        Error:"Error occured"
    })

    } catch (err) {
        return res.status(500).json({
        Error:"Internal server Error",
        route:"/users/update-profile"
    })
    }
}