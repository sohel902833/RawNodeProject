const fs=require('fs')
const path=require('path')

const lib={}

//base directory of the data folder
lib.basedir=path.join(__dirname,'/../.data/')
//write data to file

lib.create=function(dir,file,data,callback){
    ///open file for writing


fs.open(`${lib.basedir+dir}/${file}.json`,'wx',(err,fileDescriptor)=>{
    if(!err && fileDescriptor){

        //convert data to string 
        const stringData=JSON.stringify(data);
        
        
        //write data to file and close it
        fs.writeFile(fileDescriptor,stringData,(err)=>{
            if(!err){
                fs.close(fileDescriptor,(err)=>{
                    if(!err){
                        callback(false)
                    }else{
                        callback("Error closing the new file")
                    }
                })
            }else{
                callback('Error writing to new file')
            }
        })



    }else{
        callback(`Error is here: ${err}`);
    }
})
}

//read data from file
lib.read=(dir,file,callback)=>{
        fs.readFile(`${lib.basedir+dir}/${file}.json`,'utf8',(err,data)=>{
            callback(err,data);
        })
}

lib.update=(dir,file,data,callback)=>{
    //file open for writng
    fs.open(`${lib.basedir+dir}/${file}.json`,'r+',(err1,fileDescriptor)=>{
        if(!err1 && fileDescriptor){
               //convert the data to string
                const stringData=JSON.stringify(data)
                fs.ftruncate(fileDescriptor,(err2)=>{
                    if(!err2){
                            //write to the file and close it
                            fs.writeFile(fileDescriptor,stringData,(err3)=>{
                                if(!err3){
                                    fs.close(fileDescriptor,(err4)=>{
                                        if(!err4){
                                            callback(false)
                                        }else{
                                            callback(`Error Closing file ${err4}`)
                                        }
                                    })

                                }else{
                                    callback(`Error Writing File ${err3}`)
                                }
                            })
                    }else{
                        callback(`Error Truncating File ${err2}`)
                    }
                })



        }else{
           callback(`Error updating.File may not exists.${err1}`)
        }
    })
}
//delete existing files
lib.delete=(dir,file,callback)=>{
    fs.unlink(`${lib.basedir+dir}/${file}.json`,(err)=>{
        if(!err){
            callback(false)
        }else{
            callback("Error Deleting file")
        }
    })
}


//list all the items in a directory

lib.list=(dir,callback)=>{
    fs.readdir(`${lib.basedir+dir}/`,(err,fileNames)=>{
        if(!err && fileNames && fileNames.length>0){
            let trimmedFileNames=[];
            fileNames.forEach(fileName=>{
                trimmedFileNames.push(fileName.replace(`.json`,''));
            })
            callback(false,trimmedFileNames)

        }else{
            callback(`Error reading directory`)
        }

    })
}






module.exports=lib

