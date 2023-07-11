import { type Context } from ".";

export default class Service3 {

	constructor({
		service1,
		service2,
	}: Context) {
		console.log(Service3.name);
	}

	toString() {
		return Service3.name;
	}

}
