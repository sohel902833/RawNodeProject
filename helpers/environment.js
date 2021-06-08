/*
    Title:Environments
    Description:Module all environment related things
*/


const environments={};

environments.staging={
    port:3000,
    envName:"staging",
    secretKey:'hdkdjfkdjfkrjdkdfjdkdfj',
    maxChecks:5,
    twilio:{
        fromPhone:'+16128008293',
        accountSid:'AC375b3eaf9f16a0ca8c09828042d53ae4',
        authToken:'bac34c85b0b9df17135dc3cc8fa74891'
    }
}
environments.production={
    port:5000,
    envName:"production",
    secretKey:'jdjfhdkfjfkrjdkfjdnkdjfj',
    maxChecks:5,
    twilio:{
        fromPhone:'+16128008293',
        accountSid:'AC375b3eaf9f16a0ca8c09828042d53ae4',
        authToken:'bac34c85b0b9df17135dc3cc8fa74891'
    }
}
//determine which environment was passed
const currentEnvironment=typeof(process.env.NODE_ENV)==='string'?process.env.NODE_ENV:'staging';
//export corresponding environment object
const environmentToExport=typeof(environments[currentEnvironment])==='object'
            ?environments[currentEnvironment]
            :environments.staging;
 
            
//export module            
module.exports=environmentToExport; 




