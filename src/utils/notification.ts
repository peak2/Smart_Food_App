import { date } from "joi"
import {accountSid, authToken, fromAdminPhone, GMAIL_USER, GMAIL_PASS, FromAdminMail, userSubject} from '../config'
import nodemailer from 'nodemailer'

export const GenerateOTP = () =>{
    const otp = Math.floor(1000 + Math.random() * 9000)
    const expiry = new Date()
    expiry.setTime(new Date().getTime() + (30 * 60 * 1000))
    return {otp, expiry}
}


export const onRequestOTP = async(otp:number, toPhoneNumber:string) => {
    const client = require('twilio')(accountSid, authToken); 

const response = await client.messages 
      .create({     
        body: `Your OTP is ${otp}`,    
         to: toPhoneNumber,
         from: fromAdminPhone 
       }) 
       return response
}

const transport = nodemailer.createTransport({
    service:"gmail",         //service and host are the same...... gmail is compatible with services
    auth:{
        user: GMAIL_USER,
        pass: GMAIL_PASS
    },
    tls:{
        rejectUnauthorized: false
    }
})


// send mail with defined transport object
export const mailSent = async(
    from: string,                                                // sender address
    to: string,                                                 // list of receivers
    subject: string,                                            // Subject line           
    html: string,                                               // html body
  ) => {
    try {
        const response = await transport.sendMail(                  //this line sendMail is from transport, write it like this
        {
            from: FromAdminMail, subject: userSubject, to, html 
        })
        return response
    } catch (err) {
        console.log(err);
           
    }
  }


  export const emailHtml =(otp:number):string => {              //  export const emailHtml =(otp:number):string => {
    let response = `
    <div style="max-width:600px; margin:auto; border:10px solid #ddd; padding:30px 20px; font-size:110%;">
    <div style="max-width:500px; height: 50px; color: white; margin:auto; border:1px solid #0f0; background-color:#3944bc; padding:5px 25px; text-align:left; font-family: Tahoma">
    <img id="img" src="./myImage.jpeg" width="10px" height="10px">
    </div>
    <hr>
    <h2 style="text-align:center; text-transform: uppercase; color:teal"> Welcome To PEAK2 Food Store </h2>
    <p>Hi there, your otp is ${otp}</p>
    
    </div>
    `
    return response
  }

