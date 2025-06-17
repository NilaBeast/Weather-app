const express = require("express");
const https = require("https");
const date = require(__dirname + "/date.js");

const app = express();
const apikey = "fdad20a4cda55ec031e7474217c0ed0d";
const unit = "metric";

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("index", {
    temp1: "",
    date1: date.getDate(),
    des: "Search for Temperature",
    place: "",
    img: "https://cdn.iconscout.com/icon/free/png-256/sunny-weather-1-458138.png",
    error: null
  });
});

app.post("/", function (req, res) {
  const query = req.body.cityName;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apikey}&units=${unit}`;

  https.get(url, (response) => {
    let data = "";

    response.on("data", (chunk) => {
      data += chunk;
    });

    response.on("end", () => {
      if (response.statusCode === 200) {
        try {
          const weatherData = JSON.parse(data);
          const temp = weatherData.main.temp;
          const temperature1 = `${temp}° C`;
          const weatherDesc = weatherData.weather[0].description;
          const icon = weatherData.weather[0].icon;
          const imgurl = `http://openweathermap.org/img/wn/${icon}@4x.png`;

          res.render("index", {
            temp1: temperature1,
            date1: date.getDate(),
            des: weatherDesc,
            place: query,
            img: imgurl,
            error: null
          });
        } catch (err) {
          res.render("index", {
            temp1: "",
            date1: date.getDate(),
            des: "",
            place: query,
            img: "",
            error: "Error parsing weather data."
          });
        }
      } else {
        res.render("index", {
          temp1: "",
          date1: date.getDate(),
          des: "",
          place: query,
          img: "",
          error: "City not found or invalid API key."
        });
      }
    });
  }).on("error", (err) => {
    res.render("index", {
      temp1: "",
      date1: date.getDate(),
      des: "",
      place: query,
      img: "",
      error: "Network error occurred."
    });
  });
});

app.listen(3000, function () {
  console.log("Server is running on port 3000.");
});
