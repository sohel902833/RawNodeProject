/*
Title: Notifications Library
Description:Important functions to notify users
Author:Md Sohrab Hossain
Date:12-04-2021


*/


const https=require('https')
const queryString=require('querystring')
const {twilio}=require('./environment')
const axios =require('axios')
//module scaffolding

const notifications={};


//send sms to user using twilio api

notifications.sendTwilioSms=(phone,msg,callback)=>{
    //input validation
    const userPhone=typeof(phone)==='string' && phone.trim().length===11?phone.trim():false;
    const userMsg=typeof(msg)==='string' && msg.trim().length>0 && msg.trim().length<=1600
    ?msg.trim():false;

    if(userPhone && userMsg){
        //configure the request payload
        const payload={
            Body: userMsg,
            From: twilio.fromPhone,
            To: `+88${userPhone}`
        };

        console.log(payload)
        //stringify the payload

        const stringifyPayload=queryString.stringify(payload);
        //configure the request details
        const requestDetails={
            hostname:'api.twilio.com',
            method:'POST',
            path:`/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth:`${twilio.accountSid}:${twilio.authToken}`,
            headers:{
                'Content-Type':'application/x-www-form-urlencoded'
            }
        }

        //instantiate the request object
        const req=https.request(requestDetails,(res)=>{
            //get the status of the sent request
            const status =res.statusCode;
            //callback successfully if the request went through
            if(status===200 || status===201){
                callback(false)
            }else{
                callback(`Status code returned was ${status}`);
            }
        })
        req.on('error',(e)=>{
            callback(e);
        })
        req.write(stringifyPayload);
        req.end();


    }else{
        callback('Given Parameters were missing or invalid');
    }

}

notifications.sendGreenWebSms=(phone,msg,callback)=>{
    const sms = new URLSearchParams();
    sms.append('token', '3c548ac0beefc35f68da7d67fa584878');
    sms.append('to', `+88${phone}`);
    sms.append('message',`${msg}`);
    axios.post('http://api.greenweb.com.bd/api.php',sms).then(response => {
        callback(response)
    });
}

//export the module 
module.exports=notifications;
