import {
	get,
	computed
} from "ember";
import { attr } from "ember-data";
import {
	Fragment,
	fragment
} from "model-fragments";
import {
	streaming as streamingConfig
} from "config";


const { equal } = computed;
const { providers } = streamingConfig;
const { MAX_SAFE_INTEGER: MAX } = Number;


export default Fragment.extend({
	// attributes (provider selection and configuration)

	provider: attr( "string", { defaultValue: "streamlink" } ),
	providers: fragment( "settingsStreamingProviders", { defaultValue: {} } ),


	// attributes (streamlink / livestreamer parameters)

	oauth: attr( "boolean", { defaultValue: true } ),

	player_passthrough: attr( "string", { defaultValue: "http" } ),
	player_reconnect: attr( "boolean", { defaultValue: true } ),
	player_no_close: attr( "boolean", { defaultValue: false } ),

	hls_live_edge: attr( "number", { defaultValue: 3, min: 1, max: 10 } ),
	hls_segment_threads: attr( "number", { defaultValue: 1, min: 1, max: 10 } ),

	retry_open: attr( "number", { defaultValue: 1, min: 1, max: MAX } ),
	retry_streams: attr( "number", { defaultValue: 1, min: 0, max: MAX } ),


	// computed properties

	providerName: computed( "provider", function() {
		const provider = get( this, "provider" );
		return providers[ provider ][ "name" ];
	}),

	providerType: computed( "provider", function() {
		const provider = get( this, "provider" );
		return providers[ provider ][ "type" ];
	}),

	isStreamlink: equal( "providerType", "streamlink" )
});
