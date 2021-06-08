//dependencies
const {sampleHandler}=require('../handelers/routeHandler/sampleHandelers')
const {userHandler}=require('../handelers/routeHandler/userHandler')
const {tokenHandler}=require('../handelers/routeHandler/tokenHandler')
const {checkHandler}=require('../handelers/routeHandler/checkHandler')



const routes={
    sample:sampleHandler,
    user:userHandler,
    token:tokenHandler,
    check:checkHandler
}

module.exports=routes