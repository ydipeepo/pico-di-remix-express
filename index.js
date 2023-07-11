"use strict";

const { defineProperty } = Object;

defineProperty(exports, "__esModule", { value: true });

const { broadcastDevReady, createRequestHandler: createRemixRequestHandler } = require("@remix-run/node");
const { createProvider } = require("pico-di");

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

const createGetLoadContext = ({
	provider,
	getLoadContext,
	scopeName,
}) => async (request, response) => {
	const exoticContext = await getLoadContext?.(request, response);
	const scope = provider?.beginScope();
	scope.name = scopeName ?? "RequestScope";
	return scope?.createContext(exoticContext) ?? exoticContext;
};

const createRequestHandler = ({
	mode,
	getLoadContext,
	build,
}) => {
	const provider = getProviderFromBuild(build, mode);
	return createRemixRequestHandler({
		build,
		getLoadContext: createGetLoadContext({
			getLoadContext,
			provider,
		}),
		mode,
	});
};

const createDevRequestHandler = ({
	getLoadContext,
	build,
	watch,
}) => {
	let provider = getProviderFromBuild(build, "development");
	watch?.((newBuild, broadcastReady) => {
		build = newBuild;
		provider = getProviderFromBuild(build, "development");
		if (broadcastReady) {
			broadcastDevReady(build);
		}
	});
	return (req, res, next) => {
		try {
			return createRemixRequestHandler({
				build,
				getLoadContext: createGetLoadContext({
					getLoadContext,
					provider,
					scopeName: "DevRequestScope",
				}),
				mode: "development",
			})(req, res, next);
		} catch (error) {
			next(error);
		}
	};
};

module.exports = {
	createGetProvider,
	getProviderFromBuild,
	createGetLoadContext,
	createRequestHandler,
	createDevRequestHandler,
};
