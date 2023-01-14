import {DataTypes, Model, } from 'sequelize'
import { db } from '../config';
import { FoodInstance } from './foodModel';

export interface VendorAttributes {
    id: string;
    name: string
    restaurantName: string
    pincode: string
    address: string;
    phone: string;
    email: string;
    password: string;
    salt: string;
    serviceAvailable: boolean;
    rating: number
    role: string;
    coverImage: string;

}


export class VendorInstance extends Model<VendorAttributes> {}

VendorInstance.init({
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
             notNull:{
                msg: 'an email address is required'
            },
            isEmail:{
                msg: 'provide a valid email address'
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'a password is required'
            },
            notEmpty: {
                msg: 'please enter password'
            }
        }
    },
    restaurantName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    
    salt: {
        type: DataTypes.STRING,
        allowNull: true,
       
    }, 
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'phone number is required'
            },
            notEmpty: {
                msg: 'please enter phone number'
            }
        }
    },
   pincode: {
        type: DataTypes.NUMBER,
        allowNull: true,
    },
    serviceAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    rating:{
        type: DataTypes.NUMBER,
        allowNull: true,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    coverImage: {
        type: DataTypes.STRING,
        allowNull: true
    }
},


{
    sequelize: db,
    tableName: 'vendor',
}

)


VendorInstance.hasMany(FoodInstance, {foreignKey: 'vendorId', as:'food' })

FoodInstance.belongsTo(VendorInstance, {foreignKey: 'vendorId', as:'vendor' })