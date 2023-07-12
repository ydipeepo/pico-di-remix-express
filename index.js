"use strict";

const {
	createRequestHandler: createRemixRequestHandler,
	writeReadableStreamToWritable,
	AbortController,
	Headers,
	Request,
} = require("@remix-run/node");
const { createProvider } = require("pico-di");
const { isArray } = Array;
const { defineProperty, entries } = Object;

const createGetProvider = build => {
	const provider = createProvider(build);
	return mode => {
		if (mode === "development") {
			let message;
			for (const name of provider.registry.names) {
				message ??= ["Registered service(s):"];
				message.push(`- ${name}: ${provider.registry.get(name).lifetime}`);
			}
			console.log(message === undefined
				? "There is no registered service."
				: message.join("\n"));
		}
		return provider;
	};
};

const createRemixRequest = (req, res) => {
	const url = new URL(`${req.protocol}://${req.get("host")}${req.url}`);
	const controller = new AbortController();
	res.on("close", () => controller.abort());
	const headers = new Headers();
	for (const [key, values] of entries(req.headers)) {
		if (values) {
			if (isArray(values)) {
				for (const value of values) {
					headers.append(key, value);
				}
			} else {
				headers.set(key, values);
			}
		}
	}
	const init = {
		method: req.method,
		signal: controller.signal,
		headers,
	};
	if (req.method !== "GET" && req.method !== "HEAD") {
		init.body = req;
	}
	return new Request(url.href, init);
};

const sendRemixResponse = async (res, response) => {
	res.statusMessage = response.statusText;
	res.status(response.status);
	for (const [key, values] of entries(response.headers.raw())) {
		for (const value of values) {
			res.append(key, value);
		}
	}
	if (response.body) {
		await writeReadableStreamToWritable(response.body, res);
	} else {
		res.end();
	}
};

const createRequestHandler = ({
	mode,
	getLoadContext = getDefaultLoadContext,
	build,
	watch,
	scopeName = "RequestScope",
}) => {
	const handleRequest = createRemixRequestHandler(build, mode);
	let provider = getProviderFromBuild(build, mode);
	if (watch !== undefined && mode === "development") {
		watch(newBuild => {
			build = newBuild;
			provider = getProviderFromBuild(build, mode);
		});
	}
	return async (req, res, next) => {
		try {
			const request = createRemixRequest(req, res);
			let loadContext = await getLoadContext(req, res);
			if (provider !== undefined) {
				const scope = provider.beginScope();
				scope.name = scopeName;
				loadContext = scope.createContext({
					...loadContext,
					// env: process.env,
					// req,
					// res,
					request,
				});
			}
			const response = await handleRequest(request, loadContext);
			await sendRemixResponse(res, response);
		} catch (error) {
			next(error);
		}
	};
};

const getDefaultLoadContext = (req, res) => ({
	req,
	res,
	env: process.env,
});

const getProviderFromBuild = (build, mode) => {
	if ("getProvider" in build.entry.module) {
		const getProvider = build.entry.module["getProvider"];
		if (getProvider !== undefined) {
			return getProvider(mode);
		}
	}
	console.warn("`getProvider` is not exported at: `entry.server`");
	return null;
};

defineProperty(exports, "__esModule", { value: true });

module.exports = {
	createGetProvider,
	createRequestHandler,
	getProviderFromBuild,
};
