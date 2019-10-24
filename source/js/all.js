$(document).ready(function () {
  //註冊
  $("#registered").click(function (e) {
    e.preventDefault()
    $("#loginBlock").toggleClass("d-none")
    $("#registeredBlock").toggleClass("d-none")
  })
  //登入
  $("#login").click(function (e) {
    e.preventDefault()
    $("#loginBlock").toggleClass("d-none")
    $("#registeredBlock").toggleClass("d-none")
  })
  //modal事件處理
  $('#exampleModal').on('hide.bs.modal', function (e) {
    $(".js-invalid-feedback").css('display', 'none')
    $(".js-valid-feedback").css('display', 'none')
    $("#loginBlock").removeClass('d-none')
    $("#registeredBlock").addClass('d-none')
  })
  //註冊ajax
  $("#registeredBlock input[type='submit']").click(e => {
    e.preventDefault()
    // console.log("註冊")
    let username = $("#registeredBlock input[name='username']").val().trim()
    let email = $("#registeredBlock input[name='email']").val()
    let password = $("#registeredBlock input[name='password']").val()
    // console.log("username", username, "email", email, "password", password)
    let isPostData = 0
    if (username == "") {
      $(".js-username-invalid-feedback").css('display', 'block')
      $(".js-username-valid-feedback").css('display', 'none')

    } else {
      $(".js-username-valid-feedback").css('display', 'block')
      $(".js-username-invalid-feedback").css('display', 'none')
      isPostData++
    }


    if (password.length >= 6) {
      $(".js-password-valid-feedback").css('display', 'block')
      $(".js-password-invalid-feedback").css('display', 'none')
      isPostData++
    } else {
      $(".js-password-invalid-feedback").css('display', 'block')
      $(".js-password-valid-feedback").css('display', 'none')
    }
    // Regular expression Testing
    let emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    //validate ok or not
    if (email.search(emailRule) != -1 && isPostData == 2) {
      $(".js-email-valid-feedback").css('display', 'block')
      $(".js-email-invalid-feedback").css('display', 'none')
      let data = {
        username,
        email,
        password
      }
      $.ajax({
        url: '/auth/registered',
        method: 'post',
        data,
        success: function (response) {
          console.log(response)
          if (response.code == "auth/email-already-in-use") {
            $(".js-email-invalid-feedback").html("該帳號已經註冊過了").css('display', 'block')
            $(".js-email-valid-feedback").css('display', 'none')
            $("#registeredBlock").addClass('d-none')
            $("#loginBlock").removeClass('d-none')
            alert("該帳號已經註冊過了，請直接登入")
          } else if (response.code == "auth/create-success") {
            $("#registeredBlock").addClass('d-none')
            $("#loginBlock").removeClass('d-none')

            alert("帳號註冊成功")
            //轉向登入畫面

          } else if (response.code == "auth/operation-not-allowed") {
            $(".js-email-invalid-feedback").html("該帳號已經註冊過了").css('display', 'block')
            $(".js-email-valid-feedback").css('display', 'none')
            // alert("該帳戶被停用")
          } else if (response.code == "auth/weak-password") {
            $(".js-password-invalid-feedback").html("密碼長度要超過6個位元").css('display', 'block')
            $(".js-password-valid-feedback").css('display', 'none')
            alert("密碼不安全")
          } else if (response.code == "auth/invalid-email") {
            $(".js-email-invalid-feedback").html("email格式錯誤").css('display', 'block')
            $(".js-email-valid-feedback").css('display', 'none')
            // alert("email格式錯誤")
          }
        },
        error: function (err) {
          console.log(err)
          alert(err)
        }
      })

    } else {
      $(".js-email-invalid-feedback").html("格式錯誤").css('display', 'block')
      $(".js-email-valid-feedback").css('display', 'none')
    }
  });
  // 登入 
  $("#loginBlock input[type='submit']").click(e => {
    e.preventDefault()
    let email = $("#loginBlock input[name='loginEmail']").val()
    let password = $("#loginBlock input[name='loginpassword']").val()
    // Regular expression Testing
    let emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    //validate ok or not
    if (email.search(emailRule) != -1) {
      $(".js-loginEmail-valid-feedback").css('display', 'block')
      $(".js-loginEmail-invalid-feedback").css('display', 'none')
      let data = {
        email,
        password
      }
      $.ajax({
        url: '/auth/signIn',
        method: 'post',
        data,
        success: function (response) {
          console.log(response)
          if (response.code == "auth/login-success") {
            //頁面重新整理
            window.location.href = window.location.origin + window.location.pathname
          } else if (response.code == "auth/wrong-password") {
            $(".js-loginpassword-invalid-feedback").html("密碼錯誤").css('display', 'block')
            $(".js-loginpassword-valid-feedback").css('display', 'none')
          } else if (response.code == "auth/user-not-found") {
            $(".js-loginEmail-invalid-feedback").html("該帳號不存在").css('display', 'block')
            $(".js-loginEmail-valid-feedback").css('display', 'none')
            // alert("該帳戶被停用")
          } else if (response.code == "auth/user-disabled") {
            $(".js-loginEmail-invalid-feedback").html("該帳號被停用").css('display', 'block')
            $(".js-loginEmail-valid-feedback").css('display', 'none')
          } else if (response.code == "auth/invalid-email") {
            $(".js-loginEmail-invalid-feedback").html("email格式錯誤").css('display', 'block')
            $(".js-loginEmail-valid-feedback").css('display', 'none')
            // alert("email格式錯誤")
          }
        },
        error: function (err) {
          console.log(err)
        }
      })
    } else {
      $(".js-loginEmail-valid-feedback").css('display', 'none')
      $(".js-loginEmail-invalid-feedback").css('display', 'block')
    }
  })
  //第三方登入
    //google
  $("#member-login-provider-google").click(function () {
    let base_proveider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(base_proveider).then(function (result) {
      console.log(result)
      let postData = {
        uid: result.user.uid,
        email: result.user.email,
        //姓氏
        family_name: result.additionalUserInfo.profile.family_name,
        //名字
        given_name: result.additionalUserInfo.profile.given_name,
        imgUrl: result.user.photoURL
      }
      $.ajax({
        url: '/auth/certification',
        type: 'post',
        data: postData,
        error: function (error) {
          alert(error);
        },
        success: function (response) {
          if (response == "ok") {
            //頁面重新整理
            window.location.href = window.location.origin + window.location.pathname
          }

        }
      })
    }).catch(function (error) {
      console.log(error)
    })
  })
    //FB
  $("#member-login-provider-facebook").click(function () {
    let provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      // var token = result.credential.accessToken;
      // console.log(token)
      // The signed-in user info.
      // var user = result.user;
      console.log(result)
      let postData = {
        uid: result.user.uid,
        email: result.user.email,
        //姓氏
        family_name: result.additionalUserInfo.profile.last_name,
        //名字
        given_name: result.additionalUserInfo.profile.first_name,
        imgUrl: result.user.photoURL,
      }
      console.log("postData", postData)
      $.ajax({
        url: '/auth/certification',
        type: 'post',
        data: postData,
        error: function (error) {
          alert(error);
        },
        success: function (response) {
          if (response == "ok") {
            //頁面重新整理
            window.location.href = window.location.origin + window.location.pathname
          }

        }
      })
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  })
    //github
  $("#member-login-provider-github").click(function () {
    let provider = new firebase.auth.GithubAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a GitHub Access Token. You can use it to access the GitHub API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
      console.log(result)
      let postData = {
        uid: result.user.uid,
        email: result.user.email,
        //姓氏
        family_name: "",
        //名字
        given_name: result.additionalUserInfo.username,
        imgUrl: result.additionalUserInfo.profile.avatar_url

      }
      $.ajax({
        url: '/auth/certification',
        type: 'post',
        data: postData,
        error: function (error) {
          alert(error);
        },
        success: function (response) {
          if (response == "ok") {
            //頁面重新整理
            window.location.href = window.location.origin + window.location.pathname
          }

        }
      })
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(error.message)
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  })

  //登出
  $(".js-login-out").click(function (e) {
    e.preventDefault()
    $.ajax({
      url: "/auth/loginout",
      method: 'post',
      error: function (error) {
        alert(error);
      },
      success: function (response) {
        if (response == "ok") {
          //頁面重新整理
          window.location.href = window.location.origin + window.location.pathname
        }

      }
    })
  })
})