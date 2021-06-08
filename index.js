/*
    title: Uptime Monitoring Application,
    Description:A RESTFul Api to monitor up or down time of user defined links
    Author:Md Sohrab Hossain,
    Date:11-04-2021
*/
//dependencies
const server=require('./lib/server')
const workers=require('./lib/workers')
//app object-module scaffolding
const app={}


app.init=()=>{
    //start the server
    server.init();

  //start the workers
    workers.init();
  
}



app.init();





module.exports=app

