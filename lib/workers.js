
//dependencis
const data=require('./data')
const {parseJSON}=require('../helpers/utilities')
const {sendTwilioSms}=require('../helpers/notification')
const url=require('url')
const http=require('http')
const https=require('https')
//app object-module scaffolding
const worker={}




//lookup all the checks from database

worker.getherAllChecks=()=>{

    data.list('checks',(err1,checks)=>{
        if(!err1 && checks && checks.length>0){
            checks.forEach(check=>{
                data.read('checks',check,(err2,checkData)=>{
                    if(!err2 && checkData){
                        //data to the check validator
                        worker.validateCheckData(parseJSON(checkData));
                    }else{
                        console.log(`Error reading one of the check data ${err2}`)
                    }
                })
            })
        }else{
            console.log('Error: could not find any checks to process')
        }
    })

}
// let checkObject={
//     'id':checkId,
//     'userPhone':userPhone,
//     'protocol':protocol,
//     'url':url,
//     'method':method,
//     'successCodes':successCodes,
//     'timeoutSeconds':timeOutSeconds
// }

worker.validateCheckData=(originalCheckData)=>{

    let originalData=originalCheckData;

    if(originalCheckData && originalCheckData.id){
        originalData.state=typeof(originalCheckData.state)=='string'&&['up','down']
        .indexOf(originalCheckData.state)>-1?originalCheckData.state:'down'

        originalData.lastChecked=typeof(originalCheckData.lastChecked)==='number' &&
        originalCheckData.lastChecked>0?originalCheckData.lastChecked:false;
        //past to the next process

        worker.performCheck(originalData); 
    }else{
        console.log(`Error:check was invalid or not properly formatted`)
    }
}

//perform check
worker.performCheck=(originalCheckData)=>{

    //prepare the in initial check outcome
    let checkOutCome={
        'error':false,
        'responseCode':false
    }


    //mark the outcome has not been sent yet
    let outcome=false;

    //parse the host name and full url from original Data
    let parsedUrl=url.parse(originalCheckData.protocol+'://'+originalCheckData.url,true)

    console.log(parsedUrl)
    const hostName=parsedUrl.hostname;
    const path=parsedUrl.path;

    //construct the request
    const requestDetails={
        'protocol':originalCheckData.protocol+':',
        'hostname':hostName,
        'method':originalCheckData.method.toUpperCase(),
        'path':path,
        'timeout':originalCheckData.timeoutSeconds*1000
    }

    const protocolToUse=originalCheckData.protocol==='http'?http:https;

    let req=protocolToUse.request(requestDetails,(res)=>{
        //grab the status code of the request
        const status=res.statusCode;
        console.log(status)
        //update the check outcome and pass to the next process
        checkOutCome.responseCode=status;


        if(!outcome){
            worker.processCheckOutCome(originalCheckData,checkOutCome);
            outcome=true;
        }
    });

    req.on('error',(err)=>{
        let checkOutCome={
            'error':true,
            'value':err
        }
        if(!outcome){
            worker.processCheckOutCome(originalCheckData,checkOutCome);
            outcome=true;
        }
    });
    req.on('timeout',(err)=>{

        let checkOutCome={
            'error':true,
            'value':'timeout'
        }

        if(!outcome){
            worker.processCheckOutCome(originalCheckData,checkOutCome);
            outcome=true;
        }
    })

    //req send
    req.end()


}


//save final output 
worker.processCheckOutCome=(originalCheckData,checkOutCome)=>{
    //check if outcome up or down
    let state=!checkOutCome.error && checkOutCome.responseCode && originalCheckData.successCodes
    .indexOf(checkOutCome.responseCode)>-1?'up':'down';

    //decide whether we should alert the user or not

    let alertWanted=originalCheckData.lastChecked && originalCheckData.state !=state?true:false;

    //update the check data
    let newCheckData=originalCheckData;
    newCheckData.state=state
    newCheckData.lastChecked=Date.now();


    //update the check to disk
    data.update('checks',newCheckData.id,newCheckData,(err)=>{
        if(!err){
            //send the check data to next process
            if(alertWanted){
                    worker.alertUserToStatusChange(newCheckData);
            }else{
                console.log('alert is not needed')
            }
        
        }else{
            console.log(`error trying to save check date of one of the checks`)
        }
    })






}
//send notification sms to the user is state changed
worker.alertUserToStatusChange=(newCheckData)=>{
    let msg=`Alert: Your Check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url}  is currently ${newCheckData.state}`
    sendTwilioSms(newCheckData.userPhone,msg,(err)=>{
        if(!err){
            console.log(`User was alerted to a status changed via SMS ${msg}`)
        }else{
            console.log(`there was a problem to sending sms to one of the user ${err}`)
        }
    })


}



//timer to execute the worker process per minute

worker.loop=()=>{
    setInterval(() => {
        worker.getherAllChecks();
    }, 1000*30);
}



worker.init=()=>{
    //execute all the check
    worker.getherAllChecks();

    //call the loop so that checks continue
    worker.loop();
}

module.exports=worker

