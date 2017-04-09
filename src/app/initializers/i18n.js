import {
	set,
	EmberNativeArray,
	Application
} from "ember";
import {
	compileTemplate,
	missingMessage,
	getConfig
} from "ember-addon-i18n";
import {
	locales as localesConfig
} from "config";


const modules = require.context( "locales", true, /^.\/[a-z]{2}(?:-[a-z]{2})?\/[\w-]+\.yml$/ );


const { hasOwnProperty } = {};
const { locales } = localesConfig;
const kLocales = Object.keys( locales );
const reTranslations = /^.\/([a-z]{2}(?:-[a-z]{2})?)\/([\w-]+)\.yml$/;

const translations = modules
	.keys()
	.reduce( ( obj, key ) => {
		const content = modules( key );
		const [ , locale, namespace ] = reTranslations.exec( key );

		if ( !hasOwnProperty.call( obj, locale ) ) {
			if ( DEBUG && !hasOwnProperty.call( locales, locale ) ) {
				throw new Error( `Locale '${locale}' has not been defined in the config file` );
			}

			obj[ locale ] = {
				name: locales[ locale ],
				data: {}
			};
		}

		obj[ locale ].data[ namespace ] = content;

		return obj;
	}, {} );

if ( DEBUG ) {
	kLocales
		.filter( locale => !hasOwnProperty.call( translations, locale ) )
		.forEach( locale => {
			throw new Error( `Missing translations for locale '${locale}'` );
		});
}


Application.instanceInitializer({
	name: "i18n",

	initialize( application ) {
		const i18nService = application.lookup( "service:i18n" );

		// register ember-i18n stuff
		application.register( "util:i18n/compile-template", compileTemplate );
		application.register( "util:i18n/missing-message", missingMessage );

		// remove ember-i18n's requirejs lookups
		set( i18nService, "locales", new EmberNativeArray( kLocales ) );

		// register locale configs
		kLocales.forEach( key => {
			const config = getConfig( key );
			application.register( `locale:${key}/config`, config );
		});

		// register locale translations
		kLocales.forEach( key => {
			const { data } = translations[ key ];
			application.register( `locale:${key}/translations`, data );
			i18nService.addTranslations( key, data );
		});
	}
});
