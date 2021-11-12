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
          

        }
        console.log("#########");
        console.log(firstConnect);
        
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
  router.get('/uart-delete-parameter/:id',(req,res)=>{
    console.log(req.params.id);
    userHelpers.deleteUartParameter(req.session.user._id,req.params.id).then((response)=>{
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

module.exports = router;
