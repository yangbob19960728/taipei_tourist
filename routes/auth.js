const express = require('express');
var router = express.Router();
const db = require('../connection/firebase_admin_connect');
const firebase = require('../connection/firebase_auth');
const fireAuth = firebase.auth();

router.get('/', function (req, res, next) {
  console.log(firebase.auth())
  res.send("進入auth頁面")
})

router.post('/signIn', function (req, res, next) {
  let email = req.body.email
  let password = req.body.password
  fireAuth.signInWithEmailAndPassword(email,password)
  .then(user=>{
    console.log(user.user.uid)
    let uid = user.user.uid
    req.session.uid = uid
    let timestamp = Date.now()
    db.collection('users').doc(uid).update({
      timestamp:timestamp
    })
    .then(snapshot=>{
      // if(!snapshot.exists){
      //   return
      // }
      // console.log(snapshot)
      res.send({
        code:"auth/login-success",
        message:"成功登入",
      })
      // res.redirect("/")
    })
  })
  .catch(err=>{
    // console.log(err)
    res.send(err)
  })
  
})
//使用者註冊API
router.post('/registered', function (req, res, next) {
  // console.log(req.body)
  let email = req.body.email;
  let password = req.body.password
  let username = req.body.username
  fireAuth.createUserWithEmailAndPassword(email, password)
    .then(function (user) {
      console.log(user.user.uid)
      let data = {
        email,
        uid: user.user.uid,
        family_name: "",
        given_name: username,
        sex: "",
        birthday: "",
        collectionSpotsId: ['8AFcfsaFAoBsHXDuU2Ut', 'a4TCZg8BliVzrMnKdVAS'],
        timestamp: Date.now(),
        imgUrl: "/images/icons_people.png"
      }
      db.collection('users').doc(data.uid).set(data).then(ref => console.log(ref))
      res.send({
        code:"auth/create-success",
        message:"帳號註冊成功",
        user:user
      })
    })
    .catch(function (error) {
      console.log(error.message)

      res.send(error)
    })
})
router.post('/certification', function (req, res, next) {
  // console.log(req.body)
  let id = req.body.uid
  //session
  req.session.uid = id
  //timestamp
  timestamp = Date.now()
  let postDbData = {
    uid: req.body.uid,
    email: req.body.email,
    family_name: req.body.family_name,
    given_name: req.body.given_name,
    sex: "",
    birthday: "",
    collectionSpotsId: ['8AFcfsaFAoBsHXDuU2Ut', 'a4TCZg8BliVzrMnKdVAS'],
    timestamp: timestamp,
    imgUrl: req.body.imgUrl
  }


  let userDb = db.collection('users').doc(id);
  userDb.get().then(snapshot => {
      if (!snapshot.exists) {
        userDb.set(postDbData).then(ref => {
          console.log(ref)

          res.send("ok")
          return
        })
      }
      userDb.update({
        timestamp: timestamp
      }).then(doc => {
        res.send("ok")
      })

    })
    .catch(err => {
      console.log(err)
    })

})

router.post('/loginout', function (req, res, next) {
  req.session.uid = ""
  res.send("ok")
})





module.exports = router;