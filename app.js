// imports
const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const router = express.Router();
const bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

// Database Connection
const sequelize = new Sequelize("freedb_water-app-test","freedb_water-app-user","fF8mAee*NX$pmPB",{
    dialect: 'mysql',
    host: "sql.freedb.tech"
});

// Models
const User = sequelize.define('User',{
    'id' : {
        type : Sequelize.INTEGER,
        allowNull : false ,
        autoIncrement: true,
        primaryKey: true
    },
    'user-name' : {
        type : Sequelize.DataTypes.STRING,
        allowNull : false,
        unique : true  
    },
    'password' : {
        type : Sequelize.DataTypes.STRING,
        allowNull : false
    }
    ,
    'ssn' : {
        type : Sequelize.DataTypes.STRING,
        allowNull : false
    },
    'full-name' : {
        type : Sequelize.DataTypes.STRING,
        allowNull : false
    }
});

const Data = sequelize.define('Data',{
    'id' : {
        type : Sequelize.INTEGER,
        allowNull : false ,
        autoIncrement: true,
        primaryKey: true
    },
    'data' : {
        type : Sequelize.DataTypes.TEXT,
        allowNull : false
    },
});



// code
const app = express();
app.use(bodyParser.json());

router.post('/login',(req,resp,next) => {
    const userName = req.body.userName;
    const password = req.body.password;
    User.findOne({
        where : {
            'user-name' : userName
        }
    }).then(user => {
        if(!user){
            resp.json({
                code : 400,
                message : 'Username Incorrect!'
            });
        }
        bcryptjs.compare(password,user.password).then(doMatch => {
            if(doMatch){
                const token = jwt.sign(
                    {
                        user_id : user.id,
                        user_name : user.userName
                    },
                    'shoaaTestSecretMessage',
                    {
                        expiresIn : '1h'
                    }
                )
                return resp.json({
                    data : {
                        user_id : user.id,
                        user_ssn: user.ssn,
                        user_fullname : user.fullname
                    },
                    code : 200,
                    message : 'Login Successful',
                    token : token
                    
                });
            }
            else{
                return resp.json({
                    code : 400,
                    message : 'Password Incorrect!'
                });
            }
        })
    })
});

router.post('/send-data',(req,resp,next) => {
    const token = req.get('Authorization').split(' ')[1];
    let decodedToken ;
    try{
        decodedToken=jwt.verify(token,'shoaaTestSecretMessage');
    }catch(error){
        return resp.json({
            code : 400,
            message : 'Not Authenticated'
        });
    }
    Data.create({
        data : req.body.data
    }).then( createdData => {
        return resp.json({
            data : createdData,
            code : 200,
            message : 'data sent successfully'
        });
    })
});

app.use(router);

sequelize.sync().then(()=>{
    // create deafult user
    User.findAll().then(users => {
        if(!users.length){
            let password = '123456789';
            bcryptjs.hash(password,11).then( hashPassword => {
                User.create({
                    'user-name' : 'aboraya',
                    'password': hashPassword,
                    'ssn' : '1234567898765432',
                    'full-name' : 'mostafa abo raya'
                })
            });
        }
    });
    var server_port = process.env.YOUR_PORT || process.env.PORT || 5000;
    let server = app.listen(server_port);
});
