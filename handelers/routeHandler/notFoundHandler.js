//module - scaffolding
const handler={}
handler.notFoundHandler=(requestProperties,callback)=>{
    console.log(requestProperties)
    callback(404,{
        message:"Your Requested Url was not found!",
    });
}


module.exports=handler