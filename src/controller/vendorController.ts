import { Request, Response} from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { FoodAttributes, FoodInstance } from '../model/foodModel';
import { VendorAttributes, VendorInstance } from '../model/vendorModel';
import { GenerateSignature, loginSchema, option, updateVendorSchema, validatePassword, vendorSchema } from '../utils';
import { v4 as uuidv4 } from 'uuid';


/** =============================== Vendor Login   =============================== **/

export const vendorLogin = async(req:Request, res:Response) => {
    try {
        const { email, password } = req.body
        const validateResult = loginSchema.validate(req.body, option)
        if(validateResult.error){
        return res.status(400).json({
            Error:validateResult.error.details[0].message
        })
       }

       //check if vendor exist.....Below gives us all d user information
       const Vendor = await VendorInstance.findOne({where: {email:email}}) as unknown as VendorAttributes
    
        if(Vendor){
            const validation = await validatePassword(password, Vendor.password, Vendor.salt)
           
            if(validation){
                //Generate signature for vendor
                let signature = await GenerateSignature({
                    id: Vendor.id,
                    email: Vendor.email,
                    serviceAvailable: Vendor.serviceAvailable
                })
                return res.status(200).json({
                    message:"You have successfully logged in",
                    signature,
                    email: Vendor.email,
                    serviceAvailable: Vendor.serviceAvailable,
                    role: Vendor.role
                })
            }
        }

        return res.status(400).json({
            Error:"Wrong Username or Password or not Verified "
        })
}
catch (err) {
res.status(500).json({
    Error: "Internal server error",
    route: "/vendors/login"
})
}
}



/** =============================== Vendor Add Food   =============================== **/

export const createFood = async(req:JwtPayload, res:Response) => {
try {
    const id = req.vendor.id
    
    const { name, description, category, foodType, readyTime, price, image } = req.body

     //check if vendor exist.....Below gives us all d user information
     const Vendor = await VendorInstance.findOne({where: {id:id}}) as unknown as VendorAttributes

    const foodid = uuidv4()
     if (Vendor) {
        const createfood = await FoodInstance.create({
            id: foodid,
            name, 
            description, 
            category, 
            foodType, 
            readyTime, 
            price, 
            rating: 0,
            image: req.file.path,
            vendorId: id
        })

        return res.status(201).json({
            message: "Food Added successfully",
            createfood,
      });
    }
  } catch (err) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/vendors/create-food",
    });
  }
};





/** =============================== Get Vendor Profile =============================== **/

export const vendorProfile = async(req:JwtPayload, res:Response) => {
try {
    const id = req.vendor.id
    //check if vendor exist.....Below gives us all d user information
    const Vendor = await VendorInstance.findOne({where: {id:id},
    //attributes: ["","","",""]
    include:[
        {
            model: FoodInstance,
            as: 'food',          //from foodModel..... TableName
            attributes: ["id", "name", "description", "category", "foodType", "readyTime", "price", "rating", "vendorId" ]   //Only these will be displayed
        }
    ]
    }) as unknown as VendorAttributes

    return res.status(200).json({
        Vendor
    })
    
} catch (err) {
    res.status(500).json({
        Error: "Internal server Error",
        route: "/vendors/get-profile",
    });
}
    
}


/** =============================== Get Food By VendorID =============================== **/

export const getFoodByVendor = async(req:Request, res:Response) => {
try {
    const id = req.params.id
    //check if vendor exist.....Below gives us all d user information
    const Vendor = await VendorInstance.findOne({where: {id:id},
    //attributes: ["","","",""]
    include:[
        {
            model: FoodInstance, 
            as: 'food',          
            attributes: [
                "id", 
            "name", 
            "description", 
            "category", 
            "foodType", 
            "readyTime", 
            "price", 
            "image", 
            "rating", 
            "vendorId" 
        ]   //Only these will be displayed
        }
    ]
    }) as unknown as VendorAttributes

    return res.status(200).json({
        Vendor
    })
    
} catch (err) {
    res.status(500).json({
        Error: "Internal server Error",
        route: "/vendors/get-profile",
    });
}
    
}





/** =============================== Get All Vendor Profile =============================== **/

export const getAllVendors = async(req:Request, res:Response) => {
    try {
        
        const Vendor = await VendorInstance.findAndCountAll({ })             //const users = await UserInstance.findAll({})    // (1)limit : (2)limit ......
        
        return res.status(200).json({
            message:"You have successfully retrieved all Vendors",
            Count:Vendor.count,                                          //This line cannot b used using findAll({})
            Vendor:Vendor.rows                                            //This line cannot b used using findAll({})
        })
    } catch (err) {
        return res.status(500).json({
            Error:"Internal server Error",
            route:"/vendors/get-all-vendors"
        })
    }
}



/** =============================== Vendor Delete Food =============================== **/

export const deleteFood = async(req:JwtPayload, res:Response)  =>{
    try {
        const id = req.vendor.id;
        const foodid = req.params.foodid
     
    //check if vendor exist
     const Vendor = await VendorInstance.findOne({where: {id:id}}) as unknown as VendorAttributes

     if(Vendor) {
        const deletedFood = await FoodInstance.destroy({where: {id:foodid}})

        return res.status(200).json({
            message:"You have successfully deleted the food",
            deletedFood
        })

     }

    } catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/vendors/delete-food",
        });
    }

}




/** =============================== Update Vendor Profile   =============================== **/

export const updateVendorProfile = async(req: JwtPayload, res:Response) => {
    try{
        const id = req.vendor.id;
        const { name, phone, address, coverImage} = req.body

    //Joi validation
    const validateResult = updateVendorSchema.validate(req.body, option)
    if(validateResult.error){
    return res.status(400).json({
        Error:validateResult.error.details[0].message
    })
   }

   //Check if the vendor is a registered user
   const Vendor = await VendorInstance.findOne({where: {id: id}}) as unknown as VendorAttributes
   if(!Vendor){
    return res.status(400).json({
        Error:"You are not authorized to update your profile"
    })
   }

    //Update Record
   const updatedVendor = await VendorInstance.update(
    {
        name,
        phone,
        address,
        coverImage:req.file.path
    
    }, {where: {id:id}}) as unknown as VendorAttributes
   
    if(updatedVendor){
        const Vendor = await VendorInstance.findOne({where: {id: id}}) as unknown as VendorAttributes
        return res.status(200).json({
            message:"You have successfully updated your profile",
            Vendor
        })
    }

    return res.status(400).json({
        Error:"Error occured"
    })

    } catch (err) {
        return res.status(500).json({
        Error:"Internal server Error",
        route:"/vendors/update-profile"
    })
    }
}