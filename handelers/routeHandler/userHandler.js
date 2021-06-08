//dependencies
const data=require("../../lib/data")
const {hash}=require('../../helpers/utilities')
const {parseJSON}=require('../../helpers/utilities')
const tokenHandler=require('./tokenHandler')
//module - scaffolding
const handler={}

handler.userHandler=(requestProperties,callback)=>{

    console.log(requestProperties.method)
    const acceptedMethods=['get','post','put','delete'];
    if(acceptedMethods.indexOf(requestProperties.method)>-1){
        handler._users[requestProperties.method](requestProperties,callback)
    }else{
        callback(405,{
            message:"Error,You Are Not Allowed",
        });
    }

 
}

handler._users={};
handler._users.post=(requestProperties,callback)=>{
   
   const firstName=typeof(requestProperties.body.firstName)==='string'&&requestProperties.body.firstName.trim().length>0?requestProperties.body.firstName:false;
    
    const lastName=typeof(requestProperties.body.lastName)==='string'&&requestProperties.body.lastName.trim().length>0?requestProperties.body.lastName:false;

    const phone=typeof(requestProperties.body.phone)==='string'&&requestProperties.body.phone.trim().length==11?requestProperties.body.phone:false;

    const password=typeof(requestProperties.body.password)==='string'&&requestProperties.body.password.trim().length>0?requestProperties.body.password:false;

    const tosAgreement=typeof(requestProperties.body.tosAgreement)==='string'&&requestProperties.body.tosAgreement.trim().length>0?requestProperties.body.tosAgreement:false;


    if(firstName && lastName && phone && password && tosAgreement){
        //make sure the user doesn't already exists

        data.read('users',phone,(err,user)=>{
            if(err){
                //next work
                let userObject={
                    firstName,
                    lastName,
                    phone,
                    password:hash(password),
                    tosAgreement
                }

            
                //store the user to db
                data.create("users",phone,userObject,(err,data)=>{
                    if(!err){
                        callback(200,{
                            message:"user Was Created Successful"
                        })
                    }else{
                        callback(500,{'error':`Could not create user!${err}`})
                    }
                })




            }else{
                callback(500,{
                    'error':"There was a problem in server side!"
                });
            }
        })
    }else{
        callback(400,{
            error:'you have a problem in you request'
        })
    }



}
handler._users.get=(requestProperties,callback)=>{
   //check the phone number if valid
   const phone=typeof(requestProperties.queryStringObject.phone)==='string'&&requestProperties.queryStringObject.phone.trim().length==11?requestProperties.queryStringObject.phone:false;


   if(phone){
        //verify token
        let token=typeof(requestProperties.headersObject.token)==='string'?requestProperties.headersObject.token:false

        tokenHandler._token.verify(token,phone,(token)=>{
            if(token){
                data.read('users',phone,(err,u)=>{
                    const user={...parseJSON(u)};
                    /*
                        {name:"sohel",age:25,gender:"male",}
                    */
                    if(!err && user){
                        delete user.password;
                        callback(200,user)
                    }else{
                        callback(404,{
                            'error':'requested user was not found!'
                        });
                    }
                });
            }else{
                callback(403,{
                    error:'Authentication failed'
                })
            }
        })
   }else{
       callback(404,{
           'error':'requested user was not found!'
       });
   }
}
//@Todo authentication

handler._users.put=(requestProperties,callback)=>{

     const firstName=typeof(requestProperties.body.firstName)==='string'&&requestProperties.body.firstName.trim().length>0?requestProperties.body.firstName:false;
    
    const lastName=typeof(requestProperties.body.lastName)==='string'&&requestProperties.body.lastName.trim().length>0?requestProperties.body.lastName:false;

    const phone=typeof(requestProperties.body.phone)==='string'&&requestProperties.body.phone.trim().length==11?requestProperties.body.phone:false;

    const password=typeof(requestProperties.body.password)==='string'&&requestProperties.body.password.trim().length>0?requestProperties.body.password:false;


    if(phone){
        if(firstName || lastName || password){

            let token=typeof(requestProperties.headersObject.token)==='string'?requestProperties.headersObject.token:false

            tokenHandler._token.verify(token,phone,(token)=>{
                if(token){
                   
              //lookup the user
              
              data.read('users',phone,(err,uData)=>{

                const userData={...parseJSON(uData)}  
                    if(!err && userData){
                        if(firstName){
                            userData.firstName=firstName
                        }
                        if(lastName){
                            userData.lastName=lastName
                        }
                        if(password){
                            userData.password=hash(password)
                        }

                        data.update('users',phone,userData,(err)=>{
                            if(!err){
                                callback(200,{
                                    error:"User Was Updated Successful"
                                })   
                            }else{
                                callback(500,{
                                    error:`There was a problem in server site ${err}`
                                }) 
                            }
                        })


                    }else{
                        callback(400,{
                            error:"You have a problem into your request"
                        })  
                    }
              })
                }else{
                    callback(403,{
                        error:'Authentication failed'
                    })
                }
            })
        }else{
            callback(400,{
                error:"You have a problem into your request"
            })   
        }
    }else{
        callback(400,{
            error:"Invalid Phone Number,Please try again"
        })
    }




}
//@Todo authentication
handler._users.delete=(requestProperties,callback)=>{
    const phone=typeof(requestProperties.queryStringObject.phone)==='string'&&requestProperties.queryStringObject.phone.trim().length==11?requestProperties.queryStringObject.phone:false;

    if(phone){

            //verify token
            let token=typeof(requestProperties.headersObject.token)==='string'?requestProperties.headersObject.token:false

            tokenHandler._token.verify(token,phone,(token)=>{
                if(token){
                    data.read('users',phone,(err,userData)=>{
                        if(!err && userData){
                            data.delete('users',phone,(err)=>{
                                if(!err){
                                    callback(200,{
                                        "message":"User was successfully deleted",
                                    })
                                }else{
                                    callback(500,{
                                        "error":"There was a Server side error"
                                    }) 
                                }
                            })
                        }else{
                            callback(500,{
                                "error":"There was a Server side error"
                            }) 
                        }
                    })
                }else{
                    callback(403,{
                        error:'Authentication failed'
                    })
                }
            })
    }else{
        callback(400,{
            "error":"There was a problem in you request"
        })
    }

}




module.exports=handler