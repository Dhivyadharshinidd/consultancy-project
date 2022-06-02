const express = require('express');
const app = express();
const User = require('./models/user');
const Detail = require('./models/detail');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const flash = require('connect-flash');
const methodOverride = require('method-override');

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





app.get('/login', (req, res) => {
    res.render('login')
})
app.get('/failure', (req, res) => {
    res.render('failure')
})


app.get('/index', (req, res) => {
    res.render('index')
})
app.get('/electricalrepair', (req, res) => {
    res.render('electricalrepair');
})
app.get('/remodelling', (req, res) => {
    res.render('remodelling');
})

app.get('/generators', (req, res) => {
    res.render('generators');
})

app.get('/panelupgrades', (req, res) => {
    res.render('panelupgrades');
})
app.get('/automation', (req, res) => {
    res.render('automation');
})
app.get('/lighting', (req, res) => {
    res.render('lighting');
})
app.get('/security', (req, res) => {
    res.render('security');
})
app.get('/homeinspection', (req, res) => {
    res.render('homeinspection');
})
// app.post('/electricalrepair', async (req, res) => {
//     res.render('electricalrepair');
// })
app.get('/schedule', (req, res) => {
    res.render('schedule');
})
app.post('/schedule',async(req,res)=>{
    const detail = new Detail(req.body);
    await detail.save();
    res.redirect('adminview');
})
app.get('/adminview', (req, res) => {
    res.render('adminview');
})
// app.post('/adminview ', async function (req, res) {

//     const details = new Details(req.body);
//     await details.save();
    

// })
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
                    res.redirect('/item');
                }
            } else {
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