const express = require('express');
const exP = express();
const {User} = require('./usersDB/dbConnector.js');
const bcrypt = require('bcrypt');
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

exP.get('/logon',(req,res) => {
    res.render('logon');
})

//мидл-варя - для одминов и логина. Все "левые" адреса переправляет на окно логина
const adminWays = ['/adminLogon','/adminPanel'];
const realWays = ['/pass'];
exP.use((req,res, next) => {
    const url = req.originalUrl;
    if(adminWays.includes(url)) {
        next();
    } else if (realWays.includes(url)){
        next();
    }
    else res.render('logon');
})

exP.get('/adminLogon',(req,res) => {
    res.render('adminLogon');
})

exP.post('/adminPanel',(req,res) => {
    if (req.body.password === 'admin'){
        //localStorage.setItem('UsersService','adminIsHere');
        res.render('adminPanel');
    }
})

exP.get('/adminPanel',(req,res) => {
    res.redirect(301, '/adminLogon');
})



// пропускной шлюз - логин или регистрация
exP.post('/pass',(request,response) => {
    /*  1. Если адреса почты в БД нет - записываем как нового юзера.
           Отправляем приветственное письмо (+ на экране покажэм уведомление).
        2. Если адрес в БД есть - сравниваем пароль.
           Совпало - шлём на Notes юзера (т.е. выкачиваем именную таблицу)
           Не совпало - на экране покажэм уведомление - переменная notification.

           */
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