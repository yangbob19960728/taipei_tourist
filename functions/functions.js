const db = require('../connection/firebase_admin_connect');

var allFunctions = {
  //取得cookie資訊
  getCookieBrowseData: function (req) {
    let cookiesStrData = req.cookies.browserRecord || ""
    let cookiesArrayData = cookiesStrData.split("&")
    let cookiesAllData = []
    cookiesArrayData.forEach(cookie => {
      let arrayData = cookie.split(",;")
      cookiesAllData.push({
        productId: arrayData[0],
        stitle: arrayData[1],
        imgUrl: arrayData[2],
        timestamp: arrayData[3],
      })
    })
    return cookiesAllData
  },
  //設定cookie瀏覽紀錄
  setCookieBrowseData: function (req,res,productId,passData) {
    //cookie 
    let cookisData = req.cookies.browserRecord || ""
    // console.log(cookisData)
    //要存放cookie的資料
    let productData = {
      productId: productId,
      stitle: passData.stitle,
      imgUrl: passData.file[0],
      timestamp: Date.now(),
    }

    let cookiesAllDataArray = []
    if (cookisData != "") {
      let cookisArray = cookisData.split("&")
      cookisArray.forEach(cookie => {
        let dataArray = cookie.split(",;")
        cookiesAllDataArray.push({
          productId: dataArray[0],
          stitle: dataArray[1],
          imgUrl: dataArray[2],
          timestamp: parseInt(dataArray[3]),
        })
      })
      let i = -1
      cookiesAllDataArray.forEach((cookie, index) => {
        let id = cookie.productId
        if (id == productData.productId) {
          i = index
        }
      })
      if (i == -1) {
        cookiesAllDataArray.push(productData)
      } else {
        cookiesAllDataArray[i] = productData
      }
    } else {
      cookiesAllDataArray.push(productData)
    }

    cookiesAllDataArray.sort((a, b) => {
      return parseInt(b.timestamp) - parseInt(a.timestamp)
    })
    cookiesAllDataArray = cookiesAllDataArray.slice(0, 6)
    console.log("結果", cookiesAllDataArray)
    let arr = []
    cookiesAllDataArray.forEach(cookie => {
      let str = cookie.productId + ",;" + cookie.stitle + ",;" + cookie.imgUrl + ",;" + cookie.timestamp
      arr.push(str)
      // console.log(str)
    })

    res.cookie("browserRecord", arr.join("&"))
  },
  //取得各地區的景點，首頁預設為Beitou北投地區的景點，以及取得使用者資料
  getRegionAttractions: function (req, res, next, region, page, pageShowNum, uid, cookiesAllData) {
    Promise.all([
      db.collection('products').where("regionEn", "==", region).get(),
      db.collection('users').doc(uid).get()
    ]).then(response => {
      let userData;
      if (!response[1].exists) {
        userData = null
      } else {
        userData = response[1].data()
      }
      // console.log("uid",response[1].data())
      // if(response[1].data())
      let dataArray = []
      response[0].forEach(doc => {
        dataArray.push({
          "id": doc.id,
          "data": doc.data()
        })
      })
      let pageCounts = Math.ceil(dataArray.length / pageShowNum)
      // console.log("pageCounts",pageCounts,typeof(pageCounts))
      if (page > pageCounts) {
        page = pageCounts
        return res.redirect(`/?page=${page}`)
      } else if (page < 1) {
        page = 1
        return res.redirect(`/?page=${page}`)
      }
      let passData = dataArray.slice((page - 1) * pageShowNum, page * pageShowNum)
      res.render('index', {
        title: 'Express',
        taipeiData: passData,
        pageCounts: pageCounts,
        userData: userData,
        cookiesAllData
      });
    }).catch(err => {
      console.log(err)
      return res.status(500).render('error');
    })
  },
  //取得使用者的資料
  getUserData: function (uid) {
    db.collection('users').doc(uid).get()
      .then(snapshot => {
        if (snapshot.empty) {
          return null
        }
        return snapshot.data()
      })
      .catch(err => {
        return res.status(500).render('error');
      })
  },
  //搜尋資料，取得使用者資料
  searchData: function (req, res, next, searchTitle, page, pageShowNum, uid) {
    Promise.all([
      db.collection('products').get(),
      db.collection('users').doc(uid).get()
    ]).then(response => {
      let searchDataArray = []
      let userData;
      if (!response[1].exists) {
        userData = null
      } else {
        userData = response[1].data()
      }
      response[0].forEach(doc => {
        if (doc.data().stitle.indexOf(searchTitle) != -1) {
          searchDataArray.push({
            "id": doc.id,
            "data": doc.data()
          })
        }

      })
      let passData = null
      let pageCounts = null
      // console.log("searchDataArray.length",searchDataArray.length)
      if (searchDataArray.length != 0) {
        pageCounts = Math.ceil(searchDataArray.length / pageShowNum)
        // console.log("pageCounts",pageCounts,typeof(pageCounts))
        if (page > pageCounts) {
          page = pageCounts
          return res.redirect(`/search?page=${page}&searchTitle=${searchTitle}`)
        } else if (page < 1) {
          page = 1
          return res.redirect(`/search?page=${page}&searchTitle=${searchTitle}`)
        }
        passData = searchDataArray.slice((page - 1) * pageShowNum, page * pageShowNum)
      }

      console.log("passData", passData)
      res.render('search', {
        title: 'Express',
        taipeiData: passData,
        pageCounts: pageCounts,
        userData: userData,
        searchTitle: searchTitle
      });
    }).catch(err => {
      console.log(err)
      return res.status(500).render('error');
    })

  },
  //取得特定景點的評論
  getCommitsFromAttraction: function (req,res,next,productId,productId,uid,done) {
    db.collection('commits').where("productId", "==", productId).limit(10).get()
      .then(snapshot => {
        let commits = []
        if (!snapshot.empty) {
          snapshot.forEach(commit => {
            // console.log("commit",commit.data())
            let userId = commit.data().userUid
            db.collection('users').doc(userId).get()
              .then(user => {
                console.log("userId", userId)
                commits.push({
                    userName: user.data().given_name,
                    userImgUrl: user.data().imgUrl,
                    timestamp: commit.data().commentTime,
                    content: commit.data().content,
                    commitId: commit.id,
                    author: userId
                  }

                )
                commits.sort((a, b) => {
                  return b.timestamp - a.timestamp
                })
                // console.log("commit123",commits)
              })
          })
        } else {
          commits = null
        }
        done(req,res,commits,productId,uid)
      }).catch(err => {
        console.log(err)
        return res.status(500).render('error');
      })
  },
  //取的指定的景點，和使用者資料
  getSpecificAttractionAndUserData: function (req,res,commits,productId,uid) {
    Promise.all([db.collection('products').doc(productId).get(), db.collection('users').doc(uid).get()])
      .then(response => {
        if (!response[0].exists) {
          // console.log('沒有找到資料');
          return res.status(404).render('fail');
        }
        console.log("commits", commits)

        let passData = response[0].data()
        db.collection('products').where("regionEn", "==", passData.regionEn).limit(20).get()
          .then((snapshot) => {
            if (snapshot.empty) {
              // console.log('沒有找到資料');
              return;
            }
            let swiperData = []
            snapshot.forEach(doc => {
              swiperData.push({
                id: doc.id,
                data: doc.data()
              })
            })
            //設定cookie瀏覽資料
            allFunctions.setCookieBrowseData(req,res,productId,passData)
            res.render('spots', {
              title: 'Express',
              taipeiData: passData,
              swiperData: swiperData,
              userData: response[1].empty?null:response[1].data(),
              productId,
              commits
            });
          })
          .catch((err) => {
            // console.log('Error getting documents', err);
            return res.status(404).render('fail');
          });
      })
  }
}

module.exports = allFunctions