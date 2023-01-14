import Joi from 'joi'
import bcrypt from 'bcrypt'
import {AuthPayload} from '../interface'
import jwt, { JwtPayload } from 'jsonwebtoken';
import {APP_SECRET} from '../config'
import { idText } from 'typescript'

export const registerSchema = Joi.object().keys({
    email:Joi.string().required(),
    phone:Joi.string().required(),
    password:Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),       ////regex(/^[a-zA-Z0-9], {3,30}$/),
    confirm_password:Joi.any().equal(Joi.ref('password')).required().label('Confirm password').messages({'any.only': '{{#label}} does not match'})
})

export const adminSchema = Joi.object().keys({
    email:Joi.string().required(),
    phone:Joi.string().required(),
    password:Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),       ////regex(/^[a-zA-Z0-9], {3,30}$/),
    firstName:Joi.string().required(),
    lastName:Joi.string().required(),
    address:Joi.string().required(),
})

export const vendorSchema = Joi.object().keys({
    name:Joi.string().required(),
    restaurantName:Joi.string().required(),
    pincode:Joi.string().required(),
    address:Joi.string().required(),
    phone:Joi.string().required(),
    email:Joi.string().required(),
    password:Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),       ////regex(/^[a-zA-Z0-9], {3,30}$/),
})

export const updateSchema = Joi.object().keys({
    firstName:Joi.string(),
    lastName:Joi.string(),
    address:Joi.string(),
    phone:Joi.string(),
})


export const updateVendorSchema = Joi.object().keys({
    name:Joi.string(),
    phone:Joi.string(),
    address:Joi.string(),
    coverImage:Joi.string(),
})


export const option = {
    abortEarly: false,
    errors:{
        wrap:{
            label:""
        }
    }
}


export const GenerateSalt = async() => {
    return await bcrypt.genSalt() 
}


//verify user, given the user identity, authorizing the user to perform some task on the platform
//using the expiresIn to know when to time out user on a platform
export const GenerateSignature = async (payload:AuthPayload) => {
   return jwt.sign(payload, APP_SECRET, {expiresIn:'1d'})               //jwt.sign is a jwt method, used to generate signature here
}



export const verifySignature = async(signature:string) => {
    return jwt.verify(signature, APP_SECRET) as JwtPayload            //jwt.verify is a jwt method, used to verify signature 
                                                                     //i.e to check or to know if the user is the actual owner of d generated token
}



export const loginSchema = Joi.object().keys({
    email:Joi.string().required(),
    password:Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),       ////regex(/^[a-zA-Z0-9], {3,30}$/),
})


export const GeneratePassword = async(password:string, salt:string) => {
    return await bcrypt.hash(password, salt)
}


export const validatePassword = async(enteredPassword:string, savedPassword:string, salt:string) =>{
    return await GeneratePassword(enteredPassword, salt) === savedPassword
}


// export const validatePassword = async(enteredPassword:string, savedPassword:string, salt:string) => {
//     return await bcrypt.hash(enteredPassword, savedPassword, salt)
// }