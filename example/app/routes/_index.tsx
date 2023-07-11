import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { type LoaderArgs } from "pico-di-remix-express";
import { Context } from "~/services";

export const loader = ({
	context: {
		service1,
		service2,
		service3,
	},
}: LoaderArgs<Context>) => json([
	service1.toString(),
	service2.toString(),
	service3.toString(),
]);

export default function Index() {
	const services = useLoaderData<typeof loader>();
	return (
		<>
			<h1>Remix + <code>pico-di</code>!</h1>
			<aside>Resolved services:</aside>
			<ul>
				{services.map((name, key) => <li key={key}>{name}</li>)}
			</ul>
		</>
	);
}
