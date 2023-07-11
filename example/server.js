import * as fs from "node:fs";

import { broadcastDevReady, installGlobals } from "@remix-run/node";
import { createRequestHandler } from "@remix-run/express";
import { createGetLoadContext, getProviderFromBuild } from "pico-di-remix-express";
import { watch } from "chokidar";
import compression from "compression";
import express from "express";
import morgan from "morgan";

installGlobals();

const BUILD_PATH = "./build/index.js";
const PORT = process.env.PORT || 3000;
const MODE = process.env.NODE_ENV;

/**
 * @type { import('@remix-run/node').ServerBuild | Promise<import('@remix-run/node').ServerBuild> }
 */
let build = await import(BUILD_PATH);

const createRequestHandlerAndProvider = () => {
	let provider = getProviderFromBuild(build, MODE);
	if (MODE === "development") {
		const watcher = watch(BUILD_PATH, { ignoreInitial: true });
		watcher.on("all", async () => {
			const stat = fs.statSync(BUILD_PATH);
			build = await import(BUILD_PATH + "?t=" + stat.mtimeMs);
			provider = getProviderFromBuild(build, MODE);
			broadcastDevReady(build);
		});
		return (req, res, next) => {
			try {
				return createRequestHandler({
					build,
					getLoadContext: createGetLoadContext({
						provider,
						scopeName: "DevRequestScope",
					}),
					mode: "development",
				})(req, res, next);
			} catch (error) {
				next(error);
			}
		};
	} else {
		return createRequestHandler({
			build,
			getLoadContext: createGetLoadContext({
				provider,
				scopeName: "RequestScope",
			}),
			mode: MODE,
		});
	}
};

const app = express();
app.use(compression());
app.disable("x-powered-by");
app.use("/build", express.static("public/build", { immutable: true, maxAge: "1y" }));
app.use(express.static("public", { maxAge: "1h" }));
app.use(morgan("tiny"));
app.all("*", createRequestHandlerAndProvider());
app.listen(PORT, () => {
	console.log(`Express server listening on port ${PORT}`);
	if (MODE === "development") {
		broadcastDevReady(build);
	}
});
