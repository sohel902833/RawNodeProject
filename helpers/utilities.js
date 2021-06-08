//dependency

const crypto=require('crypto')
const environments=require('./environment')
//module scaffolding

const utilities={};

//parse JSON String to Object

utilities.parseJSON=(jsonString)=>{
    let output;
    try{
        output=JSON.parse(jsonString)
    }catch{
        output={};
    }
    return output;
}

//hashing String

utilities.hash=(str)=>{
    if(typeof(str)==='string' && str.length>0){
        let hash=crypto
            .createHmac('sha256',environments.secretKey)
            .update(str)
            .digest('hex')


         return hash   
    }else{
        return false;
    }
}
utilities.createRandomString=(strLength)=>{
    let length=strLength;

    length=typeof(strLength)==='number' && strLength>0?strLength:false;
    if(length){
        let possiblecharacters=`abcdefghijklmnopqrstuvwxyz1234567890`;
        let output=''
        for(let i=1; i<=length; i+=1){
            let randomCharacter=possiblecharacters.charAt(Math.floor(Math.random()*possiblecharacters.length))
            output+=randomCharacter
        }
       return output;
    }



    return false;
}





module.exports=utilities;