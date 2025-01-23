const express = require('express')
const port = 3000
const app = express()
const body = require('body-parser')
const db = require('./connection')
const bcrypt = require('bcrypt')
const ResponseServerError = require('./controller/responseServerError')
const ResponseMessageServer = require('./controller/responseMessage')
const jwt = require('jsonwebtoken')

app.use(body.json())

db.connect(err=> {
    if (err) {
        console.log(err.message)
    } else {
        console.log('Connected')
    }
})

const validationAccess = (req, res, next) =>{
    const {authorization} = req.headers
}

app.get('/', (req, res) =>{
    res.json({
        'message': 'Welcome To ToDo List App'
    })
})

// LOGIN/REGIST AUTHENTICATION
app.post('/register', async (req, res)=> {
    const { name, email, password  } = req.body
    if ( !name || !email || !password ) {
        res.status(400).json({
            'message': 'Validasi gagal nama, email, ataupun password tidak boleh kosong'
        })
    } else {
        const salt = await bcrypt.genSalt()
        const password_hashed = await bcrypt.hash(password, salt)
        db.query(`SELECT email FROM users_tbl WHERE email = '${email}'`, (err, fields) =>{
            if (err) {
                ResponseServerError(err, res)
            }
            if (fields.rowCount === 0 ){
                db.query((`INSERT INTO users_tbl (name, email, password_hash) VALUES ('${name}', '${email}', '${password_hashed}')`), (err, fields) =>{
                    if (err) {
                        ResponseServerError(err, res)
                    } else{
                        res.status(201).json({
                            'message': 'Registrasi akun barumu berhasil dibuat.'
                        })
                    }
                })
            } else {
                res.status(403).json({
                    "message" : "Email telah digunakan, Coba untuk gunakan alamat email yang lain."
                })
            }
        })
    }
})

app.post('/login', (req, res) => {
    const { email, password } = req.body
    if (!email || !password ) {
        res.status(400).json({
            'message': 'Validasi gagal email atau password tidak boleh kosong'
        })
    } else {
        db.query(`SELECT user_id, email, password_hash FROM users_tbl WHERE email = '${email}'`, async (err, fields)=>{
            if (err) {
                ResponseServerError(err, res)
            } else {
                if (fields.rowCount === 0){
                    res.status(403).json({
                        "message": "Email tidak terdaftar, mohon untuk melakukan registrasi terlebih dahulu"
                    })
                } else {
                    const datas = fields.rows[0]
                    const data = {
                        "user_id" : datas.user_id,
                        "email": datas.email
                    }
                    if ( await bcrypt.compare(password, datas.password_hash)) {
                        const accessToken = jwt.sign(data, process.env.SECRET_TOKEN, {expiresIn: 60*2})
                        res.status(200).json({
                            "message": "Login berhasil",
                            "datas" : data,
                            "accessToken": accessToken
                        })
                        
                    } else {
                        res.status(403).json({
                            "message": "Password salah, harap masukkan password dengan benar."
                        })
                    }
                }
            }
        })
    }
})



// RETRIEVE DATA TODO
app.get('/todos', validationAccess, (req,res) =>{
    const {userId} = req.headers 
    db.query(`SELECT * FROM todos_tbl WHERE user_id = ${userId}`, (err, fields) =>{
        if (err) {
            res.status(500).json({
                "error": err.message
            })
        }
    })
})  

app.post('/todos', (req,res) =>{
    const {userId} = req.headers 
    db.query(`SELECT * FROM todos_tbl WHERE user_id = ${userId}`, (err, fields) =>{
        if (err) {
            ResponseServerError(err, res)
        }
    })
})

app.get('/todos/:id', (req,res) =>{
    const {userId} = req.headers 
    db.query(`SELECT * FROM todos_tbl WHERE user_id = ${userId}`, (err, fields) =>{
        if (err) {
            ResponseServerError(err, res)
        }
    })
})

app.put('/todos/:id', (req,res) =>{
    const {userId} = req.headers 
    db.query(`SELECT * FROM todos_tbl WHERE user_id = ${userId}`, (err, fields) =>{
        if (err) {
            ResponseServerError(err, res)
        }
    })
})

app.delete('/todos/:id', (req,res) =>{
    const {userId} = req.body
    db.query(`SELECT * FROM todos_tbl WHERE user_id = ${userId}`, (err, fields) =>{
        if (err) {
            res.status(500).json({
                "error": err.message
            })
        }
    })
})

app.listen(port, () => {
    console.log(`Server Menyala pada port ${port}`)
})