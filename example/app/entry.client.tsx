import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { RemixBrowser } from "@remix-run/react";

startTransition(() => void hydrateRoot(
	document,
	<StrictMode>
		<RemixBrowser />
	</StrictMode>));
