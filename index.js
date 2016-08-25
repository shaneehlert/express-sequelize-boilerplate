var express = require('express');
var ejsLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('./config/ppConfig');
var flash = require('connect-flash');
var isLoggedIn = require('./middleware/isLoggedIn');
var app = express();
const isPokemonGoUp = require('is-pokemon-go-up')
var Pokeio = require('pokemon-go-node-api')
var db = require('./models')

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(ejsLayouts);
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'abcdefghijklmnopqrstuvwxyz',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/', function(req, res) {
  res.render('locations');
});

app.get('/profile', isLoggedIn, function(req, res) {
   isPokemonGoUp()
     .then(function(response) {
        res.render('profile', { status: response })
     })
});

console.log(process.env.PGO_USERNAME1, process.env.PGO_PASSWORD1)

app.get('/locations', isLoggedIn, function(req, res){
  var goServer = new Pokeio.Pokeio();

  var cityName = req.query.city || 'Seattle';

  var city = {       
    type: 'name',
    name: cityName
  };

  var goUser = process.env.PGO_USERNAME1
  var goPassword = process.env.PGO_PASSWORD1

  goServer.init(goUser, goPassword, city, "google", function(err){
    if (err) throw err;
    goServer.GetLocation(function(err, location){
      goServer.playerInfo.locationName = location;
      console.log(goServer.playerInfo)
      res.render('locations', { info: goServer.playerInfo })
    })
  });
});

app.post('/savedlocation', function(req,res){
  console.log(req.body);
  db.locations.findOrCreate({
    where:{
      latitude: req.body.latitude,
      longitude: req.body.longitude
    },
    defaults: {
      apiendpoint: req.body.apiendpoint,
      inittime: req.body.inittime,
      locationname: req.body.locationname
    }
  }).spread(function(location, created){
    if(created) {
      res.redirect('/profile');
    } else {
      location.latitude = req.body.latitude;
      location.longitude = req.body.longitude;
      location.apiendpoint = req.body.apiendpoint;
      location.inittime = req.body.inittime;
      location.locationname = req.body.locationname;

      location.save().then(function(location, created) {
        res.redirect('/profile');
      });
    }
  });
})

app.use('/auth', require('./controllers/auth'));

var server = app.listen(process.env.PORT || 3000);

module.exports = server;
