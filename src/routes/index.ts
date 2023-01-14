import express, {Request, Response} from 'express';

const router = express.Router();

router.get('/', (req:Request, res:Response) => {
    res.status(200).send(`WELCOME TO MY FOOD APPLICATION LANDING PAGE`)
})



export default router