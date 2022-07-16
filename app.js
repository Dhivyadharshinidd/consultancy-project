const express = require('express');
const app = express();
const User = require('./models/user');
const Detail = require('./models/detail');
const Confirm = require('./models/confirm');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const https = require('https');
const session = require('express-session');
const path = require('path');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const Nexmo = require('nexmo');
const nodemailer = require('nodemailer');
const checksum_lib = require("./Paytm/checksum");
const config = require("./Paytm/config");
mongoose.connect('mongodb://localhost:27017/consultancy_login', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO!! MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })




app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'notagoodsecret' }))
app.use(flash());
app.use(express.json())
app.use(methodOverride('_method'));
app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {

    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        const user = new User({ username, password })
        await user.save();
        req.session.user_id = user._id;
        res.redirect('/');
    }
    else {
        req.flash('error', "All fields required");
        res.redirect('/register')
    }
})
// app.get("/paynow", async(req, res)=>{
//     if (!req.session.user_id) {
//         res.redirect('login')
//     } else {
//         const id = req.session.user_id;

//         const detail = await Detail.findOne({ userid: id });
//         res.render('payment',{detail});
//     }
// })

app.post("/paynow", (req, res) => {
    // Route for making payment

    var paymentDetails = {

        amount: req.body.price,
        customerId: req.body.firstname,
        customerEmail: req.body.email,
        customerPhone: req.body.mobilenumber
    }
    if (!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
        res.status(400).send('Payment failed')
    } else {
        var params = {};
        params['MID'] = config.PaytmConfig.mid;
        params['WEBSITE'] = config.PaytmConfig.website;
        params['CHANNEL_ID'] = 'WEB';
        params['INDUSTRY_TYPE_ID'] = 'Retail';
        params['ORDER_ID'] = 'TEST_' + new Date().getTime();
        params['CUST_ID'] = paymentDetails.customerId;
        params['TXN_AMOUNT'] = paymentDetails.amount;
        params['CALLBACK_URL'] = 'http://localhost:3000/callback';
        params['EMAIL'] = paymentDetails.customerEmail;
        params['MOBILE_NO'] = paymentDetails.customerPhone;


        checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
            var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
            // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

            var form_fields = "";
            for (var x in params) {
                form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
            }
            form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
            res.end();
        });
    }
});
app.post("/callback", (req, res) => {
    // Route for verifiying payment

    var body = '';

    req.on('data', function (data) {
        body += data;
    });

    req.on('end', function () {
        var html = "";
        var post_data = qs.parse(body);

        // received params in callback
        console.log('Callback Response: ', post_data, "\n");


        // verify the checksum
        var checksumhash = post_data.CHECKSUMHASH;
        // delete post_data.CHECKSUMHASH;
        var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
        console.log("Checksum Result => ", result, "\n");


        // Send Server-to-Server request to verify Order Status
        var params = { "MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID };

        checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {

            params.CHECKSUMHASH = checksum;
            post_data = 'JsonData=' + JSON.stringify(params);

            var options = {
                hostname: 'securegw-stage.paytm.in', // for staging
                // hostname: 'securegw.paytm.in', // for production
                port: 443,
                path: '/merchant-status/getTxnStatus',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': post_data.length
                }
            };


            // Set up the request
            var response = "";
            var post_req = https.request(options, function (post_res) {
                post_res.on('data', function (chunk) {
                    response += chunk;
                });

                post_res.on('end', function () {
                    console.log('S2S Response: ', response, "\n");

                    var _result = JSON.parse(response);
                    if (_result.STATUS == 'TXN_SUCCESS') {
                        res.send('payment sucess')
                    } else {
                        res.send('payment failed')
                    }
                });
            });

            // post the data
            post_req.write(post_data);
            post_req.end();
        });
    });
});
app.get('/login', (req, res) => {
    res.render('login')
})



app.get('/failure', (req, res) => {
    res.render('failure')
})

