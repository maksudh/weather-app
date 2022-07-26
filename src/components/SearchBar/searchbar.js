// import preact
import { h, render, Component } from 'preact';
// import style for searchbar
import style from './style'

//main class for searchbar
export default class SearchBar extends Component {

	// rendering searchbar
	render() {
		let enterFunction = this.props.enterFunction;
		if(typeof enterFunction !== 'function'){
			enterFunction = () => {
				console.log("passed something as 'enterFunction' that wasn't a function !");
			}
		}
		return (
			<div>
				<input class={style.searchbar} type = "text" placeholder = "Enter your city" onKeyDown = {enterFunction}></input>
			</div>
		);
	}
}
