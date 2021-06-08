//dependencies
const data=require("../../lib/data")
const {hash, createRandomString}=require('../../helpers/utilities')
const {parseJSON}=require('../../helpers/utilities')
const tokenHandler=require('./tokenHandler')
const {maxChecks}=require('../../helpers/environment');

//module - scaffolding
const handler={}

handler.checkHandler=(requestProperties,callback)=>{

    console.log(requestProperties.method)
    const acceptedMethods=['get','post','put','delete'];
    if(acceptedMethods.indexOf(requestProperties.method)>-1){
        handler._check[requestProperties.method](requestProperties,callback)
    }else{
        callback(405,{
            message:"Error,You Are Not Allowed",
        });
    }

 
}

handler._check={};
handler._check.post=(requestProperties,callback)=>{
    //validate inputs
    const protocol=typeof(requestProperties.body.protocol)==='string'&&['http','https'].indexOf(requestProperties.body.protocol)>-1?requestProperties.body.protocol:false;


    const url=typeof(requestProperties.body.url)==='string'&&
    requestProperties.body.url.trim().length>0?requestProperties.body.url:false;


    const method=typeof(requestProperties.body.method)==='string'&&
    ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method)>-1?requestProperties.body.method:false;

    
    const successCodes=typeof(requestProperties.body.successCodes)==='object'&& requestProperties.body.successCodes instanceof Array?requestProperties.body.successCodes:false;


    const timeOutSeconds=typeof(requestProperties.body.timeOutSeconds)==='number'&& requestProperties.body.timeOutSeconds%1===0&& requestProperties.body.timeOutSeconds>1
    && requestProperties.body.timeOutSeconds<=5?requestProperties.body.timeOutSeconds:false;


    if(protocol && url && method && successCodes && timeOutSeconds){
        let token=typeof(requestProperties.headersObject.token)==='string'?requestProperties.headersObject.token:false

        //lookup the user phone by reading the token

        data.read('tokens',token,(err1,tokenData)=>{
            if(!err1 && tokenData){
                let userPhone=parseJSON(tokenData).phone
                //lookup the user data
                data.read('users',userPhone,(err2,userData)=>{
                    if(!err2 && userData){

                        tokenHandler._token.verify(token,userPhone,(tokenIsValid)=>{
                            if(tokenIsValid){
                               let userObject=parseJSON(userData)
                                let userChecks=typeof(userObject.checks)==='object' && userObject.checks instanceof Array ?userObject.checks:[];
                               
                               
                                if(userChecks.length<maxChecks){
                                    let checkId=createRandomString(20);

                                    let checkObject={
                                        'id':checkId,
                                        'userPhone':userPhone,
                                        'protocol':protocol,
                                        'url':url,
                                        'method':method,
                                        'successCodes':successCodes,
                                        'timeoutSeconds':timeOutSeconds
                                    }

                                        //save the object

                                        data.create('checks',checkId,checkObject,(err3)=>{
                                            if(!err3){
                                                //add check id to the users object
                                                userObject.checks=userChecks
                                                userObject.checks.push(checkId);
                                                //save the new user data
                                                data.update('users',userPhone,userObject,(err4)=>{
                                                    if(!err4){
                                                            //return the data aboute the new check
                                                            callback(200,checkObject)
                                                    }else{
                                                        callback(500,{
                                                            error:`There was a problem in the server site${err4}`
                                                        }) 
                                                    }
                                                })






                                            }else{
                                                callback(500,{
                                                    error:'There was a problem in the server site'+err3
                                                }) 
                                            }
                                        })



                                }else{
                                    callback(403,{
                                        error:'User has already reached max check limit'
                                    }) 
                                }
                            }else{
                                callback(403,{
                                    error:'Authentication failed'
                                })
                            }
                        })
                    }else{
                        callback(404,{
                            'error':'Authentication Problem'
                        }); 
                    }
                })


            }else{
                callback(404,{
                    'error':'Authentication Problem'
                });  
            }
        })
    }else{
        callback(400,{
            error:'you have a problem in you request'
        })
    }



    
}
handler._check.get=(requestProperties,callback)=>{
    
    const id=typeof(requestProperties.queryStringObject.id)==='string'&&requestProperties.queryStringObject.id.trim().length==20?requestProperties.queryStringObject.id:false;


    if(id){
        data.read('checks',id,(err,checkData)=>{
            if(!err && checkData){
                let token=typeof(requestProperties.headersObject.token)==='string'?requestProperties.headersObject.token:false

                tokenHandler._token.verify(token,parseJSON(checkData).userPhone,(token)=>{
                    if(token){
                        callback(200,parseJSON(checkData))
                    }else{
                        callback(403,{
                            error:'Authentication failed'
                        })
                    }
                })


            }else{
                callback(400,{
                    error:'There was a server site problem'
                })    
            }
        })
    }else{
        callback(400,{
            error:'you have a problem in you request'
        })  
    }



}
//@Todo authentication

