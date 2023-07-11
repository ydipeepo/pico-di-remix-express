```
       _                     _ _
 _ __ (_) ___ ___         __| (_)
| '_ \| |/ __/ _ \ _____ / _` | |
| |_) | | (_| (_) |_____| (_| | |
| .__/|_|\___\___/       \__,_|_| + Remix + express
|_|
```

  Adapter for using [`pico-di`](https://github.com/ydipeepo/pico-di) with Remix + express.

---

  [`pico-di`](https://github.com/ydipeepo/pico-di) を Remix + express 環境で使うためのアダプタです。

## Features

  `pico-di-remix-express` には `pico-di` に加えて以下の機能があります:

  - action / loader インジェクション
  - リクエスト毎のスコープ
  - シングルトンサービスの対応
    - ライブリロードできます
	- (開発ビルドにおいて) リクエスト間であってもシングルトンサービスがシングルトンであることを保証します

## Installation

  Remix + express (`@remix-run/express`) に対応しています。

  **Node.js**

  [npm](https://www.npmjs.com/) から入手できます。インストールするには:

  ```bash
  $ npm install pico-di-remix-express
  ```

## Usage

  サービスは全て `~/services` ディレクトリ以下にまとめ、`~/services/index.ts` でそれぞれインポートします。プロバイダ作成関数をエクスポートする必要があります。

```ts
// /app/services/index.ts

import { createGetProvider } from "pico-di-remix-express";
import Service1 from "./Service1";
import Service2 from "./Service2";
import Service3 from "./Service3";

type Context = {
	service1: Service1,
	service2: Service2,
	service3: Service3,
};

// `getProvider` という名前にしておきます。
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
```

* サービスとコンテキストは型をエクスポートします
* [`pico-di`](https://github.com/ydipeepo/pico-di) により細かな説明があります

### `/app/entry.server.ts` の修正

  先ほどの `getProvider` という関数を `~/entry.server.ts` からエクスポートする必要があります。このエクスポートは `pico-di-remix-express` がサービスプロバイダを取得するために必要です。

```ts
// /app/entry.server.ts

export { getProvider } from "~/services";

// ...
```

### `/server.js` の修正 (`createRequestHandler` と `createDevRequestHandler` を使う方法)

```ts
import chokidar from "chokidar";
import { createRequestHandler, createDevRequestHandler } from "pico-di-remix-express";

// ...

const BUILD_PATH = "./build/index.js";

/**
 * @type { import('@remix-run/node').ServerBuild | Promise<import('@remix-run/node').ServerBuild> }
 */
const build = await import(BUILD_PATH);

// ...

app.all("*", process.env.NODE_ENV === "development"
	? createDevRequestHandler({
		build,
		watch(setBuild) {
			const watcher = chokidar.watch(BUILD_PATH, { ignoreInitial: true });
			watcher.on("all", async () => {
				const stat = fs.statSync(BUILD_PATH);
				const build = await import(BUILD_PATH + "?t=" + stat.mtimeMs);

				// broadcastDevReady を呼ぶ必要がなければ
				// 第二引数は false でよいです。
				setBuild(build, true);
			});
		},
	})
	: createRequestHandler({
		build,
		mode: process.env.NODE_ENV,
	}));
```

### `/server.js` の修正 (`getProviderFromBuild` と `createGetLoadContext` を使う方法)

```ts
import { createRequestHandler as createRemixRequestHandler } from "@remix-run/express";
import chokidar from "chokidar";
import { getProviderFromBuild, createGetLoadContext } from "pico-di-remix-express";

// ...

const BUILD_PATH = "./build/index.js";

/**
 * @type { import('@remix-run/node').ServerBuild | Promise<import('@remix-run/node').ServerBuild> }
 */
const build = await import(BUILD_PATH);

const createRequestHandler = ({
	mode,
	getLoadContext,
	build,
}) => {
	let provider = getProviderFromBuild(build, mode);
	if (mode === "development") {
		const watcher = chokidar.watch(BUILD_PATH, { ignoreInitial: true });
		watcher.on("all", async () => {
			const stat = fs.statSync(BUILD_PATH);
			build = await import(BUILD_PATH + "?t=" + stat.mtimeMs);
			provider = getProviderFromBuild(build, mode);
			broadcastDevReady(build);
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
	} else {
		return createRemixRequestHandler({
			build,
			getLoadContext: createGetLoadContext({
				getLoadContext,
				provider,
				scopeName: "RequestScope",
			}),
			mode,
		});
	}
};

// ...

app.all("*", createRequestHandler({
	build,
	mode: process.env.NODE_ENV,
});
```

### action / loader でサービスを使う

```ts
import { type LoaderArgs, type ActionArgs } from "pico-di-remix-express";
import { type Context } from "~/services";

export const loader = ({
	context: {
		service1,
		service2,
		service3,
	},
}: LoaderArgs<Context>) => {
	// ...
};

export const action = ({
	context: {
		service1,
		service2,
		service3,
	},
}: ActionArgs<Context>) => {
	// ...
};
```

## Reference

* [`index.d.ts`](index.d.ts)

## License

  [MIT](LICENSE.md)