app.get('/index', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('login')
    }
    else {

        res.render('index')

    }
})
app.get('/electricalrepair', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('login')
    } else {
        // var transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: 'dhivyadharshinit.19it@kongu.edu',
        //         pass: 'bharathi1508'
        //     },
        //     tls:{
        //         rejectUnauthorized:false
        //     }
        // });


        // var mailOptions = {
        //     from: 'dhivyadharshinit.19it@kongu.edu',
        //     to: '19itr019@gmail.com',
        //     subject: 'Sending Email using Node.js',
        //     text: 'That was easy!'
        // };
        // console.log(mailOptions);
        // transporter.sendMail(mailOptions, function (error, info) {
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         console.log('Email sent: ' + info.response);
        //     }
        // });
        res.render('electricalrepair');
    }

})
app.get('/remodelling', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('login')
    } else {
        res.render('remodelling');
    }
})

app.get('/generators', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('login')
    } else {
        res.render('generators');
    }
})

app.get('/panelupgrades', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('login')
    } else {
        res.render('panelupgrades');
    }
})
app.get('/automation', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('login')
    } else {
        res.render('automation');
    }
})
app.get('/lighting', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('login')
    } else {
        res.render('lighting');
    }
})
app.get('/security', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('login')
    } else {
        res.render('security');
    }
})
app.get('/homeinspection', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('login')
    } else {
        res.render('homeinspection');
    }
})

// app.post('/electricalrepair', async (req, res) => {
//     res.render('electricalrepair');
// })

app.get('/schedule', async (req, res) => {
    if (!req.session.user_id) {
        res.redirect('login')
    } else {
        const id = req.session.user_id;
        const user = await User.findOne({ _id: id });
        res.render('schedule', { user });
    }
})
app.post('/schedule', async (req, res) => {

    const detail = new Detail(req.body);
    await detail.save();

    
    res.render('payment',{detail});
})

app.post('/confirm', async (req, res) => {

    const confirm = new Confirm(req.body);
    await confirm.save();
    var timeslot = req.body.timeslot;
    var date = req.body.date;
    var mobilenumber = req.body.mobilenumber;
    const nexmo = new Nexmo({
        apiKey: '0176df95',
        apiSecret: 'zziZzzlCYN2bgnsG',
    });

    const from = "Vonage APIs";
    const to = "+918903604773";
    const text = `Scheduled Date has been updated to ${date} and time has been updated ${timeslot}`;

    var result = nexmo.message.sendSms(from, to, text);

    console.log(result);

    res.redirect('/adminview');
})
app.get('/adminview', async (req, res) => {
    if (!req.session.user_id) {
        res.redirect('login')
    } else {
        const details = await Detail.find({});
        console.log(details);

        res.render('adminview/index', { details });
    }
})
app.get('/mystatus', async (req, res) => {
    if (!req.session.user_id) {
        res.redirect('login')
    } else {
        const id = req.session.user_id;

        const details = await Detail.findOne({ userid: id });

        console.log(details);
        const confirm = await Confirm.findOne({ userid: id });

        res.render('mystatus', { details, confirm });
    }
})
app.get('/adminview/:id', async (req, res) => {
    if (!req.session.user_id) {
        res.redirect('login')
    } else {
        const { id } = req.params;
        const detail = await Detail.findById(id);
        console.log(detail);


        res.render('adminview/confirmationpage', { detail });




    }

})
app.post('/adminview ', async function (req, res) {
    const details = new Details(req.body);
    await details.save();

})
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        const foundUser = await User.findAndValidate(username, password);
        if (foundUser) {
            req.session.user_id = foundUser._id;
            console.log(req.session);
            if (username === "Admin") {
                if (!req.session.user_id) {
                    res.redirect('/login');
                } else {
                    res.redirect('/adminview');
                }
            }
            else {
                if (!req.session.user_id) {
                    //req.flash('error', "Username or password is incorrect");
                    res.redirect('/failure');
                } else {
                    res.redirect('/index');
                }
            }
        }
        else {
            //req.flash('error', "Username or password is incorrect");
            res.redirect('/failure');
        }
    } else {
        res.redirect('/failure');
    }
})

app.get('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/login');
})

app.listen(3000, () => {
    console.log("SERVING YOUR APP!(listening at port 3000!!)")
})