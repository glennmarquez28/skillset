const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { response } = require("express");
const db = mysql.createConnection({
    database: process.env.DATABASE,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER, 
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,

});

exports.register = (req, res) => {
    // console.log(req.body)

    const {first_name, last_name, email, password, confirm_password} = req.body;

    db.query(
        "SELECT email FROM accounts WHERE email =?",
        email,
        async(error, results) => {
            console.log(results);
            if (error) {
                console.log(error);
            } 
            if (results.length > 0) {
                res.render("register", {errorMSG: "Email entered is already in use!", color: "alert-danger"});
            } else if (confirm_password !== password) {
                res.render("register", {errorMSG: "Password is not  match", color: "alert-danger"})
            }

            const hashPassword = await bcrypt.hash(password, 8);
            console.log(hashPassword);

            db.query(
                "INSERT INTO accounts SET ?",
                {
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    password: hashPassword
                },
                (error, results) => {
                    if (error){
                        console.log(error)
                    } else if (confirm_password == hashPassword) {
                        console.log(results)
                        res.render("register", {message: "Your are now registered"})
                    }
                }
            )
        }
    )
};

exports.login = (req, res) => {
    try {
    const { email, password } = req.body;
    if (email === "" || password === "") {
      res.render("index", { message: "Email and password is incorrect" });
    } else {
      db.query(
        "SELECT * FROM accounts WHERE email =?",
        email,
        async (error, results) => {
          if (error) {
            console.log(error);
          }
          if (!results.length > 0) {
            res.render("index", { errMsg: "Invalid email!" });
          } else if (!(await bcrypt.compare(password, results[0].password))) {
            res.render("index", { errMsg: "Invalid password!" });
          } else {

            const account_id = results[0].account_id
            console.log(account_id);
            const token =jwt.sign({account_id}, process.env.JWTSECRET, {expiresIn: process.env.JWTEXPIRES});
            console.log(token);
            // const decoded = jwt.decode(token, {complete: true});
            // console.log(decoded);
            const cookieoptions = {expire: new Date(Date.now() + process.env.COOKIEEXPIRE * 24 * 60 * 60 * 1000), 
            httpOnly: true}
            res.cookie("JWT", token, cookieoptions);
            console.log(cookieoptions);

            db.query(
            "SELECT * FROM accounts", 
            (error, results) => {
                res.render("listaccounts", { title: "List of Accounts", accounts: results});
            });
          }
        }
      );
    }
    } catch (err) {
        console.log(`Catched error: ${err}`)
    }
};

//

exports.updateform = (req, res) => {
    const email = req.params.email;
    console.log(email);
    db.query("SELECT * FROM accounts WHERE email =?", email, (error, results) => {
      console.log(results);
      res.render("updateform", { results: results[0] });
    });
  };

  exports.updateuser = (req, res) => {
    const { firstName, lastName, email } = req.body;
  
    if (firstName === "" || lastName === "") {
      res.render("updateform", {
        message: "Please fill in all fields",
        result: { first_name: firstName, last_name: lastName, email: email },
      });
    } else {
      db.query(
        `UPDATE accounts SET first_name ="${firstName}", last_name ="${lastName}" WHERE email ="${email}"`,
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            db.query("SELECT * FROM accounts", (error, results) => {
              res.render("listaccounts", {
                title: "List of Account",
                accounts: results,
              });
            });
          }
        }
      );
    }
  };

  exports.delete = (req, res) => {
    const account_id = req.params.account_id

    console.log(account_id);
    db.query("DELETE FROM accounts WHERE account_id = ?",
    account_id,
    (err,results)=> {
        if(err){
            console.log(err);
        }else{
          db.query("SELECT * FROM accounts", (error, results) => {
            res.render("listaccounts", {
              title: "List of Account",
              accounts: results,})
            })
            
        }
    })
}

exports.logout = (req, res) => {
  res.clearCookie("JWT").status(200);
  res.render("index", {message: "Successfully logout"})
}
exports.skillset = (req,res) => {
  const account_id = req.params.account_id;
  db.query("SELECT S.skillset_level, S.skillset_title, S.account_id, A.first_name, A.last_name FROM skillset AS S INNER JOIN accounts AS A ON S.account_id = A.account_id WHERE A.account_id = ?",
  account_id,
  (err,results) =>{
      if(err){
          console.log(err)
      }else{
          res.render("skillset", {title: "Skillsets of " + results[0].first_name + " " + results[0].last_name, users: results});
      }
  }) 

}

exports.back = (req,res) => {
  db.query("SELECT * FROM accounts",
      (err,results) => {
          // console.log(result);
          res.render("listaccounts", {
            title: "List of Account",
            accounts: results,})
      }
  )
          
}