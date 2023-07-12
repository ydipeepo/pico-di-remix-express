import { broadcastDevReady, installGlobals } from "@remix-run/node";
import { createRequestHandler } from "pico-di-remix-express";
import chokidar from "chokidar";
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

const createDevRequestHandler = () => createRequestHandler({
	mode: "development",
	build,
	watch(setBuild) {
		const watcher = chokidar.watch(BUILD_PATH, { ignoreInitial: true });
		watcher.on("all", async (eventName, path, stat) => {
			void eventName;
			void path;
			build = await import(BUILD_PATH + "?t=" + stat.mtimeMs);
			setBuild(build);
			broadcastDevReady(build);
		});
	},
	scopeName: "DevRequestScope",
});

const app = express();
app.use(compression());
app.disable("x-powered-by");
app.use("/build", express.static("public/build", { immutable: true, maxAge: "1y" }));
app.use(express.static("public", { maxAge: "1h" }));
app.use(morgan("tiny"));
app.all("*", MODE === "development"
	? createDevRequestHandler()
	: createRequestHandler({ mode: MODE, build }));
app.listen(PORT, () => {
	console.log(`Express server listening on port ${PORT}`);
	if (MODE === "development") {
		broadcastDevReady(build);
	}
});
