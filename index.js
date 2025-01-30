const express = require('express')
require('dotenv').config()
const port = 3000
const app = express()
const body = require('body-parser')
const db = require('./connection')
const bcrypt = require('bcryptjs')
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
    if (!authorization) {
        console.log('siap')
        return res.status(403).json({
            "message": "Membutuhkan token"
        })
    } 
    try {
        const secret = process.env.SECRET_TOKEN
        const token = authorization.split(' ')[1]
        const jwtDecode = jwt.verify(token, secret)
        req.user = jwtDecode
        next()
    } catch (error) {
        console.log('Ok')
        return res.status(401).json({
            "messagge": "Authorize gagal"
        })
    }
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
                return ResponseServerError(err, res)
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
                        const secret = process.env.SECRET_TOKEN
                        const accessToken = jwt.sign(data, secret, {expiresIn: 60*60*24})
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
    const { user_id } = req.user
    db.query(`SELECT todo_id, title, description, to_char(due_date, 'YYYY-MM-DD') as due_date , priority, is_completed FROM todos_tbl WHERE user_id = ${user_id}`, (err, fields) =>{
        if (err) {
            return ResponseServerError(err, res)
        }
        if (fields.rowCount === 0 ){
            ResponseMessageServer(404, "User ini belum pernah membuat to do list", res)
        } else {
            const datas = fields.rows
            res.status(200).json({
                "message": "Data berhasil didapatkan",
                "datas": datas
            })
        }
    })
})  

app.post('/todos', validationAccess, (req,res) =>{
    const { user_id } = req.user
    let { title, description, due_date, priority, is_completed } = req.body
    if ( !title ) {
        return ResponseMessageServer(403, "Title tidak boleh kosong", res)
    }
    due_date = due_date ?? null
    description = description ?? null
    priority = priority ?? null
    is_completed = is_completed ?? null
    console.log(user_id,title, description, priority, due_date, is_completed)
    db.query(`INSERT INTO todos_tbl (user_id, title, description, due_date, priority, is_completed) VALUES (${user_id}, $1, $2, $3, $4, $5) RETURNING todo_id, title, description, due_date, priority, is_completed`,[title, description, due_date, priority, is_completed], (err, fields) =>{
        if (err) {
            return ResponseServerError(err, res)
        } else {
            const data = fields.rows
            return res.status(201).json({
                "message": "Data berhasil dimasukkan",
                "datas" : data
            })
        }
    })
})

app.get('/todos/:id', validationAccess, (req,res) =>{
    const { user_id } = req.user
    const todo_id = req.params.id
    db.query(`SELECT todo_id, title, description, to_char(due_date, 'YYYY-MM-DD') as due_date , priority, is_completed FROM todos_tbl WHERE todo_id = ${todo_id} AND user_id = ${user_id}`, (err, fields) =>{
        datas = fields.rows
        if (err) {
            return ResponseServerError(err, res)
        }
        if (fields.rowCount === 0) {
            return ResponseMessageServer(404, "To Do tidak ditemukan", res)
        } else {
            res.status(200).json({
                "message" : `Data Dengan User id = ${user_id} & Todo id = ${todo_id} `,
                "datas" : datas
            })
        }
    })
})

app.put('/todos/:id', validationAccess, (req,res) =>{
    const { user_id } = req.user
    const todo_id = req.params.id
    let { title, description, due_date, priority, is_completed } = req.body
    title = title ?? null 
    due_date = due_date ?? null
    description = description ?? null
    priority = priority ?? null
    is_completed = is_completed ?? null
    db.query(`UPDATE todos_tbl SET title = COALESCE($1, title), description = COALESCE($2, description), due_date = COALESCE($3, due_date), priority = COALESCE($4, priority) , is_completed = COALESCE($5, is_completed) WHERE user_id = ${user_id} AND todo_id = ${todo_id} RETURNING todo_id, title, description, to_char(due_date, 'YYYY-MM-DD') as due_date, priority, is_completed`, [title, description, due_date, priority, is_completed], (err, fields) =>{
        if (err) {
            return ResponseServerError(err, res)
        }
        if (fields.rowCount === 0) {
            ResponseMessageServer(404, "To Do tidak ditemukan", res)
        } else {
            datas = fields.rows
            return res.status(200).json({
                "message": "Data berhasil diupdate",
                "datas" : datas
            })
        }
    })
})

app.delete('/todos/:id', (req,res) =>{
    const { user_id } = req.user
    const todo_id = req.params.id
    db.query(`DELETE FROM todos_tbl WHERE user_id = ${user_id} AND todo_id = ${todo_id}`, (err, fields) =>{
        if (err) {
            return ResponseServerError(err, res)
        }
        if (fields.rowCount === 0) {
            ResponseMessageServer(404, "To Do tidak ditemukan", res)
        } else {
            ResponseMessageServer(200, `To Do dengan user id ${user_id} dan todo id ${todo_id} berhasil dihapus`)
        }
    })
})

app.listen(port, () => {
    console.log(`Server Menyala pada port ${port}`)
})