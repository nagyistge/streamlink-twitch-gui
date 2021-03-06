import {
	module,
	test
} from "qunit";
import {
	buildOwner,
	runDestroy
} from "test-utils";
import {
	set,
	run,
	Service
} from "ember";
import notificationServiceBadgeMixinInjector
	from "inject-loader?-ember!services/NotificationService/badge";


module( "services/NotificationService/badge" );


test( "Badge", assert => {

	assert.expect( 5 );

	let expected = "";

	const { default: NotificationServiceBadgeMixin } = notificationServiceBadgeMixinInjector({
		"nwjs/Window": {
			setBadgeLabel( label ) {
				assert.strictEqual( label, expected, "Sets the badge label" );
			}
		}
	});

	const owner = buildOwner();

	owner.register( "service:settings", Service.extend({
		notify_badgelabel: false
	}) );
	owner.register( "service:notification", Service.extend( NotificationServiceBadgeMixin ) );

	const settings = owner.lookup( "service:settings" );
	const service = owner.lookup( "service:notification" );

	// doesn't update the label when not running or disabled in settings
	service.trigger( "streams-all", [ {}, {} ] );

	run( () => set( settings, "notify_badgelabel", true ) );

	// doesn't update the label when enabled, but not running
	service.trigger( "streams-all", [ {}, {} ] );

	run( () => set( service, "running", true ) );

	// updates the label when running and enabled
	expected = "2";
	service.trigger( "streams-all", [ {}, {} ] );
	expected = "3";
	service.trigger( "streams-all", [ {}, {}, {} ] );

	// clears label when it gets disabled
	expected = "";
	run( () => set( settings, "notify_badgelabel", false ) );

	// doesn't reset label, requires a new streams-all event
	run( () => set( settings, "notify_badgelabel", true ) );
	expected = "1";
	service.trigger( "streams-all", [ {} ] );

	// clears label when service stops
	expected = "";
	run( () => set( service, "running", false ) );

	runDestroy( owner );

});
