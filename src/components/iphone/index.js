// import preact
import { h, render, Component, useRef } from 'preact';
// import stylesheets for ipad & button
import style from './style';
// import jquery for API calls
import $ from 'jquery';
// import Searchbar component for search bar
import SearchBar from '../SearchBar/searchbar';


//import status alert and notif styles
import StatusAlert, { StatusAlertService } from 'preact-status-alert';
import 'preact-status-alert/dist/status-alert.css';


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

// main class for iphone component 
export default class Iphone extends Component {
//var Iphone = React.createClass({

	// a constructor with initial set states
	constructor(props){
		super(props);

		//bind notif events
		this.state.alertId = "";
		this.showDetailedNotification = this.showDetailedNotification.bind(this);
		this.showSimpleNotification = this.showSimpleNotification.bind(this);
		this.showWeatherWarning = this.showWeatherWarning.bind(this);
		this.removeAlert = this.removeAlert.bind(this);

		// temperature state
		this.state.temp = "";
		this.fetchWeatherData();
		this.fetchHourly(51.5085, -0.1257);
		this.fetchWeatherWarning(51.5085, -0.1257);

		// hourly notifs
		this.hourlyNotifications();
	}

	// to make the weather conditions look nicer
	capitalize(str) {
		return str.charAt(0).
			toUpperCase() + str.slice(1);
	}

	// function for hourly notifications 
	hourlyNotifications(){

		var nextDate = new Date();

		if (nextDate.getMinutes() == 0) { // check if is currently on the hour
			this.hourlyTimer()
		} else {
			nextDate.setHours(nextDate.getHours()+1); 
			nextDate.setMinutes(0);
			nextDate.setSeconds(0);

			var difference = nextDate - new Date(); // delay until hour
			console.log("difference: " + difference);
			setTimeout(this.hourlyTimer, difference); // call timer

		}
	}

	// timer for hourlyNotifications 
	hourlyTimer = () =>{
		var timeout = setTimeout(this.showDetailedNotification, 1000 * 5); // waits 5 seconds in case app is opened on the hour and API call hasn't finished
		var interval = setInterval(this.showDetailedNotification, 1000 * 60 * 60); // hour timer
	}

	// shows a simplified version of the notification, with larger minimal style
	showSimpleNotification() {

		const imgSrc = 'https://openweathermap.org/img/wn/' + this.state.image + '@2x.png';
		const simpleNotification = (
			<div onClick={this.removeAlert} class={style.notifContentSimple}> 
				<img src={imgSrc} />
				<div class={style.avgTempSimple}>{this.state.temp}°</div>
				<div class={style.conditionsSimple}>{this.capitalize(this.state.cond)}</div>
			</div>
		)

		const alertId = StatusAlertService.showInfo(simpleNotification, { autoHide: false, withIcon: false, withCloseIcon: false });
		this.setState({ alertId });
	}

	// shows full weather info with min max details 
	showDetailedNotification = () => {

		const imgSrc = 'https://openweathermap.org/img/wn/' + this.state.image + '@2x.png';
		const detailedNotification = (
			<div onClick={this.removeAlert} class={style.notifContent}>
				<div class={style.weatherIcon}><img class={style.weatherIconImg} src={imgSrc} /></div>
				<div class={style.avgTemp}>{this.state.temp}°</div>
				<div class={style.tempRange}>
					<div class={style.temps}><img class={style.tempsPics} src="../../assets/icons/up1.png" /><p class={style.tempsText}>{this.state.max}°</p></div>
					<div class={style.temps}><img class={style.tempsPics} src="../../assets/icons/down1.png" /><p class={style.tempsText}>{this.state.min}° </p></div>
				</div>
				<div class={style.precipitation}>{this.state.percipitation}%</div>
				<div class={style.conditions}>{this.capitalize(this.state.cond)}</div>
			</div>
		)

		const alertId = StatusAlertService.showInfo(detailedNotification, { autoHide: false, withIcon: false, withCloseIcon: false });
		this.setState({ alertId });
	}


