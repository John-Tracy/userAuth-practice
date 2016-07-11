var mysql = require('mysql');

var connection = mysql.createConnection({

  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'userAuth'

});

// makes a connection with the mysql DB
connection.connect(function(err){
  if(err) throw err;
});

// express server
var express = require('express'),
app = express(),

// express session for user authentication
session = require('express-session');
app.use(session({
    secret: 'no secret',
    resave: true,
    saveUninitialized: true
}));


var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));

var path = require('path');


// post method invoked when user submits there username and password
app.post('/loginInfo', function(req, res){
    var user = req.body.user;
    var password = req.body.pass;
    var theQuery = 'SELECT * FROM users WHERE userName = "' + user + '"';

 connection.query(theQuery, function(err, data){
        console.log('Data from query: ' + data[0]);
        if(data[0] == undefined){
          res.json('invalid');
          return
        }
      if(data[0] !== undefined){
        if(user == data[0].userName && password == data[0].userSecret){
          console.log('if statemennt to validate database info worked');
          req.session.user = user;
          req.session.admin = true;

          res.json('success');
        }
       else{

          res.json('invalid');
        }
      }
    });
});
 
// Authentication and Authorization Middleware
var auth = function(req, res, next) {
  // verifing that the session properties are valid
  if (req.session && req.session.admin == true)
  // if true the next parameter is invoked and procedes to line 79
    return next();
  else 
    // send a response to client informing them
    // that they are unauthorized to recive the page they are 
    // requesting without proper credentials
    return res.sendStatus(401) ;
};
 
// Login endpoint
app.get('/login', function (req, res) {
  // if the login session admin property is not valid
  // the sever sends the client the login page to input
  // proper credentials
  if (!req.session.admin) {
    res.sendFile(path.join(__dirname + '/login.html'));  
  // if the session admin property is set to true(with proper proper credentials)
  // it will serve up the admin page
  } else if(req.session.admin == true) {
    res.sendFile(path.join(__dirname + '/admin.html'));
  }

});
 
// Logout endpoint
app.get('/logout', function (req, res) {
// when logout is invoked by user
// the session is destroyed which will not allow them to access
// the admin page until they login again
  req.session.destroy();
// sends user logout page to inform them they are logged out and 
// allows them the opt to login in again
  res.sendFile(path.join(__dirname + '/logout.html'));
});
 
// Get admin page endpoint
app.get('/admin', auth, function (req, res) {
  // the auth function is invoked /refer to lines 48-59
  // this function (the one this comment is in)
  // will only be invoded if the auth() function returns next()
  // refer to line 53
    res.sendFile(path.join(__dirname + '/admin.html'));
});
 

// server listening on port 3000
app.listen(3000);
console.log("app running at http://localhost:3000");