handler._check.put=(requestProperties,callback)=>{
    const id=typeof(requestProperties.body.id)==='string'&&requestProperties.body.id.trim().length==20?requestProperties.body.id:false;


    const protocol=typeof(requestProperties.body.protocol)==='string'&&['http','https'].indexOf(requestProperties.body.protocol)>-1?requestProperties.body.protocol:false;


    const url=typeof(requestProperties.body.url)==='string'&&
    requestProperties.body.url.trim().length>0?requestProperties.body.url:false;


    const method=typeof(requestProperties.body.method)==='string'&&
    ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method)>-1?requestProperties.body.method:false;

    
    const successCodes=typeof(requestProperties.body.successCodes)==='object'&& requestProperties.body.successCodes instanceof Array?requestProperties.body.successCodes:false;


    const timeOutSeconds=typeof(requestProperties.body.timeOutSeconds)==='number'&& requestProperties.body.timeOutSeconds%1===0&& requestProperties.body.timeOutSeconds>1
    && requestProperties.body.timeOutSeconds<=5?requestProperties.body.timeOutSeconds:false;

    if(id){
        if(protocol || url || method || successCodes || timeoutSeconds){
            data.read('checks',id,(err1,checkData)=>{
                if(!err1 && checkData){
                    let checkObject=parseJSON(checkData)

                    let token=typeof(requestProperties.headersObject.token)==='string'?requestProperties.headersObject.token:false

                    tokenHandler._token.verify(token,checkObject.userPhone,(token)=>{
                        if(token){
                            if(protocol){
                                checkObject.protocol=protocol;
                            }
                            if(url){
                                checkObject.url=url;
                            }
                            if(method){
                                checkObject.method=method;
                            }
                            if(timeOutSeconds){
                                checkObject.timeOutSeconds=timeOutSeconds;
                            }
                            if(successCodes){
                                checkObject.successCodes=successCodes;
                            }

                            //store the check object
                            data.update('checks',id,checkObject,(err2)=>{
                                if(!err2){
                                    callback(200,{'message':"Check Update Successful"})
                                }else{
                                    callback(500,{
                                        error:'There was a problem in the server side'
                                    })   
                                }
                            })


                        }else{
                            callback(500,{
                                error:'Authentication Failed'
                            })  
                        }
                    })


                }else{
                    callback(500,{
                        error:'There was a problem in the server side'
                    })  
                }
            })
        }else{
            callback(400,{
                error:'you have must one field to update'
            })   
        }
    }else{
        callback(400,{
            error:'you have a problem in you request'
        })   
    }
}
//@Todo authentication
handler._check.delete=(requestProperties,callback)=>{

    const id=typeof(requestProperties.queryStringObject.id)==='string'&&requestProperties.queryStringObject.id.trim().length==20?requestProperties.queryStringObject.id:false;


    if(id){
        data.read('checks',id,(err,checkData)=>{
            if(!err && checkData){
                let token=typeof(requestProperties.headersObject.token)==='string'?requestProperties.headersObject.token:false

                tokenHandler._token.verify(token,parseJSON(checkData).userPhone,(token)=>{
                    if(token){
                       //delete the check data
                       data.delete('checks',id,(err1)=>{
                            if(!err1){
                                data.read('users',parseJSON(checkData).userPhone,(err3,userData)=>{
                                       if(!err3 && userData){
                                           let userObject=parseJSON(userData)
                                            let userChecks=typeof(userObject.checks) ==='object' && 
                                                userObject.checks instanceof Array ? userObject.checks:[];
                                            //remove the deleted check id from user list of checks
                                            
                                            let checkPosition=userChecks.indexOf(id);
                                            if(checkPosition>-1){
                                                userChecks.splice(checkPosition,1)
                                                //reSave the user data
                                                userObject.checks=userChecks;
                                                data.update('users',userObject.phone,userObject,(err4)=>{
                                                    if(!err4){
                                                        callback(200,{
                                                            'message':"check deleted"
                                                        })
                                                    }else{
                                                        callback(400,{
                                                            error:'There was a server site problem'
                                                        })  
                                                    }
                                                })

                                            }else{
                                                callback(500,{
                                                    error:'The checkid that you are trying to remove is not found in user!'
                                                })  
                                            }
                                            



                                       } else{
                                        callback(400,{
                                            error:'There was a server site problem'
                                        })    
                                       }
                                })
                            }else{
                                callback(400,{
                                    error:'There was a server site problem'
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
                    error:'There was a server site problem'
                })    
            }
        })
    }else{
        callback(400,{
            error:'you have a problem in you request'
        })  
    }


}




module.exports=handler