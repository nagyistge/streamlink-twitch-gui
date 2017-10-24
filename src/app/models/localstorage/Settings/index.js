import {
	get,
	computed
} from "ember";
import {
	attr,
	Model
} from "ember-data";
import { fragment } from "model-fragments";
import {
	players as playersConfig
} from "config";
import { isWin } from "utils/node/platform";


function defaultPlayerData() {
	return Object.keys( playersConfig )
		.map(function( player ) {
			let params = playersConfig[ player ][ "params" ]
				.reduce(function( obj, param ) {
					obj[ param.name ] = param.default;
					return obj;
				}, {} );

			return {
				key: player,
				exec: "",
				args: "",
				params: params
			};
		})
		.reduce( function( obj, player ) {
			obj[ player.key ] = player;
			delete player.key;
			return obj;
		}, {
			"default": {
				exec: "",
				args: ""
			}
		} );
}


/**
 * @class Settings
 */
export default Model.extend({
	advanced            : attr( "boolean", { defaultValue: false } ),
	streaming           : fragment( "settingsStreaming", { defaultValue: {} } ),
	player              : attr( "",        { defaultValue: defaultPlayerData } ),
	player_preset       : attr( "string",  { defaultValue: "default" } ),
	gui_theme           : attr( "string",  { defaultValue: "default" } ),
	gui_smoothscroll    : attr( "boolean", { defaultValue: true } ),
	gui_externalcommands: attr( "boolean", { defaultValue: false } ),
	gui_integration     : attr( "number",  { defaultValue: 3 } ),
	gui_minimizetotray  : attr( "number",  { defaultValue: false } ),
	gui_minimize        : attr( "number",  { defaultValue: 0 } ),
	gui_focusrefresh    : attr( "number",  { defaultValue: 0 } ),
	gui_closestreampopup: attr( "boolean", { defaultValue: false } ),
	gui_hidestreampopup : attr( "boolean", { defaultValue: false } ),
	gui_openchat        : attr( "boolean", { defaultValue: false } ),
	gui_openchat_context: attr( "boolean", { defaultValue: false } ),
	gui_twitchemotes    : attr( "boolean", { defaultValue: false } ),
	gui_homepage        : attr( "string",  { defaultValue: "/featured" } ),
	gui_layout          : attr( "string",  { defaultValue: "tile" } ),
	gui_filterstreams   : attr( "boolean", { defaultValue: false } ),
	gui_langfilter      : fragment( "settingsLangfilter", { defaultValue: {} } ),
	stream_info         : attr( "number",  { defaultValue: 0 } ),
	stream_show_flag    : attr( "boolean", { defaultValue: false } ),
	stream_show_info    : attr( "boolean", { defaultValue: false } ),
	stream_click_middle : attr( "number",  { defaultValue: 2 } ),
	stream_click_modify : attr( "number",  { defaultValue: 4 } ),
	channel_name        : attr( "number",  { defaultValue: 3 } ),
	notify_enabled      : attr( "boolean", { defaultValue: true } ),
	notify_provider     : attr( "string",  { defaultValue: "auto" } ),
	notify_all          : attr( "boolean", { defaultValue: true } ),
	notify_grouping     : attr( "boolean", { defaultValue: true } ),
	notify_click        : attr( "number",  { defaultValue: 1 } ),
	notify_click_group  : attr( "number",  { defaultValue: 1 } ),
	notify_click_restore: attr( "boolean", { defaultValue: true } ),
	notify_badgelabel   : attr( "boolean", { defaultValue: true } ),
	chat_method         : attr( "string",  { defaultValue: "default" } ),
	chat_command        : attr( "string",  { defaultValue: "" } ),


	isVisibleInTaskbar: computed( "gui_integration", function() {
		return ( get( this, "gui_integration" ) & 1 ) > 0;
	}),

	isVisibleInTray: computed( "gui_integration", function() {
		return ( get( this, "gui_integration" ) & 2 ) > 0;
	})

}).reopenClass({

	toString() { return "Settings"; },

	passthrough: [
		{ value: "http", label: "http" },
		{ value: "rtmp", label: "rtmp" },
		{ value: "hls",  label: "hls" }
	],

	// bitwise IDs: both & 1 && both & 2
	integration: [
		{ id: 3, label: "Both" },
		{ id: 1, label: "Taskbar" },
		{ id: 2, label: "Tray" }
	],

	minimize: [
		{ id: 0, label: "Do nothing" },
		{ id: 1, label: "Minimize" },
		{ id: 2, label: "Move to tray" }
	],

	gui_focusrefresh: [
		{ value:      0, label: "Don't refresh" },
		{ value:  60000, label: "After one minute" },
		{ value: 120000, label: "After two minutes" },
		{ value: 300000, label: "After five minutes" }
	],

	notify_provider: [
		{
			value: "auto",
			label: {
				name: "Automatic selection",
				description: "Detects the best type of notification",
				notes: "Prefers native notifications, falls back to growl or rich notifications"
			}
		},
		{
			value: "snoretoast",
			label: {
				name: "Windows toast notifications",
				description: "Native notifications on Windows 8+",
				notes: "\"Banner notifications\" need to be enabled"
			}
		},
		{
			value: "native",
			label: {
				name: "Native notifications",
				description: "Chromium's native notification implementation",
				notes: "Notifications can be configured in your system preferences"
			}
		},
		{
			value: "freedesktop",
			label: {
				name: "Freedesktop notifications",
				description: "Native notifications on Linux",
				notes: "Implementation of the Desktop Notifications Specification"
			}
		},
		{
			value: "growl",
			label: {
				name: "Growl notifications",
				description: "Third-party notification service for Windows, MacOS and Linux",
				notes: "Requires Growl to be installed and running on your system"
			}
		},
		{
			value: "rich",
			label: {
				name: "Rich notifications",
				description: "Chromium rich notifications",
				notes: "Rendered by the application itself"
			}
		}
	],

	notify_all: [
		{ value: true,  label: "Show all except disabled ones" },
		{ value: false, label: "Ignore all except enabled ones" }
	],

	notify_click: [
		{ id: 0, label: "Do nothing" },
		{ id: 1, label: "Go to favorites" },
		{ id: 2, label: "Open stream" },
		{ id: 3, label: "Open stream+chat" }
	],

	notify_click_group: [
		{ id: 0, label: "Do nothing" },
		{ id: 1, label: "Go to favorites" },
		{ id: 2, label: "Open all streams" },
		{ id: 3, label: "Open all streams+chats" }
	],

	chat_methods: [
		// TODO: change to "browser"
		{ id: "default",  label: "Default Browser" },
		// TODO: change to "default"
		{ id: "irc",      label: "Internal IRC Client", disabled: true },
		{ id: "chromium", label: "Chromium" },
		{ id: "chrome",   label: "Google Chrome" },
		{ id: "msie",     label: "Internet Explorer", disabled: !isWin },
		{ id: "chatty",   label: "Chatty" },
		{ id: "custom",   label: "Custom application" }
	],

	gui_filterstreams: [
		{ value: false, label: "Fade out streams" },
		{ value: true,  label: "Filter out streams" }
	],

	stream_info: [
		{ id: 0, label: "Game being played" },
		{ id: 1, label: "Stream title" }
	],

	stream_click: [
		{ id: 0, key: "disabled", label: "Do nothing" },
		{ id: 1, key: "launch",   label: "Launch stream" },
		{ id: 2, key: "chat",     label: "Open chat" },
		{ id: 3, key: "channel",  label: "Go to channel page" },
		{ id: 4, key: "settings", label: "Go to channel settings" }
	],

	// bitwise
	channel_name: [
		{ id: 3, label: "Show both" },
		{ id: 1, label: "Show custom names" },
		{ id: 2, label: "Show original names" }
	]

});
