import { attr } from "ember-data";
import { Fragment } from "model-fragments";
import {
	langs as langsConfig
} from "config";


// dynamic fragment
const properties = Object.keys( langsConfig )
	.reduce( ( obj, code ) => {
		if ( !langsConfig[ code ].disabled ) {
			obj[ code ] = attr( "boolean", { defaultValue: false } );
		}
		return obj;
	}, {} );


export default Fragment.extend( properties );
