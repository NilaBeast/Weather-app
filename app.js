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
    feelsLike: "",
    humidity: "",
    wind: "",
    rain: "",
    date1: date.getDate(),
    des: "Search for Temperature",
    place: "",
    img: "https://cdn.iconscout.com/icon/free/png-256/sunny-weather-1-458138.png",
    error: null
  });
});

app.post("/", function (req, res) {
  const city = req.body.cityName;
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apikey}`;

  https.get(geoUrl, (geoRes) => {
    let geoData = "";

    geoRes.on("data", (chunk) => geoData += chunk);
    geoRes.on("end", () => {
      const parsedGeo = JSON.parse(geoData);
      if (!parsedGeo || parsedGeo.length === 0) {
        return res.render("index", {
          temp1: "", feelsLike: "", humidity: "", wind: "", rain: "",
          date1: date.getDate(), des: "", place: city, img: "", error: "City not found."
        });
      }

      const { lat, lon, name: cityName } = parsedGeo[0];
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}&units=${unit}`;

      https.get(weatherUrl, (weatherRes) => {
        let weatherData = "";

        weatherRes.on("data", (chunk) => weatherData += chunk);
        weatherRes.on("end", () => {
          if (weatherRes.statusCode === 200) {
            try {
              const parsedWeather = JSON.parse(weatherData);
              const temp = parsedWeather.main.temp;
              const feelsLike = parsedWeather.main.feels_like;
              const humidity = parsedWeather.main.humidity;
              const wind = parsedWeather.wind.speed;
              const rain = parsedWeather.rain ? parsedWeather.rain["1h"] || 0 : 0;
              const weatherDesc = parsedWeather.weather[0].description;
              const icon = parsedWeather.weather[0].icon;
              const imgurl = `http://openweathermap.org/img/wn/${icon}@4x.png`;

              res.render("index", {
                temp1: `${temp}° C`,
                feelsLike: `${feelsLike}° C`,
                humidity: `${humidity}%`,
                wind: `${wind} m/s`,
                rain: `${rain} mm`,
                date1: date.getDate(),
                des: weatherDesc,
                place: cityName,
                img: imgurl,
                error: null
              });
            } catch (err) {
              res.render("index", {
                temp1: "", feelsLike: "", humidity: "", wind: "", rain: "",
                date1: date.getDate(), des: "", place: city, img: "", error: "Error parsing weather data."
              });
            }
          } else {
            res.render("index", {
              temp1: "", feelsLike: "", humidity: "", wind: "", rain: "",
              date1: date.getDate(), des: "", place: city, img: "", error: "Failed to retrieve weather."
            });
          }
        });
      }).on("error", () => {
        res.render("index", {
          temp1: "", feelsLike: "", humidity: "", wind: "", rain: "",
          date1: date.getDate(), des: "", place: city, img: "", error: "Weather API network error."
        });
      });
    });
  }).on("error", () => {
    res.render("index", {
      temp1: "", feelsLike: "", humidity: "", wind: "", rain: "",
      date1: date.getDate(), des: "", place: city, img: "", error: "Geocoding API network error."
    });
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
