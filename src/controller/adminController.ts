import { Request, Response } from 'express';
import { adminSchema, GenerateOTP, GeneratePassword, GenerateSalt, GenerateSignature, option, vendorSchema } from '../utils';
import { UserAttributes, UserInstance } from '../model/userModel'
import { VendorAttributes, VendorInstance } from '../model/vendorModel'
import { v4 as uuidv4 } from 'uuid'
import jwt, { JwtPayload } from 'jsonwebtoken';


/** =============================== Admin Register   =============================== **/

export const AdminRegister = async (req: JwtPayload, res: Response) => {
    try {
        const id = req.user.id
        const { email, phone, password, firstName, lastName, address } = req.body
        const uuiduser = uuidv4()

        const validateResult = adminSchema.validate(req.body, option)

        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message
            })
        }

        //Generate salt
        const salt = await GenerateSalt();
        const adminPassword = await GeneratePassword(password, salt)

        //Generate OTP
        const { otp, expiry } = GenerateOTP();

        //check if admin exist before creating the user record
        const Admin = await UserInstance.findOne({ where: { id: id } }) as unknown as UserAttributes

        if (Admin.email === email) {
            return res.status(400).json({
                message: "Email already exist"
            })
        }

        if (Admin.phone === phone) {
            return res.status(400).json({
                message: "Phone number already exist"
            })
        }

        //Create Admin
        if (Admin.role === "superadmin") {
            let user = await UserInstance.create({
                id: uuiduser,
                email,
                password: adminPassword,
                firstName,
                lastName,
                salt,
                address,
                phone,
                otp,
                otp_expiry: expiry,
                lng: 0,
                lat: 0,
                verified: true,
                role: 'admin'
            })

            //Recheck again if the user already exist, bcoz b4 u generate identity/signature 4 user, 
            //u need to reconfirm if the user info has been saved on ur app
            const Admin = await UserInstance.findOne({ where: { id: id } }) as unknown as UserAttributes

            //Generate a signature 
            let signature = await GenerateSignature({
                id: Admin.id,
                email: Admin.email,
                verified: Admin.verified
            })

            return res.status(201).json({
                message: "Admin created successfully",
                signature,
                verified: Admin.verified,
            })
        }

        return res.status(400).json({
            message: "Admin already exist"
        })

    } catch (err) {
        res.status(500).json({
            Error: "Internal server error",
            route: "/admins/create-admin"
        })
    }

}


/** =============================== Super Admin    =============================== **/

export const SuperAdmin = async (req: JwtPayload, res: Response) => {
    try {

        const { email, phone, password, firstName, lastName, address } = req.body
        const uuiduser = uuidv4()

        const validateResult = adminSchema.validate(req.body, option)

        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message
            })
        }

        //Generate salt
        const salt = await GenerateSalt();
        const adminPassword = await GeneratePassword(password, salt)

        //Generate OTP
        const { otp, expiry } = GenerateOTP();

        //check if admin exist before creating the user record
        const Admin = await UserInstance.findOne({ where: { email: email } }) as unknown as UserAttributes


        //Create Admin
        if (!Admin) {
            let user = await UserInstance.create({
                id: uuiduser,
                email,
                password: adminPassword,
                firstName,
                lastName,
                salt,
                address,
                phone,
                otp,
                otp_expiry: expiry,
                lng: 0,
                lat: 0,
                verified: true,
                role: 'superadmin'
            })

            //Recheck again if the user already exist, bcoz b4 u generate identity/signature 4 user, 
            //u need to reconfirm if the user info has been saved on ur app
            const Admin = await UserInstance.findOne({ where: { email: email } }) as unknown as UserAttributes

            //Generate a signature 
            let signature = await GenerateSignature({
                id: Admin.id,
                email: Admin.email,
                verified: Admin.verified
            })

            return res.status(201).json({
                message: "Super Admin created successfully",
                signature,
                verified: Admin.verified,
            })
        }

        return res.status(400).json({
            message: "Super Admin already exist"
        })

    } catch (err) {
        res.status(500).json({
            Error: "Internal server error",
            route: "/admins/create-super-admin"
        })
    }

}



/** =============================== Create Vendor    =============================== **/

export const createVendor = async (req: JwtPayload, res: Response) => {
    try {
        const id = req.user.id
        const { name, restaurantName, pincode, address, phone, email, password } = req.body
        const uuidvendor = uuidv4()

        const validateResult = vendorSchema.validate(req.body, option)

        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message
            })
        }

        //Generate salt
        const salt = await GenerateSalt();
        const vendorPassword = await GeneratePassword(password, salt)

        //check if vendor exist before creating the user record
        const Vendor = await VendorInstance.findOne({ where: { email: email } }) as unknown as VendorAttributes

        //check if admin exist before creating the user record
        const Admin = await UserInstance.findOne({ where: { id: id } }) as unknown as UserAttributes

        if (Admin.role === "admin" || Admin.role === "superadmin") {
            //Create Admin
            if (!Vendor) {
                let vendor = await VendorInstance.create({
                    id: uuidvendor,
                    name,
                    restaurantName,
                    pincode,
                    address,
                    phone,
                    email,
                    password: vendorPassword,
                    salt,
                    serviceAvailable: false,
                    rating: 0,
                    role: "vendor",
                    coverImage:''
                })

                return res.status(201).json({
                    message: "Vendor created successfully",
                    vendor
                })
            }
            return res.status(400).json({
                message: "Vendor already exist"
            })
        }

        return res.status(400).json({
            message: "Unauthorized"
        })

    } catch (err) {
        return res.status(500).json({
            Error: "Internal Server error",
            route: "/admins/create-vendors"
        })
    }

}