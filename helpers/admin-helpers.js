var db =require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectID
const bcrypt=require('bcrypt')
var keygen = require("keygenerator");
var random=require('random')
const { response } = require('../app');
const { number } = require('keygenerator/lib/keygen');
module.exports={

keyGenarator:()=>{
    return new Promise(async(resolve,reject)=>{
        chars: true
        sticks: false
        numbers: true
       specials: false
        sticks: false
        length: 2
        forceUppercase: false
        forceLowercase: false
       exclude:[ ]
      let generatedKey=keygen.password();
      let rnumber=random.int((min = 1000), (max = 9999))
      let stringNumber=rnumber.toString()
      let defaultTopicFinalNumber=stringNumber.substr(0,2)
      let defaultTopicFinalChar=generatedKey.substr(0,3)
      let defaultTopic=defaultTopicFinalChar+defaultTopicFinalNumber
      console.log('DefaultTopic :::'+defaultTopic);
      console.log('Secondary Key :::'+generatedKey);
    var obj={
        key:rnumber+generatedKey,
         defaultTopic:defaultTopic
    }
      await db.get().collection(collection.KEYS).insertOne(obj).then((response)=>{
          resolve(response)
      })
    })


},
keyViewer:()=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.KEYS).find().toArray().then((allKeys)=>{
            resolve(allKeys)
        })
    })
},
addSensors:(data)=>{
    return new Promise(async(resolve,reject)=>{
        let obj={
            name:data.name,
            key:data.key,
            minValue:data.min,
            maxValue:data.max,
            pinNumber:data.pin,
        }
        await db.get().collection(collection.SENSORS).insertOne(obj).then((response)=>{
           resolve(response)

        })
    })
},
getSensors:()=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.SENSORS).find().toArray().then((allSensors)=>{
            resolve(allSensors)
          
        })
    })
},
deleteSensor:(id)=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.SENSORS).deleteOne({_id:objectId(id)}).then((response)=>{
            resolve(response)
        })
    })
},
editSensorDetails:(id,data)=>{

    return new Promise((resolve,reject)=>{
        db.get().collection(collection.SENSORS).updateOne({_id:objectId(id)},
        {
            $set:{
                name:data.name,
                key:data.key,
                minValue:data.minValue,
                maxValue:data.maxValue,
                pinNumber:data.pinNumber,
            }
        }).then((response)=>{
            resolve(response)
        })
    })
},
sensorDataToEdit:(id)=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.SENSORS).find({_id:objectId(id)}).toArray().then((allSensors)=>{
            resolve(allSensors)
          
        })
    })
},


}