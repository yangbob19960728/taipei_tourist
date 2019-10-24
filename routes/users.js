var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
const csrf = require('csurf');
var csrfProtection = csrf({
  cookie: true
});
const db = require('../connection/firebase_admin_connect');
const multer = require('multer')

//取得使用者資料
let uid;
let userData;
getUserData = function (req, res, next) {
  uid = req.session.uid
  db.collection('users').doc(uid).get()
    .then(snapshot => {
      userData = snapshot.data()
      console.log(userData)
      next()
    })

}

// console.log(userData)
/* GET users listing. */
router.get('/', csrfProtection, getUserData, function (req, res, next) {
  res.render('user', {
    csrfToken: req.csrfToken(),
    userData: userData
  });
});
router.post('/registered', csrfProtection, function (req, res, next) {
  console.log(req.body)
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.gmailUser, // generated ethereal user
      pass: process.env.gmailPassword // generated ethereal password
    }
  });
  let mailOption = {
    from: "伺服器<yangbob.nodeserver@gmail.com>",
    to: "f3612453@gmail.com",
    subject: req.body.username + "寄了一封信",
    text: req.body.description
  }
  transporter.sendMail(mailOption, function (error, info) {
    if (error) {
      return console.log(error)
    }
    res.redirect('/users')
  })
});

router.post('/avatar', function (req, res, next) {
  let uid = req.session.uid
  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/images")

    },
    filename: function (req, file, cb) {
      let type = file.mimetype.split("/")[1]
      cb(null, uid + "." + type)
      console.log(file)
    }
  })

  let upload = multer({
    storage: storage
  }).single('avatar')
  upload(req, res, function (err) {
    if (err) {
      console.log(err)
      res.send({
        "ret": "err"
      })
      return
    }
    let imgUrl = "/images/" + req.file.filename
    db.collection('users').doc(uid).update({
      imgUrl: imgUrl
    }).then(snapshot => {
      console.log("snapshot", snapshot)
      res.send({
        "ret": "success",
        data: imgUrl + "?"+Date.now()
      })
    }).catch(err => {
      console.log(err)
      res.send({
        "ret": "fail"
      })
    })
  })

});
router.post('/profile', function (req, res, next) {
  let data = {
    given_name: req.body.given_name,
    family_name: req.body.family_name,
    sex: req.body.sex,
    birthday: req.body.birthday,
    email: req.body.email,
  }
  let uid = req.session.uid
  console.log(data)
  db.collection('users').doc(uid).update(data)
    .then(snapshot => {
      console.log(snapshot)
      res.send("success")
    }).catch(err => {
      console.log(err)
      res.send("fail")
    })

})
router.post('/deleteCommit',function(req,res,next){
  let commitId = req.body.commitId
  let productid = req.body.productid
  console.log("刪除",commitId)
  let newCommitData=[]
  db.collection('commits').doc(commitId).delete()
  .then(snapshot=>{
    console.log(snapshot)
    db.collection('commits').where("productId","==",productid).get()
    .then(snapshot=>{
      snapshot.forEach(doc=>{
        newCommitData.push(doc.data())
      })
      console.log(newCommitData)
      res.send({
        success:true,
        data:newCommitData
      })
    })
    
  })
  .catch(err=>{
    console.log(err)
  })

})
module.exports = router;