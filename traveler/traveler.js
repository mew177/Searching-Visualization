var canvas = document.querySelector('canvas');

// canvas location and attribute
canvas.width = window.innerWidth;
canvas.height = 560;
canvas.style.top = window.innerHeight-canvas.height + "px";
canvas.style.left = window.innerWidth-canvas.width + "px";
canvas.style.position = "absolute";
var cxt = canvas.getContext('2d');

var GRID_LEN = 20;
var ROWS = Math.floor(canvas.height / GRID_LEN);
var COLS = Math.floor(canvas.width / GRID_LEN);
var cities_size = 50;

// City Class
class City {
  constructor(x, y, r=5) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  draw(color='black') {
    cxt.beginPath();
    cxt.arc(this.x, this.y, this.r, 0, 2*Math.PI, false);
    cxt.fillStyle = color;
    cxt.fill();
    cxt.strokeStyle = color;
    cxt.stroke()
  }
}

class TSP_problem {
  constructor(Cities) {
    this.tour = [0];
    this.cities_size = Cities.length;
    this.Cities = Cities;
  }

  // reset parameters
  init() {
    this.tour = [];
  }
  // generate a random tour
  static generate_random_tour() {
    var tour = [0];
    var samples = [];
    for (var i = 1; i < cities_size; i++) {
      samples.push(i);
    }
    while (tour.length < cities_size) {
      var rand = Math.floor(Math.random() * cities_size);
      if (!tour.includes(rand)) {
        tour.push(rand);
      }
    }
    return tour;
  }
  // permute tour for this state
  static permute_tour(tour) {
    var start = Math.floor(Math.random() * tour.length);
    var end = Math.floor(Math.random() * tour.length);
    var newTour = [];
    var i;
    if (start < end) {
      for (i = 0; i < start; i++) {
        newTour.push(tour[i]);
      }
      for (i = end; i >= start; i--) {
        newTour.push(tour[i]);
      }
      for (i = end+1; i < tour.length; i++) {
        newTour.push(tour[i]);
      }
    } else {
      for (i = end+1; i < start; i++) {
        newTour.push(tour[i]);
      }
      for (i = end; i >= 0; i--) {
        newTour.push(tour[i]);
      }
      for (i = start; i < tour.length; i++) {
        newTour.push(tour[i]);
      }
    }
    return newTour;
  }
  // distance between two cities
  static distance(c1, c2) {
    return Math.sqrt((c1.x-c2.x)*(c1.x-c2.x) + (c1.y-c2.y)*(c1.y-c2.y));
  }
  // evaluation of state (total distance of a path)
  static evaluate_tour(tour) {
    var d = 0;
    for (var i = 1; i < tour.length; i++) {
      d += TSP_problem.distance(cities[tour[i-1]], cities[tour[i]]);
    }
    return d;
  }

  static draw_tour(tour, cities) {
    for (var i = 0; i < tour.length-1; i++) {
      cxt.beginPath();
      cxt.moveTo(cities[tour[i]].x, cities[tour[i]].y);
      cxt.lineTo(cities[tour[i+1]].x, cities[tour[i+1]].y);
      cxt.lineWidth = 5;
      cxt.strokeStyle = 'red';
      cxt.stroke();
    }
  }
}

// animate tour
function draw_tour(tour, cities, x, y, dis=0, now=0, dx=1) {
  if (now >= tour.length) {
    return;
  }
  requestAnimationFrame(function() {
    draw_tour(tour, cities, x, y, dis, now);
  });

  if (cities[tour[now]].x == x && cities[tour[now]].y == y) {
    now += 1;
  }

  var thisDist = parseInt(TSP_problem.distance(cities[tour[now-1]], cities[tour[now]]).toFixed(2));

  cxt.font = "20px Georgia";
  cxt.fillText(thisDist, (cities[tour[now-1]].x+cities[tour[now]].x)/2, (cities[tour[now-1]].y+cities[tour[now]].y)/2);

  dis += thisDist;
  document.getElementById('cost').innerHTML = "Distance: " + dis;

  cxt.beginPath();
  cxt.moveTo(x, y);
  cxt.lineTo(cities[tour[now]].x, cities[tour[now]].y);
  cxt.lineWidth = 5;
  cxt.strokeStyle = 'red';
  cxt.stroke();
  x = cities[tour[now]].x;
  y = cities[tour[now]].y;



  document.getElementById('cost').innerHTML = "Distance: " + energy;
}

// draw grid on board
function drawGrid() {
  cxt.lineWidth = 1;
  cxt.strokeStyle = 'black';
  for (var r = 1; r <= ROWS; r++) {
    cxt.beginPath();
    cxt.moveTo(0, r * GRID_LEN);
    cxt.lineTo(COLS * GRID_LEN, r * GRID_LEN);
    cxt.stroke();
  }

  for (var c = 1; c <= COLS; c++) {
    cxt.beginPath();
    cxt.moveTo(c * GRID_LEN, 0);
    cxt.lineTo(c * GRID_LEN, ROWS * GRID_LEN);
    cxt.stroke();
  }
}

// draw a set of cities on to board
function drawCities(cities) {
  for (var i = 0; i < cities.length; i++) {
    cities[i].draw();
  }
}

// generate a set of cities
function randomCityCreator(size=1) {
  var cities = []
  for (var i = 0; i < size; i++) {
    cities.push(new City(Math.floor((Math.random()*canvas.width)), Math.floor((Math.random()*canvas.height))));
  }
  drawCities(cities);
  return cities;
}

// implementation of simulate annealing
var INIT_TEMP = 100;
var ITERATIONS = 10000;
function simulate_annealing(problem, cities) {

    var tour = TSP_problem.generate_random_tour();
    var energy = TSP_problem.evaluate_tour(tour);
    var temperature = INIT_TEMP;

    for (var i = 0; i < ITERATIONS; i++) {
      while (true) {
        var nextTour = TSP_problem.permute_tour(tour);

        //console.log(nextTour);
        var nextEnergy = TSP_problem.evaluate_tour(nextTour);
        //console.log(nextEnergy);
        var delt_E = energy - nextEnergy;

        if (pAccept(delt_E, temperature)) {
          tour = nextTour;
          energy = nextEnergy;
          break;
        }
      }
      temperature = cooling(i);
    }

    draw_tour(tour, cities, cities[tour[0]].x, cities[tour[0]].y);
}

// tanh temperature cooling function
function cooling(iter) {
  return INIT_TEMP * Math.tanh((INIT_ITERATIONS-iter)/(iter/2));
}

// calcaulate the probability of acception for tour with lower energy
function pAccept(delt_E, T) {
  var p = Math.exp(delt_E / (T/10));
  var rand = Math.random();
  if (rand <= p) {
    return true;
  }
  return false;
}

// variable initialization
function init(init_temp=50, iterations=10000) {
  INIT_TEMP = init_temp;
  INIT_ITERATIONS = iterations;

  cxt.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawGrid();
}

// initialize cities on board
function init_cities() {
  init();
  cities = randomCityCreator(cities_size);
  var problem = new TSP_problem(cities);
  problem.init();
  simulate_annealing(problem, cities);
}

drawGrid();
