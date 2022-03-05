// import preact
import { h, render, Component } from 'preact';
// import stylesheets for ipad & button
import style from './style';
import style_iphone from '../button/style_iphone';
// import jquery for API calls
import $ from 'jquery';
// import the Button component
import Button from '../button';

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
		// button display state
		this.setState({ display: true });
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
		// once the data grabbed, hide the button
		this.setState({ display: false });
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
		// once the data grabbed, hide the button
		this.setState({ display: false });
	}

	//function to deal with the hourly openweather API call
	parseHResponse = (parsed_json) => {
        var hourlyTemp = parsed_json['hourly']['temp'];

        // set states for fields so they could be rendered later on
        this.setState({
            hourlyTemp: hourlyTemp,
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

	// the main render method for the iphone component
	render() {
		// check if temperature data is fetched, if so add the sign styling to the page
		const tempStyles = this.state.temp ? `${style.temperature} ${style.filled}` : style.temperature;
		
		// display all weather data
		return (
			<div class={ style.container }>
				<div>{this.fetchHourly}</div>
				<h1>{this.whatGreeting()}</h1>
				<h2>Current conditions are {this.state.cond}</h2>
				<div><img id = 'IMG'/></div>
				<div class={ style.header }>
					<div class={ style.city }>{ this.state.locate }</div>
					<span class={ tempStyles }>{ this.state.temp }</span>
					<div class={ style.details }>
						<p>Min: {this.state.min} Max: {this.state.max}</p>
						<p>Current humidity {this.state.humidity}</p>
						<p>This is where hourly temp should be:{this.state.hourlyTemp}</p>
					</div>
				</div> 
				<div class={ style.details }></div>
				<div class= { style_iphone.container }> 
					{ this.state.display ? <Button class={ style_iphone.button } clickFunction={this.fetchWeatherData }/ > : null }
				</div>
			</div>
		);
	}
}
