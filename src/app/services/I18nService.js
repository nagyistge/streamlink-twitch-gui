import {
	get,
	set,
	observer,
	inject
} from "ember";
import { I18nService } from "ember-addon-i18n";


const { service } = inject;


export default I18nService.extend({
	settings: service(),

	_settingsObserver: observer( "settings.content.gui_language", function() {
		const language = get( this, "settings.content.gui_language" );

		set( this, "locale", language );
	}),

	init() {
		this._super( ...arguments );

		// the observer doesn't trigger without reading the settings property first
		get( this, "settings" );
	}
});
