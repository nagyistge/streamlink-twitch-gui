import {
	get,
	computed,
	inject,
	Service
} from "ember";
import NotificationServicePollingMixin from "./polling";
import NotificationServiceDispatchMixin from "./dispatch";
import NotificationServiceBadgeMixin from "./badge";
import NotificationServiceFollowMixin from "./follow";
import NotificationServiceTrayMixin from "./tray";


const { and } = computed;
const { service } = inject;


export default Service.extend(
	NotificationServicePollingMixin,
	NotificationServiceDispatchMixin,
	NotificationServiceBadgeMixin,
	NotificationServiceFollowMixin,
	NotificationServiceTrayMixin,
	{
		auth: service(),
		settings: service(),

		error: false,
		paused: false,

		enabled: and( "auth.session.isLoggedIn", "settings.notify_enabled" ),

		running: computed( "enabled", "paused", function() {
			return get( this, "enabled" ) && !get( this, "paused" );
		}),

		init() {
			this._super( ...arguments );
			// read `running` on init and trigger the lazy computed property and its observers
			get( this, "running" );
		},

		statusText: computed( "enabled", "paused", "error", function() {
			const status = !get( this, "enabled" )
				? "disabled"
				: get( this, "paused" )
					? "paused"
					: get( this, "error" )
						? "offline"
						: "enabled";

			return `Desktop notifications are ${status}`;
		})
	}
);
