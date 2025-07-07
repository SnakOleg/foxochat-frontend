import { defineConfig } from "@rsbuild/core";
import { pluginPreact } from "@rsbuild/plugin-preact";
import { pluginSass } from "@rsbuild/plugin-sass";
import { pluginTypedCSSModules } from "@rsbuild/plugin-typed-css-modules";
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { readFileSync } from "fs";

const isDevelopment = process.env.NODE_ENV === "development";
const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
const version = pkg.version;

export default defineConfig({
	plugins: [pluginPreact(), pluginTypedCSSModules(), pluginSass(), pluginSvgr()],
	html: {
		template: "./index.html",
	},
	source: {
		entry: {
			index: "./src/index.tsx",
		},
		define: {
			"process.env.CDN_BASE_URL": JSON.stringify(
				process.env.CDN_BASE_URL || "https://media.foxochat.app/attachments/",
			),
			"process.env.API_URL": JSON.stringify(
				process.env.API_URL || "https://api.foxochat.app/",
			),
			"import.meta.env.MODE": JSON.stringify(
				process.env.NODE_ENV || "production",
			),
			config: JSON.stringify({
				cdnBaseUrl:
					process.env.CDN_BASE_URL || "https://media.foxochat.app/attachments/",
				apiUrl: process.env.API_URL || "https://api.foxochat.app/",
			}),
      __APP_VERSION__: JSON.stringify(version),
		},
		preEntry: isDevelopment ? ["preact/debug"] : [],
	},
	output: {
		polyfill: "usage",
		cssModules: {
			namedExport: true,
		},
		copy: [{ from: "node_modules/workbox-*/**/*.js", to: "workbox/" }],
	},
	resolve: {
		alias: {
			"@": "./src/",
			"@components": "./src/components",
			"@icons": "./src/assets/svg",
			"@assets": "./src/assets/",
			"@hooks": "./src/hooks/",
			"@services": "./src/services/",
			"@utils": "./src/utils/",
			"@store": "./src/store/",
			"@lib": "./src/lib/",
			"@interfaces": "./src/interfaces/",
		},
	},
});
