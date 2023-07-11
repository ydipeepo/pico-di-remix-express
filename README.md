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

  [![npm version](https://badge.fury.io/js/pico-di-remix-express.svg)](https://badge.fury.io/js/pico-di-remix-express)
  [![Socket](https://socket.dev/api/badge/npm/package/pico-di-remix-express)](https://socket.dev/npm/package/pico-di-remix-express)

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

* [`example/app/services`](example/app/services)

### `/app/entry.server.tsx` の修正

  先ほどの `getProvider` という関数を `~/entry.server.tsx` からエクスポートする必要があります。このエクスポートは `pico-di-remix-express` がサービスプロバイダを取得するために必要です。

```ts
// /app/entry.server.tsx

export { getProvider } from "~/services";

// ...
```

* [`example/app/entry.server.tsx`](example/app/entry.server.tsx)

### `/server.js` の修正

* [`example/server.js`](example/server.js)

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
