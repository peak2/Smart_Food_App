import express, {Request, Response} from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import indexRouter from './routes/index';
import userRouter from './routes/users';
import adminRouter from './routes/Admin';
import vendorRouter from './routes/vendor';
import {db} from './config';      // Or import {db} from './config/index'; 
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config();

//Sequelize connection
db.sync().then(() => {
    console.log('Db Connected Successfully');
}).catch(err => {
    console.log(err);
})

// const dbconnect = async() => {
//    let data = await db.sync()
//     if(data){
//         console.log('Db Connected Successfully');
//     }
// }
// dbconnect()



const app = express();

app.use(express.json());
app.use(logger('dev'));
app.use(cookieParser());
app.use(cors());


app.use('/', indexRouter)
app.use('/users', userRouter)
app.use('/admins', adminRouter)
app.use('/vendors', vendorRouter)


// app.get('/about', (req:Request, res:Response) =>{
//     res.status(200).json({
//         message: "Success"
//     })
// })

const port = 4123;

app.listen(port, () => {
    console.log(`Server Running on http://locahost:${port}`);
})




export default app