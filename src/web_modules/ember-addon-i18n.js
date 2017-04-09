import {
	Service as I18nService,
	compileTemplate
} from "ember-i18n/addon";
import THelper from "ember-i18n/addon/helper";
import missingMessage from "ember-i18n/addon/utils/i18n/missing-message";


const configsContext = require.context( "ember-i18n/addon/config", false, /^\.\/[a-z]{2}\.js$/ );
const getConfig = locale => configsContext( `./${locale}.js` )[ "default" ];


export {
	I18nService,
	THelper,
	compileTemplate,
	missingMessage,
	getConfig
};
