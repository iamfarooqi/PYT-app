///SignUP
var url = "https://pyt-app.herokuapp.com";

// const url = "http://localhost:5000"

var socket = io(url);
socket.on('connect', function () {
});

function signup() {
    
    
    axios({
        method: 'post',
        url: url + "/signup",
        data: {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            phone: document.getElementById("phone").value,
            gender: document.getElementById("gender").value
            
            
        },withCredentials: true
        
    }).then(function (response) {
        console.log(response.data.message);
        alert(response.data.message);
        window.location.href = "login.html"
    })
    
    .catch(function (error) {
        console.log(error);
        alert(response.message)
    });
    
    return false;
}

///Login

function login() {
    
    axios({
        method: 'post',
        url: url + "/login",
        data: {
            email: document.getElementById("login-email").value,
            password: document.getElementById("login-password").value,
        }, withCredentials: true
        
    }).then((response) => {
        console.log(response);
        alert(response.data.message)
        window.location.href = "home.html"
    }, (error) => {
        console.log(error);
        alert(error)
    });
    
    return false;
}


//FORGET STEP-1

function forgot1() {
    
    axios({
        method: 'post',
        url: url + "/forget-password",
        data: {
            email: document.getElementById("your-email").value,
        },withCredentials: true
    }).then((response) => {
        console.log(response);
        alert(response.data.message);
        window.location.href = "forget2.html"
    }, (error) => {
        console.log(error);
        alert(error)
    });
    
    return false;
    
}


function forgot2() {
    axios({
        method: 'post',
        url: url + "/forget-password-step-2",
        data: {
            email: document.getElementById("email2").value,
            newPassword: document.getElementById("password2").value,
            otp: document.getElementById("otp").value,
        },withCredentials: true
    }).then((response) => {
        
        console.log(response.data.message);
        alert(response.data.message);
        window.location.href = "login.html"
        
        
    }, (error) => {
        console.log(error);
    });
    return false;
    
}

//POST

function tweetpost() {
    axios({
        method: 'post',
        url: url + "/tweet",
        data: {
            tweet: document.getElementById("your-post").value,
        },withCredentials: true

    }).then((response) => {
        if (response.data.status === 200) {
            // alert(response.data.message)
            return
        } else {
            alert(response.data.message)
        }
    }, (error) => {
        console.log(error);
    });
    return false;
}

function gettweet() {
    // getProfile();
    axios({
        method: 'get',
        url: url + '/tweet-get',
        credentials: 'include',
    }).then((response) => {
        let tweets = response.data.tweet;
        for (i = 0; i < tweets.length; i++) {
            var eachtweet = document.createElement("li");
            eachtweet.innerHTML = `<h5>
            ${tweets[i].username}
            </h5>
            <p>
            ${tweets[i].tweet}
            </p>`;
            eachtweet.setAttribute('class','reverse')
            document.getElementById("mytweet").appendChild(eachtweet);
        }
    }, (error) => {
        console.log(error.message);
    });
    
    
    return false
}


//My Tweets

function mytweet() {
    axios({
        method: 'get',
        url: url + '/myTweets',
        credentials: 'include',
    }).then((response) => {
        let tweets = response.data.tweet;
        for (i = 0; i < tweets.length; i++) {
            var eachtweet = document.createElement("li");
            eachtweet.innerHTML = `<h4>
                ${tweets[i].username}
                </h4>
                 <p>
                    ${tweets[i].tweet}
                </p>`;
            document.getElementById("getalltweet").appendChild(eachtweet);
        }
    }, (error) => {
        console.log(error.message);
    });
}






socket.on("NEW_POST", (newPost) => {
    
    
    // console.log(newPost);
    
    let jsonRes = newPost;
    var eachtweet = document.createElement("li");
    eachtweet.innerHTML = `<h4>
    ${jsonRes.username}
    </h4>
    <p>
    ${jsonRes.tweet}
    </p>`;
    eachtweet.setAttribute('class','reverse')
    
    document.getElementById("mytweet").appendChild(eachtweet);
    
    
})


socket.on("MY_POST", (newPost) => {

    console.log("second socket chnage", newPost)
    console.log(newPost);

    let jsonRes = newPost;
    var eachtweet = document.createElement("li");
    eachtweet.innerHTML = `<h4>
    ${jsonRes.username}
    </h4>
     <p>
        ${jsonRes.tweet}
    </p>`;

    document.getElementById("getalltweet").appendChild(eachtweet);


})



