import {
	Fragment,
	fragment
} from "model-fragments";
import { qualitiesStreamlink } from "models/stream/qualities/index";


// dynamic fragment
const properties = qualitiesStreamlink
	.reduce( ( obj, quality ) => {
		obj[ quality.id ] = fragment( "settingsStreamingQuality", { defaultValue: {} } );
		return obj;
	}, {} );


export default Fragment.extend( properties );
