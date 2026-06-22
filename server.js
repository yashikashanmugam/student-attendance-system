const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Yashika@15',
    database: 'yashikadb'
});

db.connect((err) => {

    if(err){
        console.log("DB Connection Failed ❌", err);
        return;
    }

    console.log("DB Connected ✅");

    db.query("TRUNCATE TABLE attendance", (err) => {

        if(err){
            console.log(err);
        }else{
            console.log("Attendance Table Cleared ✅");
        }

    });

});

app.post('/login', (req, res) => {
    let { username, password } = req.body;
    let sql = `SELECT * FROM students WHERE username =? AND password =?`;
    db.query(sql, [username, password], (err, results) => {
        if(err) {
            console.log("SQL Error:", err);
            return res.json({status: 'error'});
        }
        if(results.length > 0) {
            res.json({
                status: 'success',
                student_id: results[0].student_id,
                student_name: results[0].student_name,
                username: results[0].username
            });
        } else {
            res.json({status: 'Invalid Username or Password'});
        }
    });
});

app.post('/attendance', (req, res) => {

    let { username } = req.body;

    let checkSql =
"SELECT * FROM attendance WHERE username=? AND attendance_date=CURDATE()";

    db.query(checkSql, [username], (err, result) => {

        if(err){
            console.log(err);
            return res.json({success:false});
        }

        if(result.length > 0){

            return res.json({
                success:false,
                message:"Already Marked"
            });

        }

        let insertSql = `
        INSERT INTO attendance
        (username, attendance_date, attendance_time)
        VALUES (?, CURDATE(), CURTIME())
        `;

        db.query(insertSql, [username], (err) => {

            if(err){
                console.log(err);
                return res.json({success:false});
            }

            res.json({
                success:true,
                message:"Attendance Marked"
            });

        });

    });

});

app.get('/attendance', (req, res) => {

    let sql = `
    SELECT *
    FROM attendance
    ORDER BY id ASC
    `;

    db.query(sql, (err, results) => {

        if(err){
            console.log(err);
            return res.json([]);
        }

        res.json(results);

    });

});

app.delete('/reset-attendance',(req,res)=>{

    db.query(
        "TRUNCATE TABLE attendance",
        (err)=>{

            if(err){
                return res.json({success:false});
            }

            res.json({success:true});

        }
    );

});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});