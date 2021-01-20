var express = require("express");
var bcrypt = require("bcrypt-inzi")
var jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken
var { userModel, otpModel } = require("../dbrepo/models"); // problem was here, notice two dots instead of one
var postmark = require("postmark");
var { SERVER_SECRET } = require("../core/index");
var emailApi = process.env.EMAIL_API;
var api = express.Router();


//******* SIGNUP ********//


api.post("/signup", (req, res, next) => {

    if (!req.body.name
        || !req.body.email
        || !req.body.password
        || !req.body.phone
        || !req.body.gender
    ) {

        res.status(403).send(`
            please send name, email, password, phone and gender in json body.
            e.g:
            {
                "name": "farooqi",
                "email": "farooq@gmail.com",
                "password": "12345",
                "phone": "03332765421",
                "gender": "male",
                
            }`)
        return;
    }
    userModel.findOne({ email: req.body.email },
        function (err, doc) {
            if (!err && !doc) {

                bcrypt.stringToHash(req.body.password).then(function (hash) {

                    var newUser = new userModel({
                        "name": req.body.name,
                        "email": req.body.email,
                        "password": hash,
                        "phone": req.body.phone,
                        "gender": req.body.gender,
                    })
                    newUser.save((err, data) => {
                        if (!err) {
                            res.send({
                                message: "user created"
                            })
                        } else {
                            console.log(err);
                            res.status(500).send({
                                message: "user create error, " + err
                            })
                        }
                    });
                })

            } else if (err) {
                res.status(500).send({
                    message: "db error"
                })
            } else {
                res.send({
                    message: "User already exist ",
                    status: 409
                })
            }
        })

})




//LOGIN

api.post("/login", (req, res, next) => {

    if (!req.body.email || !req.body.password) {

        res.status(403).send(`
                please send email and password in json body.
                e.g:
                {
                    "email": "malikasinger@gmail.com",
                    "password": "abc",
                }`)
        return;
    }

    userModel.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            res.status(500).send({
                message: "an error Occured: " + JSON.stringify(err)
            });
        } else if (user) {

            bcrypt.varifyHash(req.body.password, user.password).then(isMatched => {
                if (isMatched) {
                    console.log("matched");

                    var token =
                        jwt.sign({
                            id: user._id,
                            name: user.name,
                            email: user.email,
                        }, SERVER_SECRET)

                    res.cookie('jToken', token, {
                        maxAge: 86_400_000,
                        httpOnly: true
                    });

                    res.send({
                        message: "login success",
                        user: {
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            gender: user.gender,
                        }
                    });

                } else {
                    console.log("Password not matched");
                    res.status(401).send({
                        message: "incorrect password"
                    })
                }
            }).catch(e => {
                console.log("errorhello: ", e)
            })

        } else {
            res.status(403).send({
                message: "user not found"
            });
        }
    });

})

//LOGOUT



api.post("/logout", (req, res, next) => {
    res.cookie('jToken', "", {
        maxAge: 86_400_000,
        httpOnly: true
    });
    res.send("logout success");
})



//FORGOT PASSWORD



api.post("/forget-password", (req, res, next) => {

    if (!req.body.email) {

        res.status(403).send(`
            please send email in json body.
            e.g:
            {
                "email": "example@gmail.com"
            }`)
    }

    userModel.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            res.status(500).send({
                message: "an error ocurred: " + JSON.stringify(err)
            })
        } else if (user) {
            const otp = Math.floor(getRandomArbitrary(11111, 99999))

            otpModel.create({
                email: req.body.email,
                otpCode: otp
            }).then((doc) => {

                // client.sendEmail({
                //     "From": "postmark email",
                //     "To": req.body.email,
                //     "Subject": "Reset your password",
                //     "TextBody": `Here is your password reset code: ${otp}`
                // }).then((status) => {

                // console.log("status: ", status);
                //     res.send({
                //         message: "Email Send OPT",
                //         status: 200
                //     })

                // })
                console.log("your OTP: ", otp);
                res.send({
                    message: "Email Send OPT",
                    status: 200
                });


            }).catch((err) => {
                console.log("error in creating otp: ", err);
                res.status(500).send("unexpected error ")
            })


        } else {
            res.status(403).send({
                message: "user not found"
            });
        }
    });
})

api.post("/forget-password-step-2", (req, res, next) => {

    if (!req.body.email && !req.body.otp && !req.body.newPassword) {

        res.status(403).send(`
            please send email & otp in json body.
            e.g:
            {
                "email": "farooqi@gmail.com",
                "newPassword": "******",
                "otp": "#####" 
            }`)
        return;
    }

    userModel.findOne({
        email: req.body.email
    },
        function (err, user) {
            if (err) {
                res.status(500).send({
                    message: "an error occurred: " + JSON.stringify(err)
                });
            } else if (user) {

                otpModel.find({
                    email: req.body.email
                },
                    function (err, otpData) {



                        if (err) {
                            res.status(500).send({
                                message: "an error occurred: " + JSON.stringify(err)
                            });
                        } else if (otpData) {
                            otpData = otpData[otpData.length - 1]

                            console.log("otpData: ", otpData);

                            const now = new Date().getTime();
                            const otpIat = new Date(otpData.createdOn).getTime(); // 2021-01-06T13:08:33.657+0000
                            const diff = now - otpIat; // 300000 5 minute

                            console.log("diff: ", diff);

                            if (otpData.otpCode === req.body.otp && diff < 300000) { // correct otp code
                                otpData.remove()

                                bcrypt.stringToHash(req.body.newPassword).then(function (hash) {
                                    user.update({
                                        password: hash
                                    }, {}, function (err, data) {
                                        res.send({
                                            message: "Your password has been changed"
                                        });
                                    })
                                })

                            } else {
                                res.status(401).send({
                                    message: "incorrect otp"
                                });
                            }
                        } else {
                            res.status(401).send({
                                message: "incorrect otp"
                            });
                        }
                    })

            } else {
                res.status(403).send({
                    message: "user not found"
                });
            }
        });
})


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
module.exports = api;
