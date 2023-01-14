import {DataTypes, Model, } from 'sequelize'
import { db } from '../config';

export interface FoodAttributes {
    id: string;
    name: string
    description: string
    category: string
    foodType: string;
    readyTime: string;
    price: number;
    rating: number;
    image:string;
    vendorId: string
}

export class FoodInstance extends Model<FoodAttributes> {}

FoodInstance.init({
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    foodType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    readyTime: {
        type: DataTypes.STRING,
        allowNull: false,
       
    }, 
    price: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rating:{
        type: DataTypes.NUMBER,
        allowNull: true,
    },
    image:{
        type: DataTypes.UUIDV4,
        allowNull: true,
    },
    vendorId: {
        type: DataTypes.UUIDV4,
        allowNull: false
    }
},


{
    sequelize: db,
    tableName: 'food',
}

)



    