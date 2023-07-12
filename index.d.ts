import { type Request, type Response } from "express";
import {
	type ServerBuild,
	type LoaderArgs as RemixLoaderArgs,
	type LoaderFunction as RemixLoaderFunction,
	type ActionArgs as RemixActionArgs,
	type ActionFunction as RemixActionFunction,
	type Request as RemixRequest,
} from "@remix-run/node";
import { type GetLoadContextFunction, type RequestHandler } from "@remix-run/express";
import { type ServiceProvider, type ServiceRegistry } from "pico-di";

/**
 * Represents a provider get function.
 * @template Context Dependent context type.
 */
type GetProviderFunction<Context> = {
	(mode: typeof process.env["NODE_ENV"]): ServiceProvider<Context>,
};

/**
 * Creates a provider get function.
 * The created function must be exported from `entry.server`.
 * @param build Callback function that receives a builder and registers services into the registry.
 * @template Context Dependent context type.
 */
declare function createGetProvider<Context>(build: ServiceRegistry.BuildFunction<Context>): GetProviderFunction<Context>;

/**
 * Represents a function that sets the server build.
 */
type SetBuildFunction = {
	(newBuild: ServerBuild): void,
};

/**
 * Represents a function (callback) that watches for server build changes.
 */
type WatchFunction = {
	(setBuild: SetBuildFunction): void,
};

/**
 * Create a Remix request handler for express.
 */
declare function createRequestHandler(init: {
	/**
	 * Mode.
	 * Same value as environment variable `process.env.NODE_ENV`.
	 */
	mode: typeof process.env["NODE_ENV"],

	/**
	 * Function to get load context. (optional)
	 * If this function is defined, returned value is merged into the dependent context.
	 */
	getLoadContext?: GetLoadContextFunction,

	/**
	 * Initial server build.
	 */
	build: ServerBuild,

	/**
	 * Function that watches for server build changes and set it to the request handler.
	 * This is only enabled in development mode.
	 */
	watch?: WatchFunction,

	/**
	 * Service scope name. (optional)
	 */
	scopeName?: string,
}): RequestHandler;

/**
 * Retrieves the service provider from the specified server build.
 * @param build Server build.
 * @param mode Mode. Same value as environment variable `process.env.NODE_ENV`.
 * @template Context Dependent context type.
 */
declare function getProviderFromBuild<Context>(build: ServerBuild, mode: typeof process.env["NODE_ENV"]): ServiceProvider<Context> | null;

/**
 * Represents a loader argument type that includes a dependent context type.
 * @template Context Dependent context type.
 */
type LoaderArgs<Context> = {
	context: Context,
} & RemixLoaderArgs;

/**
 * Represents a loader function type that includes a dependent context type.
 * @template Context Dependent context type.
 */
type LoaderFunction<Context> = (args: LoaderArgs<Context>) => ReturnType<RemixLoaderFunction>;

/**
 * Represents an action argument type that includes a dependent context type.
 * @template Context Dependent context type.
 */
type ActionArgs<Context> = {
	context: Context,
} & RemixActionArgs;

/**
 * Represents an action function type that includes a dependent context type.
 * @template Context Dependent context type.
 */
type ActionFunction<Context> = (args: ActionArgs<Context>) => ReturnType<RemixActionFunction>;

/**
 * Creates new context type merged with Remix request `request`.
 * @template Context Dependent context type.
 */
type WithRequest<Context> = {
	request: RemixRequest,
} & Context;

/**
 * Creates new context type merged with express request `req`.
 * @template Context Dependent context type.
 */
type WithReq<Context> = {
	req: Request,
} & Context;

/**
 * Creates new context type merged with express response `res`.
 * @template Context Dependent context type.
 */
type WithRes<Context> = {
	req: Response,
} & Context;

/**
 * Creates new context type merged with `process.env` `env`.
 * @template Context Dependent context type.
 */
type WithEnv<Context> = {
	env: typeof process["env"],
} & Context;

export {
	createGetProvider,
	createRequestHandler,
	getProviderFromBuild,
	type GetProviderFunction,
	type SetBuildFunction,
	type WatchFunction,
	type LoaderArgs,
	type LoaderFunction,
	type ActionArgs,
	type ActionFunction,
	type WithRequest,
	type WithReq,
	type WithRes,
	type WithEnv,
}
