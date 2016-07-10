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
  // uncomment the console log if you need to make sure your are receiving data.
  // console.log(req.body);

// credentials are hardcoded for dev purposes only
// in a real application you would try the user input
// against data from a mySQL database.  
 if(req.body.user == 'johnny' && req.body.pass == 'password123'){
// the below variables are set withing session
// which can be used globally to authenticate certain server respones
  req.session.user = req.body.user;
  req.session.admin = true;
// the below code sends they 'success' string back to the 
// client side success function within the ajax post.
// refer to lines 91-96 to see how it is used.
  res.json('success');
  }
  else{
// below code sends 'invalid' string back to client side
// success function. refer to lines 91-96 to see how it is used.
    res.json('invalid');
  }
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



