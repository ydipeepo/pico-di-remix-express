import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { Response, type AppLoadContext, type EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import isBot from "isbot";

// サーバービルドに getProvider のエクスポートを含めるため、
// この行を追加しておく必要があります。
export { getProvider } from "~/services";

const ABORT_DELAY = 5_000;

const handleBotRequest = (
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext) => {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const { pipe, abort } = renderToPipeableStream(
		<RemixServer
			context={remixContext}
			url={request.url}
			abortDelay={ABORT_DELAY}
		/>,
		{
			onAllReady() {
				shellRendered = true;
				const body = new PassThrough();
				responseHeaders.set("Content-Type", "text/html");
				resolve(new Response(body, {
					headers: responseHeaders,
					status: responseStatusCode,
				}));
				pipe(body);
			},
			onShellError(error: unknown) {
				reject(error);
			},
			onError(error: unknown) {
				responseStatusCode = 500;
				// Log streaming rendering errors from inside the shell.  Don't log
				// errors encountered during initial shell rendering since they'll
				// reject and get logged in handleDocumentRequest.
				if (shellRendered) {
					console.error(error);
				}
			},
		});
		setTimeout(abort, ABORT_DELAY);
	});
};

const handleBrowserRequest = (
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext) => {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const { pipe, abort } = renderToPipeableStream(
		<RemixServer
			context={remixContext}
			url={request.url}
			abortDelay={ABORT_DELAY}
		/>,
		{
			onShellReady() {
				shellRendered = true;
				const body = new PassThrough();
				responseHeaders.set("Content-Type", "text/html");
				resolve(new Response(body, {
					headers: responseHeaders,
					status: responseStatusCode,
				}));
				pipe(body);
			},
			onShellError(error: unknown) {
				reject(error);
			},
			onError(error: unknown) {
				responseStatusCode = 500;
				// Log streaming rendering errors from inside the shell.  Don't log
				// errors encountered during initial shell rendering since they'll
				// reject and get logged in handleDocumentRequest.
				if (shellRendered) {
					console.error(error);
				}
			},
		});
		setTimeout(abort, ABORT_DELAY);
	});
};

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
	loadContext: AppLoadContext) {
	void loadContext;
	return isBot(request.headers.get("user-agent"))
		? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext)
		: handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
}
