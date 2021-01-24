const PORT = process.env.PORT || 5000;

var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require("cors");
var morgan = require("morgan");
var jwt = require('jsonwebtoken');
var http = require("http");
var socketIO = require('socket.io');
const path = require("path");
const mongoose = require("mongoose");
var bcrypt = require("bcrypt-inzi");
var postmark = require("postmark");
const axios = require('axios')
const fs = require('fs')
const multer = require('multer')
var app = express();
var server = http.createServer(app);
var authRoutes = require("./routes/auth");
// var client = new postmark.Client("postmark token");

var {SERVER_SECRET} = require("./core/index")

var io = socketIO(server);
io.on("connection", (user) => {
    console.log("user connected");
})
var { userModel, tweetModel} = require("./dbrepo/models")


const storage = multer.diskStorage({ // https://www.npmjs.com/package/multer#diskstorage
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.filename}.${file.mimetype.split("/")[1]}`)
    }
})
var upload = multer({ storage: storage })

const admin = require("firebase-admin");
// https://firebase.google.com/docs/storage/admin/start
var serviceAccount = { // create service account from here: https://console.firebase.google.com/u/0/project/delete-this-1329/settings/serviceaccounts/adminsdk
    "type": "service_account",
  "project_id": "pyt-app-6243a",
  "private_key_id": "f9f4c13b5511ea569cf7e8d7e666e140624d911a",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxet14pfmrNVPd\n1I3SM1jyhiLzuvzCUdB0IpRDTvFhVIZQcslhhEcZOLanMgA9RQBgeEKf+KWS/afx\nn/DfYFHT6zh2DSCDbptE1aTATkz9s9lnZgwhO6Da+bmxoyEs7W9jzGGv2WSm3g0c\nIMTA+lGF45X6VGki4bRrEJkKI41OfUuWXFYDHNvHBPq4uUCilHafknp8v5ti1KVM\nI6PKFhiCXkMsRFY6UNXxt8V/rOeRLMoUiSwKbyYzJZtl4rjoL6XK2u8+cnRO7cOU\nemllxpofF5gqw2xuQXQFd1k1+GZ4LC2rvXtt/jJr0Fub7df2Q7G5TyJFzigQ/mpV\nYR49TUl5AgMBAAECggEAQ295Vl3OS1jkaG3ag0uCWQhRoIVkg9s9VttKtXZ57e8F\nZ+ztirGNqE4tzMKJZ75focggHJOIKh1aYktQ5Tc+cES4e9aKC5aLxbBdvLojs+RR\nz2Fta3UyLfHkNlRTBzSideuTFJOIFIVbutvSlramIjby5h6LojbbbDDuzXTrvK3p\neTFXpk0rUQCOlMVq4VDpoQLwVqt3jDq/r36EpP1CPOYqJYMz8IREsGEn589j6XG+\nzCNONXcmFK9r3CXtV+wR3yoszGALDep4LBbCowJWk8xydXMpCfL5K94M1kOSw3qS\nHOF1ZPc+T28yXvP+9tBel0c0ZtFjjeaQU6gj3pT7pwKBgQDm73geZn70hhJwlisV\nj3I6VRU96Iqv/XvsB/fkd7/RUhC++py9UCexxQxAh5wlKtSRyGC5zyCIyp6qcRDJ\n1Ty10h+gJfIonYz/u2FAte1eGen4PtcbCUYcr2mB1ldCq6TKYHLd21ZlqHpFZ3Lc\nI1wmtqeKBb2Mg+8N+tkycdE7+wKBgQDEviM5EfSJM2OELzCqXuXmWMNTVW5JoqAo\nnflhuQJpmy9g7MQ9QwCwx4mA4LHg2OIcHq0NBxAidygAFAdZ+jcITZtnX2MJv76n\n7kQ7X8TSVdF5BW2GAPpiQsVMygNWxOcFdZRgFK/go3jGcTF767+/ht0zWMv57Z+i\nkTVJPgwCGwKBgBAKQgWaiObjCRTY2VU+CWkTz83lAP0IVjsmsokj6CbZ1F/veEON\n9bPbQ+aXhLjwKKOXj2BYiqH1sN+Vyty5+uWGGrw85nz7tHduxGqCOGJ42k9rzfUK\nx9vmMyXZhWYUFfYYjOHsAiw9b4Cylr/DlPr7ZNepXmkMIOaPrdZbIXVRAoGAI31h\nATR59h3s/7U7hCAmPI0afvfUMzhAx9LnX3duNfqma0eKhrqFb14vMa5WqAa3kvb9\npHH3uR/heVIjmVmHf9nwBI+yX9nU3JogeM1nxcFxTfFqtleK0xrUWGvAenB+c/+n\nykUxDMawTKuyj3YRWs1LLa4A7Y6t0zd6c0HcDK0CgYEAt2w/Z/VimqzqRObLi8Kp\naokZUIfRg9F+FxVA9O2Am98wYE9VelSMc9O4Ve5IolK8FMK67YhhZeY7oTnxWngb\ndmmXPMGnVdykh4alJfdHFpPlJKFTF/1w03v59e65oSU3ODy8A+xuevTn9tePa1UR\nECeaA/NTFUrmIpqZ7ICmTfE=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-gk9rb@pyt-app-6243a.iam.gserviceaccount.com",
  "client_id": "112560933850237758397",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-gk9rb%40pyt-app-6243a.iam.gserviceaccount.com"
};
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pyt-app-6243a-default-rtdb.firebaseio.com/"
});
const bucket = admin.storage().bucket("gs://pyt-app-6243a.appspot.com");



app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(morgan('dev'));
app.use("/", express.static(path.resolve(path.join(__dirname, "public"))));
app.use('/', authRoutes)





app.use(function (req, res, next) {

    console.log("req.cookies: ", req.cookies);
    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        if (!err) {

            const issueDate = decodedData.iat * 1000;
            const nowDate = new Date().getTime();
            const diff = nowDate - issueDate; 
        

            if (diff > 30000000) { // expire after 5 min (in milis)
                res.status(401).send("token expired")
                console.log(res)
                alert(res)
            } else { 
                var token = jwt.sign({
                    id: decodedData.id,
                    name: decodedData.name,
                    email: decodedData.email,
                    phone: decodedData.phone,
                    gender: decodedData.gender,
                }, SERVER_SECRET)
                res.cookie('jToken', token, {
                    maxAge: 86_400_000,
                    httpOnly: true
                });
                req.body.jToken = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})

//PROFILE

app.get("/profile", (req, res, next) => {
    console.log(req.body);

    userModel.findById(req.body.jToken.id, 'name email phone gender profilePic createdOn', function (err, doc) {
        if (!err) {
            res.send({
                profile: doc
            })

        } else {
            res.send({
                message: "Server Error",
                status: 500
            });
        }
    });
})

//POST

app.post("/tweet", (req, res, next) => {
   

    if (!req.body.jToken.id || !req.body.tweet) {
        res.send({
            status: 401,
            message: "Please write tweet"
        })
    }
    userModel.findById(req.body.jToken.id, 'name tweet ProfilePic', function (err, user) {
        if (!err) {
            tweetModel.create({
                "username": user.name,
                "email": req.body.email,
                "tweet": req.body.tweet,
                "profilePic": user.profilePic
            }, function (err, data) {
                if (err) {
                    res.send({
                        message: "Tweet DB ERROR",
                        status: 404
                    });
                }
                else if (data) {
                    console.log("data checking Tweeter: ", data);
                    res.send({
                        message: "Your Tweet Send",
                        status: 200,
                        tweet: data,
                        profilePic: user.profilePic
                    });
                    
                    
                    io.emit("NEW_POST", data);
                    
                
                    console.log("server checking code tweet ", data.tweet)
                } else {
                    res.send({
                        message: "Tweets posting error try again later",
                        status: 500
                    });
                }
            });

        } else {
            res.send({
                message: "User Not Found",
                status: 404
            });
        }
    });


});

app.get("/userTweets", (req, res) => {
    console.log("my tweets user", req.body);
    
    
    tweetModel.find({email: req.body.jToken.email}, (err, data) => {
        if (!err) {
            console.log("user email", req.body.jToken.email)
        
        console.log("current user tweets==>", data );
        res.send({
          tweet: data,
        });
      } else {
        console.log("error: ", err);
        res.status(500).send({});
      }
    });
  });

app.get("/tweet-get", (req, res, next) => {
    tweetModel.find({}, function (err, data) {
        if (err) {
            res.send({
                message: "Error :" + err,
                status: 404
            });
        } else if (data) {
            res.send({
                tweet: data,
                status: 200
            });
        } else {
            res.send({
                message: "User Not Found"
            });
        }
    });
});


//PROFILE PICTURE 


app.post("/upload", upload.any(), (req, res, next) => {
    console.log("req.body: ", JSON.parse(req.body.myDetails));
    let userEmail = JSON.parse(req.body.myDetails)
    // console.log("req.email: ", req.body.myDetails);
    console.log("req.files: ", req.files);
  
    console.log("uploaded file name: ", req.files[0].originalname);
    console.log("file type: ", req.files[0].mimetype);
    console.log("file name in server folders: ", req.files[0].filename);
    console.log("file path in server folders: ", req.files[0].path);
  
    bucket.upload(
      req.files[0].path,
      // {
      //     destination: `${new Date().getTime()}-new-image.png`, // give destination name if you want to give a certain name to file in bucket, include date to make name unique otherwise it will replace previous file with the same name
      // },
      function (err, file, apiResponse) {
        if (!err) {
          // console.log("api resp: ", apiResponse);
  
          // https://googleapis.dev/nodejs/storage/latest/Bucket.html#getSignedUrl
          file
            .getSignedUrl({
              action: "read",
              expires: "03-09-2491",
            })
            .then((urlData, err) => {
              if (!err) {
                console.log("public downloadable url: ", urlData[0]); // this is public downloadable url
                userModel.findOne(
                  { email: userEmail.email },
                  (err, data) => {
                    if (!err) {
                      console.log("user data ====>", data);
                      tweetModel.updateMany({email:userEmail.email},{profilePic:urlData[0]},(err,tweet)=>{
                        if(!err){
                          console.log("tweet model updated");
                        }
                      })
                    } else {
                      console.log("user not found");
                    }
                        data.update(
                      { profilePic: urlData[0] },
                      
                      (err, updatedUrl) => {
                        if (!err) {
                          res.status(200).send({
                            message: "profile picture updated succesfully",
                            url: urlData[0],
                          });
                        } else {
                          res.status(500).send({
                            message: "an error occured",
                          });
                        }
                      }
                    );
                    
                    
                    
                  }
                );
  
                // // delete file from folder before sending response back to client (optional but recommended)
                // // optional because it is gonna delete automatically sooner or later
                // // recommended because you may run out of space if you dont do so, and if your files are sensitive it is simply not safe in server folder
                // try {
                //     fs.unlinkSync(req.files[0].path)
                //     //file removed
                // } catch (err) {
                //     console.error(err)
                // }
                // res.send({
                //   message: "ok",
                //   url: urlData[0],
                // });
              }
            });
        } else {
          console.log("err: ", err);
          res.status(500).send();
        }
      }
    );
  });

 
//SERVER

server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})
