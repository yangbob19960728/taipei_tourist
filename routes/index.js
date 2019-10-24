var express = require('express');
var router = express.Router();
// const taipei = require("../source/data/xmlData.json");
// const test = require("../source/data/test.json");
const db = require('../connection/firebase_admin_connect');

const fun = require('../functions/functions');
const firebaseAdmin = require('firebase-admin');
// const googleMapsClient = require('@google/maps').createClient({
//   key: 'AIzaSyCeXVvxWmKCqKuKj3LlAWfsNQer3SGP_vA'
// });

// 每頁呈現的文章數量
const pageShowNum = 10;

/* GET home page. */
router.get('/', function (req, res, next) {
  let page = req.query.page || 1
  let uid = req.session.uid || "0"
  //取得cookie資訊
  let cookiesAllData = fun.getCookieBrowseData(req)
  fun.getRegionAttractions(req, res, next,"Beitou",page,pageShowNum,uid,cookiesAllData)
  
});

router.get('/regions/:region', function (req, res, next) {
  let region = req.params.region
  let page = parseInt(req.query.page) || 1
  let uid = req.session.uid || "0"

  //取得cookie資訊
  let cookiesAllData = fun.getCookieBrowseData(req)
  fun.getRegionAttractions(req, res, next,region,page,pageShowNum,uid,cookiesAllData)

});
router.get('/search', function (req, res, next) {
  let searchTitle = req.query.searchTitle
  // console.log("searchTitle", typeof (searchTitle))
  let page = parseInt(req.query.page) || 1
  // console.log("page",typeof(page))
  let uid = req.session.uid || "0"
  if(searchTitle == undefined){
    return res.redirect('/')
  }
  //搜尋資料，取得使用者資料
  fun.searchData(req, res, next,searchTitle,page,pageShowNum,uid)
  
});


router.get('/spots/:productId', function (req, res, next) {
  let productId = req.params.productId;
  let uid = req.session.uid || "0"
  
  //評論
  fun.getCommitsFromAttraction(req,res,next,productId,productId,uid,fun.getSpecificAttractionAndUserData)

});
router.post('/commits/:productId', function (req, res, next) {
  console.log("commit")
  let data = {
    productId: req.params.productId,
    userUid: req.session.uid,
    content: req.body.comment,
    commentTime: Date.now()
  }
  // console.log(data)
  db.collection('commits').add(data)
    .then(snapshot => {
      console.log(snapshot.id)
      res.redirect('/spots/' + req.params.productId)
    }).catch(err => {
      console.log(err)
    })
})


module.exports = router;