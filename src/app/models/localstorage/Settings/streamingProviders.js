import {
	Fragment,
	fragment
} from "model-fragments";
import {
	streaming as streamingConfig
} from "config";


const { providers } = streamingConfig;


// dynamic fragment
export default Fragment.extend(
	Object.keys( providers )
		.reduce( ( obj, provider ) => {
			obj[ provider ] = fragment( "settingsStreamingProvidersItem", { defaultValue: {} } );
			return obj;
		}, {} )
);
