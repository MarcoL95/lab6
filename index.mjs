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
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
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

app.post("/author/delete", async function(req, res){
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

app.post("/quote/edit", async function(req, res) {
  let sql = `UPDATE q_quotes
             SET quote = ?,
                 authorId = ?,
                 category = ?,
                 likes = ?
             WHERE quoteId = ?`;

  let params = [
    req.body.quote,
    req.body.authorId,
    req.body.category,
    req.body.likes,
    req.body.quoteId
  ];

  await conn.query(sql, params);
  res.redirect("/quotes");
});

app.get("/quote/edit", async function(req, res) {
  let quoteId = req.query.quoteId;

  let quoteSql = `
    SELECT *
    FROM q_quotes
    WHERE quoteId = ?
  `;

  let authorSql = `
    SELECT authorId, firstName, lastName
    FROM q_authors
    ORDER BY lastName
  `;

  let categorySql = `
    SELECT DISTINCT category
    FROM q_quotes
    WHERE category IS NOT NULL
      AND category <> ''
    ORDER BY category
  `;

  const [quoteInfo] = await conn.query(quoteSql, [quoteId]);
  const [authors] = await conn.query(authorSql);
  const [categories] = await conn.query(categorySql);

  res.render("editQuotes", {
    quoteInfo,
    authors,
    categories
  });
});

app.post("/quote/delete", async function(req, res){
    let quoteId = req.query.quoteId;

    let sql = `DELETE
               FROM q_quotes
               Where quoteId = ?`;

    const [rows] = await conn.query(sql, [quoteId]);

    res.redirect("/quotes");
})

app.get("/quote/new", async (req, res) => {
  let authorSql = `
    SELECT authorId, firstName, lastName
    FROM q_authors
    ORDER BY lastName
  `;

  let categorySql = `
    SELECT DISTINCT category
    FROM q_quotes
    WHERE category IS NOT NULL
      AND category <> ''
    ORDER BY category
  `;

  const [authors] = await conn.query(authorSql);
  const [categories] = await conn.query(categorySql);

  res.render("newQuote", { authors, categories });
});

app.post("/quote/new", async (req, res) => {
  let quote = req.body.quote;
  let category = req.body.category;
  let likes = req.body.likes || 0;
  let authorId = req.body.authorId;

  let sql = `INSERT INTO q_quotes
             (quote, authorId, category, likes)
             VALUES (?, ?, ?, ?)`;

  let params = [quote, authorId, category, likes];

  await conn.query(sql, params);

  res.render("newQuote", { message: "Quote added!" });
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