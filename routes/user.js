var express = require('express');
const { response } = require('../app');
var router = express.Router();
var objectId=require('mongodb').ObjectID
const { ObjectID } = require('bson')
var userHelpers=require('../helpers/user-helpers')
var subscribe=require('../mqtt-clients/subscribe')
var publish=require('../mqtt-clients/publish')
var sensorDataUart=require('../static-data/sensorData-uart')
var sensorDataProgrammingMode=require('../static-data/sensorData-programmingMode')

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }
  else{
    res.render('store/user/login')
  }
}


/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index',{admin:false});

});
router.get('/signup', function(req, res, next) {
  res.render('signup',{admin:false});
});
router.post('/signup',(req,res)=>{
  console.log(req.body);
  userHelpers.keyValidator(req.body.key).then((status)=>{
    if(status.status)
    {
      console.log('KEY  FOUND IN DB ###');
      userHelpers.doSignup(req.body).then((response)=>{
        userHelpers.keyDeleter(req.body.key)
        console.log('key deleted');
        res.redirect('/')
      })
    }
    else{
      console.log("#################### NO KEY FOUND  #############");
      res.redirect('/')
    }
  })
  
})
router.get('/login',(req,res)=>{
  userHelpers.getAllSecKeys()
  res.render('login',{admin:false})

})
  router.post('/login',(req,res)=>{
    console.log('submitting login page requestes...');
    console.log(req.body);
    userHelpers.doLogin(req.body).then((response)=>{
      if(response.status){
        req.session.loggedIn=true
        req.session.user=response.user
        let firstConnect=false
        if(response.user.firstConnect===true)
        {
          firstConnect=true
        }else{
          firstConnect=false
        }
        console.log(response.user);
        let data={
          email:response.user.email,
          dtopic:response.user.defaultTopic,
          liveMode:response.user.liveMode,
          

        }

        
        res.render('account',{data,firstConnect})
      }else{
        req.session.loginErr="Invalied Username or Password"
        res.redirect('/')
      }
    })
  })
  router.get('/connect/:id',verifyLogin,(req,res)=>{
    userHelpers.pickSecondaryKey(req.params.id).then((secKey)=>{
      publish.publishSecondaryKeyToDevice(req.params.id,secKey)

      
      })
 
 
  
  })
  router.get('/uart',(req,res)=>{
    userHelpers.getUartSubscribtions(req.session.user._id).then((response)=>{
    if(response)
    { 
      let data=response.uartMode
      res.render('uart',{data})
    }else{
      res.render('uart')
    }
    })
  })
  router.post('/uart-submit',async(req,res)=>{
    let urtParameter=req.body
     await userHelpers.uartAndProgrammingModeStore(req.session.user._id,urtParameter)
     publish.publishCountToDevice(req.session.user._id).then((status)=>{
       res.redirect('/uart')
     })
   
  })
  router.get('/uart-delete-parameter/:id',async(req,res)=>{
    console.log(req.params.id);
   await userHelpers.deleteUartParameter(req.session.user._id,req.params.id)
   publish.publishCountToDevice(req.session.user._id).then((status)=>{
    res.redirect('/uart')
  })
 
  
  })
  router.get('/uart-view-parameter/:id',(req,res)=>{
    console.log(req.params.id);
    userHelpers.getValues(req.session.user._id,req.params.id).then((response)=>{
    console.log(response);
    if(response)
    {
      let data=response
      let type='line'
      res.render('view-parameter',{data,type})
    }else{
      res.render('view-parameter')
    }

    })
  })
  router.get('/selected-uart',(req,res)=>{
    console.log(req.session.user._id);
    userHelpers.liveModeChanger(req.session.user._id,'uart').then((res)=>{
     console.log(res);
     if(res.status)
     {
      console.log('Successfully updated the live mode to UART MODE');
     }else{
      console.log('failed to update the live mode');
     }
    })
  })
  router.get('/selected-programming',(req,res)=>{
    userHelpers.liveModeChanger(req.session.user._id,'pro').then((res)=>{
      console.log(res);
      if(res.status)
      {
       console.log('Successfully updated the live mode to PROGRAMMING MODE');
      }else{
       console.log('failed to update the live mode');
      }
     })

  })
  router.get('/programmingmode',async(req,res)=>{
    let option1=await userHelpers.settingPinToOptions('1')
    let option2=await userHelpers.settingPinToOptions('2')
    let option3=await userHelpers.settingPinToOptions('3')
    let option4=await userHelpers.settingPinToOptions('4')
    let option5=await userHelpers.settingPinToOptions('5')
    res.render('pro',{option1,option2,option3,option4,option5})
  })
  router.post('/pro-submit',async(req,res)=>
  {
    let data=req.body
     arrayData=[]

    if(data.parameter1)
    {
      await userHelpers.keyTaker(data.parameter1).then((response)=>{
      console.log(response);
      arrayData.push(response.key)
    })
    }
    else
    {
      let pin='0'
      arrayData.push(pin)
    }
    
      if(data.parameter2)
      {
        await userHelpers.keyTaker(data.parameter2).then((response)=>{
        console.log(response);
        arrayData.push(response.key)
      })
    
      }
      else
      {
        let pin='0'
        arrayData.push(pin)
      }
    if(data.parameter3)
    {
      await userHelpers.keyTaker(data.parameter3).then((response)=>{
      console.log(response);
      arrayData.push(response.key)
  })
  
    }
    else
    {
      let pin='0'
      arrayData.push(pin)
    }
      if(data.parameter4)
      {
        await userHelpers.keyTaker(data.parameter4).then((response)=>{
        console.log(response);
        arrayData.push(response.key)
 })
      }
      else
      {
        let pin='0'
        arrayData.push(pin)
      }

    if(data.parameter5)
    {
      await userHelpers.keyTaker(data.parameter5).then((response)=>{
      console.log(response);
      arrayData.push(response.key)
    })
  
    }
    else
    {
      let pin='0'
      arrayData.push(pin)
    }
    userHelpers.secondaryKeyTaker(req.session.user._id).then((secKey)=>{
      console.log(secKey);
      publish.publishPinValuesToDevice(secKey,arrayData).then((status)=>{
        res.render('pro-spec')
      })
    })
    })
  
    


  

module.exports = router;
