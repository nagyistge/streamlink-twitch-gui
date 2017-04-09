import { Application } from "ember";
import { locales as localesConfig } from "config";


const { "default": defaultLocale } = localesConfig;


Application.initializer({
	name: "env",

	initialize( application ) {
		const ENV = {
			i18n: {
				defaultLocale
			}
		};

		application.register( "config:environment", ENV );
	}
});
