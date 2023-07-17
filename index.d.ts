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
 * Represents an additional dependent context for Remix.
 */
type RemixContext = {
	request: RemixRequest,
	req: Request,
	res: Response,
	env: typeof process.env,
};

/**
 * Creates new context type merged with the additional dependent context.
 * @template Context Dependent context type.
 */
type WithRemix<Context> = Context & RemixContext;

/**
 * Create new context names type that excludes additional context.
 */
type WithoutRemixName<Context, Name extends keyof Context = keyof Context> = Exclude<Name, keyof RemixContext>;

/**
 * Creates a provider get function.
 * The created function must be exported from `entry.server`.
 * @param build Callback function that receives a builder and registers services into the registry.
 * @template Context Dependent context type.
 */
declare function createGetProvider<Context>(build: ServiceRegistry.BuildFunction<Context, WithoutRemixName<Context>>): GetProviderFunction<Context>;

/**
 * Represents a function that sets the server build.
 */
type SetNextBuildFunction = {
	(nextBuild: ServerBuild): void,
};

/**
 * Represents a function (callback) that watches for server build changes.
 */
type WatchFunction = {
	(setNextBuild: SetNextBuildFunction): void,
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

export {
	createGetProvider,
	createRequestHandler,
	getProviderFromBuild,
	type GetProviderFunction,
	type SetNextBuildFunction,
	type WatchFunction,
	type LoaderArgs,
	type LoaderFunction,
	type ActionArgs,
	type ActionFunction,
	type WithRemix,
	type WithoutRemixName,
}
