import { type Context } from ".";

export default class Service2 {

	constructor({
		service1,
	}: Context) {
		console.log(Service2.name);
	}

	toString() {
		return Service2.name;
	}

}
