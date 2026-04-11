import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const conn = mysql.createPool({
    host: "etdq12exrvdjisg6.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "voz96q26is1ttdb6",
    password: "xxdae3azt5ull0eu",
    database: "e16kcuhsp84h6292",
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', (req, res) => {
   res.render('index')
});

app.get("/author/new", (req, res) => {
    res.render("newAuthor")
});

app.post("/author/new", async function(req, res){
  let fName = req.body.fName;
  let lName = req.body.lName;
  let birthDate = req.body.birthDate;
  let deathDate = req.body.deathDate;
  let sex = req.body.sex;
  let profession = req.body.profession;
  let imageUrl = req.body.imageUrl;
  let country = req.body.country;
  let bio = req.body.bio;

  let sql = `INSERT INTO q_authors
             (firstName, lastName, dob, dod, sex, profession, country, portrait, biography)
              VALUES (?, ?, ?, ?, ?, ?)`;
  let params = [fName, lName, birthDate, deathDate, sex, profession, country, bio];
  const [rows] = await conn.query(sql, params);
  res.render("newAuthor", 
             {"message": "Author added!"});
});

app.get("/authors", async function(req, res){
 let sql = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
 const [rows] = await conn.query(sql);
 res.render("authorList", {"authors":rows});
});

app.post("/author/edit", async function(req, res){
  let sql = `UPDATE q_authors
            SET firstName = ?,
                lastName = ?,
                dob = ?,
                sex = ?,
                dod = ?,
                profession = ?,
                portrait = ?,
                country = ?,
                biography = ?
            WHERE authorId =  ?`;


  let params = [req.body.fName,  
              req.body.lName, req.body.dob, 
              req.body.sex, req.body.deathDate, req.body.profession, req.body.imageUrl, req.body.country, req.body.bio, req.body.authorId];         
  const [rows] = await conn.query(sql,params);
  res.redirect("/authors");
});


app.get("/author/edit", async function(req, res){


 let authorId = req.query.authorId;


 let sql = `SELECT *, 
        DATE_FORMAT(dob, '%Y-%m-%d') dobISO,
        DATE_FORMAT(dod, '%Y-%m-%d') AS dodISO
        FROM q_authors
        WHERE authorId =  ${authorId}`;
 const [rows] = await conn.query(sql);
 res.render("editAuthor", {"authorInfo":rows});
});

app.get("/author/delete", async function(req, res){
    let authorId = req.query.authorId;

    let sql = `DELETE
               FROM q_authors
               Where authorId = ?`;

    const [rows] = await conn.query(sql, [authorId]);

    res.redirect("/authors");
})

app.get("/quotes", async function(req, res){
 let sql = `SELECT *
            FROM q_quotes`;
 const [rows] = await conn.query(sql);
 res.render("quoteList", {"quotes":rows});
});

app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})