// import preact
import { h, render, Component } from 'preact';
// import stylesheets for ipad & button
import style from './style';
// import jquery for API calls
import $ from 'jquery';

//background names
const bg = [
	"rainy",
	"night",
	"sunny",
	"cloudy",
	"snowy"
];


//greetings for homepage
const greetings = [
	"Good Evening",
	"Good Morning",
];

export default class Iphone extends Component {
//var Iphone = React.createClass({

	// a constructor with initial set states
	constructor(props){
		super(props);
		// temperature state
		this.state.temp = "";
		this.fetchWeatherData();
		this.fetchHourly();
	}

	// a call to fetch weather data via wunderground
	fetchWeatherData = () => {
		// API URL with a structure of : ttp://api.wunderground.com/api/key/feature/q/country-code/city.json
		var url = "http://api.openweathermap.org/data/2.5/weather?q=London&units=metric&APPID=a6d681a3dba55941eeb547ea241befa1";
		$.ajax({
			url: url,
			dataType: "jsonp",
			success : this.parseResponse,
			error : function(req, err){ console.log('API call failed ' + err); }
		})
	}

	//gets hourly data from openweathermap
	fetchHourly = () => {
		var url = "http://api.openweathermap.org/data/2.5/onecall?lon=-0.1257&lat=51.5085&exclude=current,minutely,alerts&units=Metric&APPID=a6d681a3dba55941eeb547ea241befa1";
		$.ajax({
			url: url,
			dataType: "json",
			success : this.parseHResponse,
			error : function(req, err){ console.log('API call failed ' + err); }
		})
	}

	fetchWeatherData2(query){
		if(event.key === 'Enter'){
			var a = "http://api.openweathermap.org/data/2.5/weather?q="
			var b = "&units=metric&APPID=fe32d7527ce0cb77ed6216e849f63148";
			$.ajax({
				url: a + query + b,
				dataType: "jsonp",
				success : this.parseResponse,
				error : function(req, err){ console.log('API call failed ' + err); }
			})
		}
	}

	//function to deal with the hourly openweather API call
	parseHResponse = (parsed_json) => {
        var HT1 = parsed_json['hourly']['1']['temp'];
		var HT2 = parsed_json['hourly']['2']['temp'];
		var HT3 = parsed_json['hourly']['3']['temp'];
		var HT4 = parsed_json['hourly']['4']['temp'];
		var HT5 = parsed_json['hourly']['5']['temp'];

		var time1 = this.formatDate(new Date(parsed_json['hourly']['1']['dt'] * 1000));
		var time2 = this.formatDate(new Date(parsed_json['hourly']['2']['dt'] * 1000));
		var time3 = this.formatDate(new Date(parsed_json['hourly']['3']['dt'] * 1000));
		var time4 = this.formatDate(new Date(parsed_json['hourly']['4']['dt'] * 1000));
		var time5 = this.formatDate(new Date(parsed_json['hourly']['5']['dt'] * 1000));

        // set states for fields so they could be rendered later on
        this.setState({
            HT1 : HT1,
			HT2 : HT2,
			HT3 : HT3,
			HT4 : HT4,
			HT5 : HT5,

			time1 : time1,
			time2 : time2,
			time3 : time3,
			time4 : time4,
			time5 : time5,
        });
    }

	parseResponse = (parsed_json) => {
		var location = parsed_json['name'];
		var temp_c = parsed_json['main']['temp'];
		var conditions = parsed_json['weather']['0']['description'];
		var min =  Math.round(parsed_json['main']['temp_min']);
		var max = Math.round(parsed_json['main']['temp_max']);
		var windSpeed = parsed_json['wind']['speed'];
		var icon = parsed_json['weather']['0']['icon'];
		var humidity = parsed_json['main']['humidity'];


		// set states for fields so they could be rendered later on
		this.setState({
			locate: location,
			temp: temp_c,
			cond : conditions,
			min : min,
			max : max,
			wind : windSpeed,
			image : icon,
			humidity : humidity,
		});
		document.getElementById('IMG').src = 'https://openweathermap.org/img/wn/' + this.state.image + '@2x.png';
		console.log(document.getElementById('IMG').src);
		document.getElementById('background').style.backgroundImage =  "url(../../assets/backgrounds/" + this.pickBackground() + ".jpg)";
	}

	//checking time of day for greeting
	isDay() {
		return (Date.now() + 60000 * new Date().getTimezoneOffset() + 21600000) % 86400000 / 3600000 > 12;
	}

	//Choosing the greeting message based on time
	whatGreeting(){
		if (!(this.isDay())){
			return greetings[0];
		}
		else{
			return greetings[1];
		}
	}

	//function for formatting date
	formatDate = (date) => {
		var hours = date.getHours();
		var ampm = hours >= 12 ? 'pm' : 'am';
		hours = hours % 12;
		hours = hours ? hours : 12;
		var strTime = hours + ' ' + ampm;
		return strTime;
	}

	pickBackground() {
		if (!(this.isDay())){
			return bg[1];
		}
		else if (this.state.cond.includes("rain") || this.state.cond.includes("drizzle")){
			return bg[0]
		}
		else if (this.state.cond.includes("snow")){
			return bg[4]
		}
		else if (this.state.cond.includes("sun") || this.state.cond.includes("clear")){
			return bg[2]
		}
		else if (this.state.cond.includes("cloud")){
			return bg[3]
		}
	}

	// the main render method for the iphone component
	render() {
		// check if temperature data is fetched, if so add the sign styling to the page
		const tempStyles = this.state.temp ? `${style.temperature} ${style.filled}` : style.temperature;
		
		// display all weather data
		return (
			<div class={ style.container } id = "background">
				<input type = "text" class = "search-bar" placeholder = "Enter your city" onKeyDown = {e => this.fetchWeatherData2(e.target.value)}></input>
				<div class={ style.city }>{ this.state.locate }</div>
				<h1>{this.whatGreeting()}</h1>
				<h2>Current conditions are {this.state.cond}</h2>
				<div><img id = 'IMG'/></div>
				<div class={ style.header }>
					<span class={ tempStyles }>{ this.state.temp }</span>
					<div class={ style.details }>
						<p>Min: {this.state.min} Max: {this.state.max}</p>
					</div>
				</div> 
				<div class={style.details}>
					<p>{this.state.time1} {this.state.HT1}</p>
					<p>{this.state.time2} {this.state.HT2}</p>
					<p>{this.state.time3} {this.state.HT3}</p>
					<p>{this.state.time4} {this.state.HT4}</p>
					<p>{this.state.time5} {this.state.HT5}</p>
				</div>
				<div class={ style.details }></div>
			</div>
		);
	}
}
