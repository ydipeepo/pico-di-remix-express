import { createGetProvider } from "pico-di-remix-express";
import Service1 from "./Service1";
import Service2 from "./Service2";
import Service3 from "./Service3";

type Context = {
	service1: Service1,
	service2: Service2,
	service3: Service3,
};

const getProvider = createGetProvider<Context>(builder => builder
	.addSingleton("service1", Service1)
	.addScoped("service2", Service2)
	.addTransient("service3", Service3));

export {
	getProvider,
	type Context,
	type Service1,
	type Service2,
	type Service3,
}
