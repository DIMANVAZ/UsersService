const express = require('express');
const exP = express();
const {User} = require('./usersDB/dbConnector.js');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const port = process.env.PORT || 3000;

(()=>{
    try{
        exP.listen(port,()=>{console.log(`server's listening on port ${port}`)});
    }
    catch (e) {
        console.log(e)
    }
})()

exP.use(express.static('public'));
exP.use(express.urlencoded({extended:false}));
exP.use(express.json());
exP.set('view engine','pug');
exP.use(cookieParser());

exP.get('/userLogon',(req,res) => {
    res.render('userLogon');
})

//мидл-варя - для одминов, логина и удалений. Все "левые" адреса переправляет на окно логина
const delRoutes = /\/delete\/.+/gm;
const realWays = ['/adminLogon','/adminPanel', '/pass', delRoutes ];

exP.use((req,res, next) => {
    const url = req.originalUrl;
    let match = false;

    realWays.forEach(el => {
        if(el === url || url.search(el) >-1){
            match = true;
            next();
        }
    })
    if(!match){
        res.render('userLogon')
    }
})

function doAdminPanel(res){
    User.findAll().then(data => {
        res.render('adminPanel', {data})
    });
}

exP.get('/adminLogon',(req,res) => {
    if(req.cookies?.admin && req.cookies.admin === 'true'){
        doAdminPanel(res);
    }
    else res.render('adminLogon');
})

exP.post('/adminPanel',(req,res) => {
    if (req.body.password === 'admin'){
        res.setHeader('Set-Cookie', 'admin=true');
        doAdminPanel(res);
    } else res.redirect(301, '/adminLogon');
})

exP.get('/adminPanel',(req,res) => {
    if(req.cookies?.admin && req.cookies.admin === 'true'){
        doAdminPanel(res);
    }
    else res.redirect(301, '/adminLogon');
})

// пропускной шлюз - логин или регистрация
exP.post('/pass',(request,response) => {
    /*  1. Если адреса почты в БД нет - записываем как нового юзера.
           Отправляем приветственное письмо (+ на экране покажэм уведомление).
        2. Если адрес в БД есть - сравниваем пароль.
           Совпало - шлём на Notes юзера (т.е. выкачиваем именную таблицу)
           Не совпало - на экране покажэм уведомление - переменная notification.  */
    const userEmail = request.body.email;
    const nakedPass = request.body.password;
    const passHash = bcrypt.hashSync(nakedPass, 5);

    User.findAll({
        where: {
            email: userEmail
        }
    }).then(async res => {
        // юзера с такой почтой нет - создаём!
        if (![...res].length) {
            console.log('No such user!');
            await User.create({email: userEmail, passHash: passHash});
            response.render('notification',{notification:'Вы зарегистрированы!',color:'green'})
        } else {
            // юзер есть - сравниваем пароли!
            const hashFromDB = res[0].passHash.trim();

            if(bcrypt.compareSync(nakedPass, hashFromDB)){
                response.render('notification',{notification:'Пароль верный!',color:'green'})
            }else {
                response.render('notification',{notification:'Пароль НЕверный!',color:'red'})
            }
        }
    }).catch(e => console.log(e));

})

console.log(process.env.SECRET_KEY)

