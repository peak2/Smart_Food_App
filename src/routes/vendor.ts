import express from "express";
import {authVendor} from '../middleware/authorization'
import {createFood, deleteFood, getAllVendors, getFoodByVendor, updateVendorProfile, vendorLogin, vendorProfile} from '../controller/vendorController'
import { upload } from "../utils/multer";

const router = express.Router();

router.post('/login', vendorLogin)

router.post('/create-food', authVendor, upload.single('image'), createFood)

router.get('/get-profile', authVendor, vendorProfile)

router.get('/get-all-vendors', getAllVendors)

router.get('/get-vendor-food/:id', getFoodByVendor)


router.delete('/delete-food/:foodid', authVendor, deleteFood)

router.patch('/update-profile', authVendor, upload.single('coverImage'), updateVendorProfile);



export default router