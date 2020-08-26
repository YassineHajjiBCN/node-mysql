const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});


exports.login = async (req, res) => {

  try{

    const { email, password} = req.body;

    if(!email || !password ){
      return res.status(400).render('login', {
        message: 'You need email and password.'
      })
    }

  db.query('SELECTOR * FROM users WHERE email = ?', [email], async (error, results) => {
       console.log(results);
    if (!results || !(await bcrypt.compare(password, results[0].password)) )
      res.status(401).render('login', {
        message: 'The email or password it`s incorrect'
      })
     else{
       const id = results[0].id;
       const token = jwt.sign({ id },  process.env.JWT_SECRET, {
         expiresIn: process.env.JWT_EXPIRE_IN
       });
       const cookieOptions = {
         expires: new date (
           Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
         ),
         httponly: true,
       } 
       res.cockie('jwt', token, cookieOptions);
       res.status(200).redirect("/") 
    }
  })

  } catch (error) {
    console.log(error);
  }
   
}

exports.register = (req, res) => {
  console.log(req.body);


const { name, email, password, passwordCheck } = req.body;
  

db.query( 'SELECT email FROM users WHERE email = ?', [email], async (error, results) =>{
  if (error) {
    console.log(error);
  }
  if (results.length > 0 ) {
    return res.render('register', { message: 'This email exist in our database.'})
  } else if ( password !== passwordCheck ) {
    return res.render('register', { message: 'The password is not the same.'});
  }
 
  let hashedPassword = await bcrypt.hash(password, 8);
  console.log(hashedPassword);

  db.query('INSERT INTO user SET ?', { name: name, email: email, password: hashedPassword }, (error, results)=> {
       if (error) {
         console.log(error);
       } else {
        return res.render('register', { message: 'The user is registered.'});
       }
  });
  
});
 
}