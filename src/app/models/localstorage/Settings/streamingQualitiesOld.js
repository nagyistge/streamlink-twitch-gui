import { attr } from "ember-data";
import { Fragment } from "model-fragments";
import { qualitiesLivestreamer } from "models/stream/qualities/index";


// dynamic fragment
const properties = qualitiesLivestreamer
	.reduce( ( obj, quality ) => {
		obj[ quality.id ] = attr( "string" );
		return obj;
	}, {} );


export default Fragment.extend( properties );
