function xmlh() {
  if (window.XMLHttpRequest) {
    // code for modern browsers
    var xmlhttp = new XMLHttpRequest();
  } else {
    // code for old IE browsers
    var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  return xmlhttp;
}

var xmlhttp = xmlh();

function req_url(body_name) {
  return (
    "https://api.le-systeme-solaire.net/rest/bodies?filter[]=englishName,eq," +
    body_name +
    "&data=meanRadius,mass,massValue,massExponent,gravity,escape,sideralOrbit,sideralRotation,moons,aphelion,perihelion"
  );
}

/*
Exemlo formato de raw_data
raw_data = PlanetsDataJSON.bodies[0]
{…}
​
  aphelion: 152100000 //em Km
  ​
  escape: 11190  // em m/s
  ​
  gravity: 9.8 // em m/s^2
  ​
  mass: Object { massValue: 5.97237, massExponent: 24 }  // = 5.97237^24 Kg
  ​
  meanRadius: 6371.0084 //em Km
  ​
  moons: Array [ {} ] //vetor de strings com campos vazios cada um correspondendo a uma lua
  ​
  perihelion: 147095000 // em Km
  ​
  sideralOrbit: 365.256 //em dias terrestres

  sideralRotation: 23.9345 // em horas
*/
class PlanetDataFromAPI {
  constructor(name) {
    this.name = name; //name;
    this.raio_medio = {}; //raw_data.meanRadius;
    this.dist_media_sol = {}; //(raw_data.aphelion + raw_data.perihelion) / 2;
    this.massa = {}; //raw_data.mass;
    this.gravidade = {}; //raw_data.gravity;
    this.vel_escape = {}; //raw_data.escape;
    this.periodo_translacao = {}; //raw_data.sideralOrbit;
    this.periodo_rotacao = {}; //raw_data.sideralRotation;
    this.luas = {}; //raw_data.moons.length;
  }
  inicia(entry) {
    this.raio_medio = entry.meanRadius;
    this.dist_media_sol = (entry.aphelion + entry.perihelion) / 2;
    this.massa = entry.mass;
    this.gravidade = entry.gravity;
    this.vel_escape = entry.escape;
    this.periodo_translacao = entry.sideralOrbit;
    this.periodo_rotacao = entry.sideralRotation;
    this.luas = entry.moons == null ? 0 : entry.moons.length;
  }
}

// main

let PlanetsList = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "pluto",
  "uranus",
  "neptune",
  "saturn",
];
let PlanetsDataList = [];
(function loop(i, length) {
  if (i >= length) {
    return;
  }
  let planet = PlanetsList[i];
  PlanetsDataList[planet] = new PlanetDataFromAPI(planet);
  // Ajustes para contato com API
  let raw_data;
  xmlhttp.open("GET", req_url(planet));
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let PlanetsDataJSON = this.response;
      raw_data = PlanetsDataJSON.bodies[0];
      PlanetsDataList[planet].inicia(raw_data);
      loop(i + 1, length);
    }
  };
  xmlhttp.responseType = "json";
  xmlhttp.send();
})(0, PlanetsList.length);

// function request_bodies_data(body_name) {
//   return fetch(
//     "https://api.le-systeme-solaire.net/rest/bodies?filter[]=englishName,eq," +
//       body_name +
//       "&data=meanRadius,mass,massValue,massExponent,gravity,escape,sideralOrbit,sideralRotation,moons"
//   )
//     .then((res) => {
//       if (res.ok) {
//         console.log("SUCCESS");
//       } else {
//         console.log("Not Successful");
//       }
//       return res.json();
//     })
//     .then((body_data) => {
//       return body_data;
//     })
//     .catch((error) => console.log("ERROR"));
// }
