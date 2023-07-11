import {
	type ServerBuild,
	type LoaderArgs as RemixLoaderArgs,
	type LoaderFunction as RemixLoaderFunction,
	type ActionArgs as RemixActionArgs,
	type ActionFunction as RemixActionFunction,
} from "@remix-run/node";
import { type GetLoadContextFunction, type RequestHandler } from "@remix-run/express";
import { type ServiceProvider, type ServiceRegistry } from "pico-di";

/**
 * Represents a function to retrieve the provider.
 */
type GetProviderFunction<Context> = {
	(mode: "development" | "test" | "production"): ServiceProvider<Context>,
};

/**
 * Creates a `GetProviderFunction` function.
 * @param build Callback function that receives a builder and registers services into the registry.
 */
declare function createGetProvider<Context>(build: ServiceRegistry.BuildFunction<Context>): GetProviderFunction<Context>;

/**
 * Gets the service provider from the server build.
 * @param build Server build.
 * @param mode Same value as environment variable NODE_ENV.
 */
declare function getProviderFromBuild<Context>(build: ServerBuild, mode: "development" | "test" | "production"): ServiceProvider<Context> | null;

/**
 * Creates a getLoadContext function that returns the dependent context.
 */
declare function createGetLoadContext<Context>(init: {
	/**
	 * Service provider.
	 */
	provider: ServiceProvider<Context> | null,

	/**
	 * If this function is defined,
	 * it is merged into the dependent context. (optional)
	 */
	getLoadContext?: GetLoadContextFunction,

	/**
	 * Scope name. (optional)
	 */
	scopeName?: string,
}): GetLoadContextFunction;

/**
 * Create a Remix request handler for express.
 */
declare function createRequestHandler(init: {
	/**
	 * Same value as environment variable NODE_ENV.
	 */
	mode: "development" | "test" | "production",

	/**
	 * Server build.
	 */
	build: ServerBuild,

	/**
	 * If this function is defined,
	 * it is merged into the dependent context. (optional)
	 */
	getLoadContext?: GetLoadContextFunction,
}): RequestHandler;

/**
 * Create a Remix dev request handler for express.
 */
declare function createDevRequestHandler(init: {
	/**
	 * Server build.
	 */
	build: ServerBuild,

	/**
	 * Callback to notify reload of server build.
	 */
	watch?: (setBuild: (build: ServerBuild, broadcastReady: boolean) => void) => void,

	/**
	 * If this function is defined,
	 * it is merged into the dependent context. (optional)
	 */
	getLoadContext?: GetLoadContextFunction,
}): RequestHandler;

/**
 * Represents a loader argument type that includes a dependent context type.
 */
type LoaderArgs<Context> = {
	context: Context,
} & RemixLoaderArgs;

/**
 * Represents a loader function type that includes a dependent context type.
 */
type LoaderFunction<Context> = (args: LoaderArgs<Context>) => ReturnType<RemixLoaderFunction>;

/**
 * Represents an action argument type that includes a dependent context type.
 */
type ActionArgs<Context> = {
	context: Context,
} & RemixActionArgs;

/**
 * Represents an action function type that includes a dependent context type.
 */
type ActionFunction<Context> = (args: ActionArgs<Context>) => ReturnType<RemixActionFunction>;

export {
	createGetProvider,
	createRequestHandler,
	createDevRequestHandler,
	createGetLoadContext,
	getProviderFromBuild,
	type GetProviderFunction,
	type LoaderArgs,
	type LoaderFunction,
	type ActionArgs,
	type ActionFunction,
}