	// shows weather warning from API
	showWeatherWarning() {

		var message;

		// if there are currently no weather alerts, shows the default
		if (this.state.alerts && this.state.alerts.length > 0) {
			message = this.state.alerts[0]['description'];
		} else {
			message = this.state.defaultAlerts[0]['description'];
		}
		// warning notification pop up 
		const warningNotification = (
			<div class={style.warningContent} >
				<img class={style.warningIcon} src="../../assets/icons/warning-icon.png" />
				<div class={style.warningHeader}>WARNING</div>
				<div class={style.warningMessage}>{message}</div>
			</div>
		)

		const alertId = StatusAlertService.showWarning(warningNotification, { autoHide: false, withIcon: false, withCloseIcon: true });
		this.setState({ alertId });

	}
	// simple function to remove alerts after they're read
	removeAlert() {
		StatusAlertService.removeAlert(this.state.alertId);
	}

	// gets weather alerts from weatherbit
	fetchWeatherWarning = (lat, long) => {
		var url = "https://api.weatherbit.io/v2.0/alerts?lat=" + lat + "&lon=" + long + "&key=8c2183bcd39741d39f3b07f61dc72865";

		console.log()

		$.ajax({
			url: url,
			dataType: "json",
			success: this.parseWarning,
			async: true,
			error: function (req, err) { console.log('API call failed ' + err); }
		})
	}
	// gets alert data from the api 
	parseWarning = (parsed_json) => {
		//default alert
		var defaultAlerts = [

		]

		var alerts = parsed_json['alerts'];

		this.setState({
			alerts: alerts,
			defaultAlerts: defaultAlerts
		});

		// if there is an alert, show the warning
		if (this.state.alerts && this.state.alerts.length > 0) {
			this.showWeatherWarning();
		}


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
	fetchHourly(latitude, longitude){
		var url = "http://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&exclude=current,minutely,alerts&units=Metric&appid=a6d681a3dba55941eeb547ea241befa1";

		$.ajax({
			url: url,
			dataType: "json",
			success : this.parseHResponse,
			async: true,
			error : function(req, err){ console.log('API call failed ' + err + ', ' + APIKEY); }
		})
	}
	// gets weather data for locales in the searchbar
	fetchWeatherData2(query){
		if(event.key === 'Enter'){
			var a = "http://api.openweathermap.org/data/2.5/weather?q="
			var b = "&units=metric&APPID=a6d681a3dba55941eeb547ea241befa1";
			$.ajax({
				url: a + query + b,
				dataType: "jsonp",
				success : this.parseResponse,
				error : function(req, err){ console.log('API call failed ' + err); }
			})
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

	//checking time of day for greeting
	isDay() {
		if (!!this.state.timezone){
			var utc = Date.now() + (new Date().getTimezoneOffset()*60000) + (1000 * this.state.timezone);
			var fullDate = new Date(utc);
			var hour = fullDate.getHours();
			return (hour > 5 && hour < 19);
		} else {
			var utc = Date.now() + (new Date().getTimezoneOffset()*60000) + (1000 );
			var fullDate = new Date(utc);
			var hour = fullDate.getHours();
			return (hour > 5 && hour < 19);
		}
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

	// method to sort out the background images with weather conditions
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
		else if (this.state.cond.includes("cloud") || this.state.cond.includes("mist") || this.state.cond.includes("thunderstorm")){
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


					<StatusAlert />


					<SearchBar class="search-bar" enterFunction={ e => this.fetchWeatherData2(e.target.value)}/>
					<div class={ style.city }>{ this.state.locate }</div>
					<div class= { style.greetings }>
						<h1>{this.whatGreeting()}</h1>
						<h2>Current conditions are {this.state.cond}</h2>
					</div>
					<div class={style.city}>
						<img id = 'IMG'/>
					</div>
					<div class={ style.header }>
						<span class={ tempStyles }>{ this.state.temp }</span>
						<div class={ style.details}>
							<p><img id = 'dmain' src = "../../assets/icons/down1.png"/> <b> {this.state.min}° </b><img id = 'umain' src = "../../assets/icons/up1.png"/> <b>{this.state.max}°</b></p>
						</div>
					</div>
					<div class = {style.timeContainer}>
						<div class = {style.time}>
							<p>{this.state.time1}</p>
							<img id = "hour1"/>
							<p>{this.state.HT1}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.time2}</p>
							<img id = "hour2"/>
							<p>{this.state.HT2}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.time3}</p>
							<img id = "hour3"/>
							<p>{this.state.HT3}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.time4}</p>
							<img id = "hour4"/>
							<p>{this.state.HT4}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.time5}</p>
							<img id = "hour5"/>
							<p>{this.state.HT5}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.time6}</p>
							<img id = "hour6"/>
							<p>{this.state.HT6}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.time7}</p>
							<img id = "hour7"/>
							<p>{this.state.HT7}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.time8}</p>
							<img id = "hour8"/>
							<p>{this.state.HT8}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.time9}</p>
							<img id = "hour9"/>
							<p>{this.state.HT9}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.time10}</p>
							<img id = "hour10"/>
							<p>{this.state.HT10}°</p>
						</div>
					</div>
					<div class = {style.timeContainer}>
						<div class ={style.info}>
							<p><b>Precipitation: </b>{this.state.percipitation}%</p>
							<p><b>Wind: </b>{this.state.wind} mps</p>
							<p><b>UV index: </b>{this.state.uv}</p>
							<p><b>Humidity: </b>{this.state.humidity}%</p>
						</div>
						<div class ={style.infoInner}>
							<p><b>Air pressure: </b>{this.state.pressure} hPa</p>
							<p><b>Clouds: </b>{this.state.clouds}%</p>
							<p><b>Visibility: </b>{this.state.visibility}m</p>
							<p><b>Dew point: </b>{this.state.dew}°</p>
						</div>
					</div>
					<div class = {style.timeContainer}>
						<div class = {style.time}>
							<p>{this.state.dow1}</p>
							<img id = "day1"/>
							<p><img id = "up2" src='../../assets/icons/up1.png'/> {this.state.d1max}°</p>
							<p><img id = "down2" src='../../assets/icons/down1.png'/> {this.state.d1min}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.dow2}</p>
							<img id = "day2"/>
							<p><img id = "up3" src='../../assets/icons/up1.png'/> {this.state.d2max}°</p>
							<p><img id = "down3" src='../../assets/icons/down1.png'/> {this.state.d2min}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.dow3}</p>
							<img id = "day3"/>
							<p><img id = "up4" src='../../assets/icons/up1.png'/> {this.state.d3max}°</p>
							<p><img id = "down4" src='../../assets/icons/down1.png'/> {this.state.d3min}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.dow4}</p>
							<img id = "day4"/>
							<p><img id = "up5" src='../../assets/icons/up1.png'/> {this.state.d4max}°</p>
							<p><img id = "down5" src='../../assets/icons/down1.png'/> {this.state.d4min}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.dow5}</p>
							<img id = "day5"/>
							<p><img id = "up6" src='../../assets/icons/up1.png'/> {this.state.d5max}°</p>
							<p><img id = "down6" src='../../assets/icons/down1.png'/> {this.state.d5min}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.dow6}</p>
							<img id = "day6"/>
							<p><img id = "up7" src='../../assets/icons/up1.png'/> {this.state.d6max}°</p>
							<p><img id = "down7" src='../../assets/icons/down1.png'/> {this.state.d6min}°</p>
						</div>
						<div class = {style.time}>
							<p>{this.state.dow7}</p>
							<img id = "day7"/>
							<p><img id = "up8" src='../../assets/icons/up1.png'/> {this.state.d7max}°</p>
							<p><img id = "down8" src='../../assets/icons/down1.png'/> {this.state.d7min}°</p>
						</div>
					</div>
					<div class={ style.details }></div>
			</div>
		);
	}

	// gets weather data for current weather conidtions from the api
	parseResponse = (parsed_json) => {
		var location = parsed_json['name'];
		var temp_c = Math.round(parsed_json['main']['temp']);
		var conditions = parsed_json['weather']['0']['description'];
		var icon = parsed_json['weather']['0']['icon'];
		var max = Math.round(parsed_json['main']['temp_max']);
		var min = Math.round(parsed_json['main']['temp_min']);
		var timezone = parsed_json['timezone'];
		var latitude = parsed_json["coord"]["lat"];
		var longitude = parsed_json["coord"]["lon"];

		// set states for fields so they could be rendered later on
		this.setState({
			locate: location,
			temp: temp_c,
			cond: conditions,
			image: icon,
			max: max,
			min: min,
			timezone : timezone,
			lat : latitude,
			lon : longitude
		});
		document.getElementById('IMG').src = 'https://openweathermap.org/img/wn/' + this.state.image +'@2x.png';
		console.log(document.getElementById('IMG').src);
		document.getElementById('background').style.backgroundImage =  "url(../../assets/backgrounds/" + this.pickBackground() + ".jpg)";

		this.fetchHourly(this.state.lat, this.state.lon);
		this.fetchWeatherWarning(this.state.lat, this.state.lon);
	}

	//function to deal with the hourly openweather API call
	parseHResponse = (parsed_json) => {
		var HT1 = Math.round(parsed_json['hourly']['1']['temp']);
		var HT2 = Math.round(parsed_json['hourly']['2']['temp']);
		var HT3 = Math.round(parsed_json['hourly']['3']['temp']);
		var HT4 = Math.round(parsed_json['hourly']['4']['temp']);
		var HT5 = Math.round(parsed_json['hourly']['5']['temp']);
		var HT6 = Math.round(parsed_json['hourly']['6']['temp']);
		var HT7 = Math.round(parsed_json['hourly']['7']['temp']);
		var HT8 = Math.round(parsed_json['hourly']['8']['temp']);
		var HT9 = Math.round(parsed_json['hourly']['9']['temp']);
		var HT10 = Math.round(parsed_json['hourly']['10']['temp']);

		var dtime1 = new Date((parsed_json['daily']['1']['dt'])*1000);
		var dow1 = dtime1.toLocaleString("en-US", {weekday: "short"});

		var dtime2 = new Date((parsed_json['daily']['2']['dt'])*1000);
		var dow2 = dtime2.toLocaleString("en-US", {weekday: "short"});

		var dtime3 = new Date((parsed_json['daily']['3']['dt'])*1000);
		var dow3 = dtime3.toLocaleString("en-US", {weekday: "short"});

		var dtime4 = new Date((parsed_json['daily']['4']['dt'])*1000);
		var dow4 = dtime4.toLocaleString("en-US", {weekday: "short"});

		var dtime5 = new Date((parsed_json['daily']['5']['dt'])*1000);
		var dow5 = dtime5.toLocaleString("en-US", {weekday: "short"});

		var dtime6 = new Date((parsed_json['daily']['6']['dt'])*1000);
		var dow6 = dtime6.toLocaleString("en-US", {weekday: "short"});

		var dtime7 = new Date((parsed_json['daily']['7']['dt'])*1000);
		var dow7 = dtime7.toLocaleString("en-US", {weekday: "short"});

		var d1max = Math.round(parsed_json['daily']['1']['temp']['max']);
		var d2max = Math.round(parsed_json['daily']['2']['temp']['max']);
		var d3max = Math.round(parsed_json['daily']['3']['temp']['max']);
		var d4max = Math.round(parsed_json['daily']['4']['temp']['max']);
		var d5max = Math.round(parsed_json['daily']['5']['temp']['max']);
		var d6max = Math.round(parsed_json['daily']['6']['temp']['max']);
		var d7max = Math.round(parsed_json['daily']['7']['temp']['max']);

		var d1min = Math.round(parsed_json['daily']['1']['temp']['min']);
		var d2min = Math.round(parsed_json['daily']['2']['temp']['min']);
		var d3min = Math.round(parsed_json['daily']['3']['temp']['min']);
		var d4min = Math.round(parsed_json['daily']['4']['temp']['min']);
		var d5min = Math.round(parsed_json['daily']['5']['temp']['min']);
		var d6min = Math.round(parsed_json['daily']['6']['temp']['min']);
		var d7min = Math.round(parsed_json['daily']['7']['temp']['min']);

		var di1 = parsed_json['daily']['1']['weather']['0']['icon'];
		var di2 = parsed_json['daily']['2']['weather']['0']['icon'];
		var di3 = parsed_json['daily']['3']['weather']['0']['icon'];
		var di4 = parsed_json['daily']['4']['weather']['0']['icon'];
		var di5 = parsed_json['daily']['5']['weather']['0']['icon'];
		var di6 = parsed_json['daily']['6']['weather']['0']['icon'];
		var di7 = parsed_json['daily']['7']['weather']['0']['icon'];


		var icon1 = parsed_json['hourly']['1']['weather']['0']['icon'];
		var icon2 = parsed_json['hourly']['2']['weather']['0']['icon'];
		var icon3 = parsed_json['hourly']['3']['weather']['0']['icon'];
		var icon4 = parsed_json['hourly']['4']['weather']['0']['icon'];
		var icon5 = parsed_json['hourly']['5']['weather']['0']['icon'];
		var icon6 = parsed_json['hourly']['6']['weather']['0']['icon'];
		var icon7 = parsed_json['hourly']['7']['weather']['0']['icon'];
		var icon8 = parsed_json['hourly']['8']['weather']['0']['icon'];
		var icon9 = parsed_json['hourly']['9']['weather']['0']['icon'];
		var icon10 = parsed_json['hourly']['10']['weather']['0']['icon'];

		var time1 = this.formatDate(new Date((parsed_json['hourly']['1']['dt']+this.state.timezone) * 1000));
		var time2 = this.formatDate(new Date((parsed_json['hourly']['2']['dt']+this.state.timezone) * 1000));
		var time3 = this.formatDate(new Date((parsed_json['hourly']['3']['dt']+this.state.timezone) * 1000));
		var time4 = this.formatDate(new Date((parsed_json['hourly']['4']['dt']+this.state.timezone) * 1000));
		var time5 = this.formatDate(new Date((parsed_json['hourly']['5']['dt']+this.state.timezone) * 1000));
		var time6 = this.formatDate(new Date((parsed_json['hourly']['6']['dt']+this.state.timezone) * 1000));
		var time7 = this.formatDate(new Date((parsed_json['hourly']['7']['dt']+this.state.timezone) * 1000));
		var time8 = this.formatDate(new Date((parsed_json['hourly']['8']['dt']+this.state.timezone) * 1000));
		var time9 = this.formatDate(new Date((parsed_json['hourly']['9']['dt']+this.state.timezone) * 1000));
		var time10 = this.formatDate(new Date((parsed_json['hourly']['10']['dt']+this.state.timezone) * 1000));

		var wind = parsed_json['hourly']['0']['wind_speed'];
		var pressure = parsed_json['hourly']['0']['pressure'];
		var humidity = parsed_json['hourly']['0']['humidity'];
		var uv = parsed_json['hourly']['0']['uvi'];
		var percipitation = parsed_json['hourly']['0']['pop']
		var clouds = parsed_json['hourly']['0']['clouds'];
		var visibility = parsed_json['hourly']['0']['visibility'];
		var dew = parsed_json['hourly']['0']['dew_point'];


		// set states for fields so they could be rendered later on
		this.setState({
				HT1 : HT1,
				HT2 : HT2,
				HT3 : HT3,
				HT4 : HT4,
				HT5 : HT5,
				HT6 : HT6,
				HT7 : HT7,
				HT8 : HT8,
				HT9 : HT9,
				HT10 : HT10,

				d1max : d1max,
				d2max : d2max,
				d3max : d3max,
				d4max : d4max,
				d5max : d5max,
				d6max : d6max,
				d7max : d7max,

				dtime1 : dtime1,
				dtime2 : dtime2,
				dtime3 : dtime3,
				dtime4 : dtime4,
				dtime5 : dtime5,
				dtime6 : dtime6,
				dtime7 : dtime7,

				dow1 : dow1,
				dow2 : dow2,
				dow3 : dow3,
				dow4 : dow4,
				dow5 : dow5,
				dow6 : dow6,
				dow7 : dow7,

				d1min : d1min,
				d2min : d2min,
				d3min : d3min,
				d4min : d4min,
				d5min : d5min,
				d6min : d6min,
				d7min : d7min,

				di1 : di1,
				di2 : di2,
				di3 : di3,
				di4 : di4,
				di5 : di5,
				di6 : di6,
				di7 : di7,

				icon1 : icon1,
				icon2 : icon2,
				icon3 : icon3,
				icon4 : icon4,
				icon5 : icon5,
				icon6 : icon6,
				icon7 : icon7,
				icon8 : icon8,
				icon9 : icon9,
				icon10 : icon10,

				time1 : time1,
				time2 : time2,
				time3 : time3,
				time4 : time4,
				time5 : time5,
				time6 : time6,
				time7 : time7,
				time8 : time8,
				time9 : time9,
				time10 : time10,

				wind: wind,
				pressure : pressure,
				humidity : humidity,
				uv : uv,
				percipitation : percipitation,
				clouds : clouds,
				visibility : visibility,
				dew : dew,

		});

		// calls for all icons from the api
		document.getElementById('hour1').src = 'https://openweathermap.org/img/wn/' + this.state.icon1 +'@2x.png';
		console.log(document.getElementById('hour1').src);

		document.getElementById('hour2').src = 'https://openweathermap.org/img/wn/' + this.state.icon2 +'@2x.png';
		console.log(document.getElementById('hour2').src);

		document.getElementById('hour3').src = 'https://openweathermap.org/img/wn/' + this.state.icon3 +'@2x.png';
		console.log(document.getElementById('hour3').src);

		document.getElementById('hour4').src = 'https://openweathermap.org/img/wn/' + this.state.icon4 +'@2x.png';
		console.log(document.getElementById('hour4').src);

		document.getElementById('hour5').src = 'https://openweathermap.org/img/wn/' + this.state.icon5 +'@2x.png';
		console.log(document.getElementById('hour5').src)

		document.getElementById('hour6').src = 'https://openweathermap.org/img/wn/' + this.state.icon6 +'@2x.png';
		console.log(document.getElementById('hour6').src)

		document.getElementById('hour7').src = 'https://openweathermap.org/img/wn/' + this.state.icon7 +'@2x.png';
		console.log(document.getElementById('hour7').src)

		document.getElementById('hour8').src = 'https://openweathermap.org/img/wn/' + this.state.icon8 +'@2x.png';
		console.log(document.getElementById('hour8').src)

		document.getElementById('hour9').src = 'https://openweathermap.org/img/wn/' + this.state.icon9 +'@2x.png';
		console.log(document.getElementById('hour9').src)

		document.getElementById('hour10').src = 'https://openweathermap.org/img/wn/' + this.state.icon10 +'@2x.png';
		console.log(document.getElementById('hour10').src)


		document.getElementById('day1').src = 'https://openweathermap.org/img/wn/' + this.state.di1 +'@2x.png';
		console.log(document.getElementById('day1').src);

		document.getElementById('day2').src = 'https://openweathermap.org/img/wn/' + this.state.di2 +'@2x.png';
		console.log(document.getElementById('day2').src);

		document.getElementById('day3').src = 'https://openweathermap.org/img/wn/' + this.state.di3 +'@2x.png';
		console.log(document.getElementById('day3').src);

		document.getElementById('day4').src = 'https://openweathermap.org/img/wn/' + this.state.di4 +'@2x.png';
		console.log(document.getElementById('day4').src);

		document.getElementById('day5').src = 'https://openweathermap.org/img/wn/' + this.state.di5 +'@2x.png';
		console.log(document.getElementById('day5').src);

		document.getElementById('day6').src = 'https://openweathermap.org/img/wn/' + this.state.di6 +'@2x.png';
		console.log(document.getElementById('day6').src);

		document.getElementById('day7').src = 'https://openweathermap.org/img/wn/' + this.state.di7 +'@2x.png';
		console.log(document.getElementById('day7').src);
    }
}
