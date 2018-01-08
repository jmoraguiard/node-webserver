const express = require('express');
const hbs = require('hbs');
const fs = require('fs');

// get Heroku port environment variable
const port = process.env.PORT || 3000;

// Create an Express app
var app = express();

// Adding middleware to application, in this case telling it
// that public folder has some content that can be routed from
// outside
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs'); // Setting up Handlebars as view engine

// registering our own middleware that is a Logger
// req -> request
// res -> response
// next -> what to do right after the request is done
app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}:${req.method}:${req.url}`;
  console.log(log);
  fs.appendFile('server.log', log + '\n', (err) => {
      if (err) {
        console.log('Unable to append to server.log');
      }
  });
  next(); // only now the application is going to continue
});

// The following Middleware is blocking, as 'next()' is not being called
// thus the response is rendering the Handlebars view but not moving Server
// forward
/*app.use((req, res, next) => {
  res.render('maintenance.hbs', {
    maintenanceMessage: 'The web is under maintenance, sorry for the inconveniences.'
  });
});*/

// Middleware uses execute in order they are called, thus I moved
// the static folder to below so if web is in maintenance everything
// works as expected
app.use(express.static(__dirname + '/public'));

// Helper for HBS that allows us to call a method from the
// views
hbs.registerHelper('getCurrentYear', () => {
  return new Date().getFullYear();
});

hbs.registerHelper('screamIt', (text) => {
  return text.toUpperCase();
});

// HTTP route handlers (for the base petition)
// req -> request
// res -> response
app.get('/', (req, res) => {
  //res.send('<h1> Hello world! </h1>');
  /*res.send({
    name: 'Joan',
    likes: [
      'Nuria',
      'Video games',
      'Traveling']
  });*/
  res.render('home.hbs', { // Sending parameters to View with an object
    pageTitle: 'Home Page',
    welcomeMessage: 'Hello!'
  });
});

// Returning simple text (or markup text)
// now rendering a View defined in handlebars
app.get('/about', (req, res) => {
  //res.send('Joan Mora did the page!');
  res.render('about.hbs', { // Sending parameters to View with an object
    pageTitle: 'About Page'
  });
});

app.get('/projects', (req, res) => {
  res.render('projects.hbs', {
    pageTitle: 'Projects Page',
    message: 'My projects'
  });
});

// Sending an object to the response
app.get('/bad', (req, res) => {
  res.send({
    errorMessage: 'Error handling request'
  });
});

// Specify port where app will listen and giving output in console, using
// port variable from top of file
app.listen(port, () => {
  console.log(`Server is up on port ${port}.`);
});
