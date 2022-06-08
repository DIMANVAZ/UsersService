const express = require('express');
const exP = express();
const adminLogica = require('./adminLogica.js');
const port = process.env.PORT || 3000;
exP.listen(port,()=>{console.log(`server's listening on port ${port}`)});

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
        adminLogica(req, res, next);
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
        res.render('adminPanel');
    }
})

// пропускной шлюз - логин или регистрация
exP.post('/pass',(req,res) => {
    /*  1. Если адреса почты в БД нет - записываем как нового юзера.
           Отправляем приветственное письмо (+ на экране покажэм уведомление).
        2. Если адрес в БД есть - сравниваем пароль.
           Совпало - шлём на Notes юзера (т.е. выкачиваем именную таблицу)
           Не совпало - на экране покажэм уведомление - переменная notification.
           */

    if (req.body.password === 'user'){
        res.redirect(301,'http://localhost:4000/notes');
    }
    else res.render('notification',{notification:'Неверный пароль!',color:'red'})
})