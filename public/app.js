///SignUP

const url = "http://localhost:5000"

var socket = io(url);

socket.on('connect', function () {
    console.log("connected")
});

function signup() {


    axios({
            method: 'post',
            url: url + "/signup",
            data: {
                userName: document.getElementById("name").value,
                userEmail: document.getElementById("email").value,
                userPassword: document.getElementById("password").value,
                userPhone: document.getElementById("phone").value


            }

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
        } //, withCredentials: true

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
        }
        // withCredentials: true
    }).then((response) => {
        if (response.data.status === 200) {
            console.log(response.data.message);
            alert(response.data.message);
            window.location.href = "forget2.html"
        } else {
            alert(response.data.message)
        }
    }, (error) => {
        console.log(error);
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
        }
    }).then((response) => {

        console.log(response.data.message);
        alert(response.data.message);
        window.location.href = "login.html"


    }, (error) => {
        console.log(error);
    });
    return false;

}

//PROFILE

function profile() {
    axios({
        method: 'get',
        url: url + '/profile',
        credentials: 'include',
    }).then((response) => {
        console.log(response);
        document.getElementById('name').innerHTML = response.data.profile.name
        document.getElementById('email').innerHTML = response.data.profile.email
    }, (error) => {
        console.log(error.message);
    });
    return false
}


//POST

function tweetpost() {
    axios({
        method: 'post',
        url: url + "/tweet",
        data: {
            tweet: document.getElementById("your-post").value,
        },
        withCredentials: true
    }).then((response) => {
        if (response.data.status === 200) {
            alert(response.data.message)
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
    getProfile();
    axios({
        method: 'get',
        url: url + '/tweet-get',
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
            eachtweet.setAttribute('class','reverse')
            document.getElementById("mytweet").appendChild(eachtweet);
        }
    }, (error) => {
        console.log(error.message);
    });


    return false
}

socket.on("NEW_POST", (newPost) => {


    console.log(newPost);

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


///LOGOUT


function logout() {
    axios({
        method: 'post',
        url: url + '/logout',
      
    }).then((response) => {
        console.log(response);
        window.location.href = "./login.html"
    }, (error) => {
        console.log(error.message);
    });
    return false
}