//PROFILE

function profile() {
    axios({
        method: 'get',
        url: url + '/profile',
        credentials: 'include',
    }).then((response) => {
        document.getElementById('name').innerHTML = response.data.profile.name;
        document.getElementById('email').innerHTML = response.data.profile.email;
        document.getElementById('phone').innerHTML = response.data.profile.phone;
        document.getElementById("user-id").innerHTML = response.data.profile._id;
        document.getElementById("gender").innerHTML = response.data.profile.gender
        document.getElementById("profilePic").src = response.data.profile.profilePic;
        // console.log(response.data.profile.email);
        // console.log(response.data.profile.profilePic);
        // console.log(response);
        sessionStorage.setItem("userEmail", response.data.profile.email);
        sessionStorage.setItem("profileUrl", response.data.profile.profilePic);
    },
    (error) => {
        console.log(error.message);
    });

    return false
}


///LOGOUT


function logout() {
    axios({
        method: 'post',
        url: url + '/logout',
        credentials: 'include'
        
    }).then((response) => {
        console.log(response);
        window.location.href = "login.html"
    }, (error) => {
        console.log(error.message);
    });
    return false
}

// PROFILE PICTURE

// function upload() {

//     var fileInput = document.getElementById("fileInput");


//     let formData = new FormData();
//     console.log(formData)
//     formData.append("myFile", fileInput.files[0]); // file input is for browser only, use fs to read file in nodejs client
//     // formData.append("myFile", blob, "myFileNameAbc"); // you can also send file in Blob form (but you really dont need to covert a File into blob since it is Actually same, Blob is just a new implementation and nothing else, and most of the time (as of january 2021) when someone function says I accept Blob it means File or Blob) see: https://stackoverflow.com/questions/33855167/convert-data-file-to-blob
//     formData.append("myName", "malik"); // this is how you add some text data along with file
//     formData.append("myDetails",
//         JSON.stringify({
//             "email": sessionStorage.getItem("email"),   // this is how you send a json object along with file, you need to stringify (ofcourse you need to parse it back to JSON on server) your json Object since append method only allows either USVString or Blob(File is subclass of blob so File is also allowed)
//             "year": "2021"
//         })
//     );

//     // you may use any other library to send from-data request to server, I used axios for no specific reason, I used it just because I'm using it these days, earlier I was using npm request module but last week it get fully depricated, such a bad news.
//     axios({
//         method: 'post',
//         url: url + "/upload",
//         data: formData,
//         headers: { 'Content-Type': 'multipart/form-data' }
//     })
//     .then(res => {
//         var userData = res
//         console.log(res)
//         // console.log(sessionStorage)
//         // console.log(`upload Success`+ userData.toString());
//         alert(`Profile Photo uploaded Successfully`);
//         window.location.reload();
       
//         })
//         .catch(err => {
//             console.log(err);
//         })

//     return false; 

// }

const upload = () => {
    let fileInp = document.getElementById("fileInput");
    // console.log("fileInp", fileInp);
    // console.log("fileInp", fileInp.files[0]);
  
    let formData = new FormData();
  
    formData.append("myFile", fileInp.files[0]);
    formData.append("myName", "Hassan");
    formData.append(
      "myDetails",
      JSON.stringify({
        email: sessionStorage.getItem("userEmail"),
        class: "web",
      })
    );
    axios({
      method: "post",
      url: url + "/upload",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        // console.log("upload success", res.data);
        // console.log("photo url", res.data.url);
        // var img = document.createElement("img");
        // img.setAttribute("src", res.data.url);
        // img.setAttribute("width", "100");
        // img.setAttribute("height", "100");
        // img.setAttribute("alt", "user image");
        // document.getElementById("img").appendChild(img);
        // document.getElementById("userImg").src = res.data.url;
        // document.getElementById("fileInput").style.display = "none";
        // document.getElementById("uploadBtn").style.display = "none";
        window.location.reload();
        alert("Profile Picture updated Successfully");
      })
      .catch((err) => console.log(err));
    //   console.log(formData)
  
    return false;
  };

function previewFile() {
    const preview = document.querySelector('img');
    const file = document.querySelector('input[type=file]').files[0];
    const reader = new FileReader();

    reader.addEventListener("load", function () {
        // convert image file to base64 string
        preview.src = reader.result;
    }, false);

    if (file) {
        reader.readAsDataURL(file);
    }
    return false;
}