import {
	attr,
	belongsTo,
	Model
} from "ember-data";


export default Model.extend({
	access_end: attr( "date" ),
	access_start: attr( "date" ),
	product: belongsTo( "twitchProduct", { async: false } ),
	purchase_profile: attr()

}).reopenClass({
	toString() { return "api/users/:user_name/tickets"; }
});
