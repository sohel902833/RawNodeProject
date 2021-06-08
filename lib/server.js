/*
    title: Server File,
    Description:server 
    Author:Md Sohrab Hossain,
    Date:11-04-2021
*/
//dependencies
const http =require('http')
const {handleReqRes}=require("../helpers/handleReqRes");
const environment=require('../helpers/environment')
//server object-module scaffolding
const server={}


server.createServer=()=>{
    const createServerVariable=http.createServer(server.handleReqRes);

    createServerVariable.listen(environment.port,()=>{
        console.log(`Listening to port ${environment.port}`)
    })

}

//handle request Response
server.handleReqRes=handleReqRes;

server.init=()=>{
    server.createServer();
}

module.exports=server




