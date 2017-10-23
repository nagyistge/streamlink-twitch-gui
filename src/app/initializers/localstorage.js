import {
	players,
	langs
} from "config";
import qualities from "models/stream/qualities";


const LS = window.localStorage;

function upgradeLocalstorage() {
	let old = LS.getItem( "app" );
	if ( old === null ) { return; }

	try {
		old = JSON.parse( old );
	} catch ( e ) {
		return;
	}

	Object.keys( old ).forEach(function( key ) {
		const data = {};
		data[ key ] = old[ key ];
		LS.setItem(
			key.toLowerCase(),
			JSON.stringify( data )
		);
	});

	LS.removeItem( "app" );
}

function upgradeSettings() {
	const data = JSON.parse( LS.getItem( "settings" ) );
	if ( !data || !data.settings || !data.settings.records[1] ) { return; }
	const settings = data.settings.records[ 1 ];

	if ( typeof settings.gui_minimize !== "number" ) {
		settings.gui_minimize = 0;
	}

	if ( settings.gui_homepage === "/user/following" ) {
		settings.gui_homepage = "/user/followedStreams";
	}

	if ( typeof settings.qualities === "object" && typeof settings.qualities.source === "string" ) {
		Object.keys( settings.qualities ).forEach( key => {
			settings.qualities[ key ] = {
				exclude: settings.qualities[ key ],
				quality: ""
			};
		});
	}

	// translate old livestreamer data into the executable format
	if ( typeof settings[ "livestreamer" ] === "string" ) {
		delete settings[ "livestreamer" ];
	}
	if ( typeof settings[ "livestreamer_params" ] === "string" ) {
		delete settings[ "livestreamer_params" ];
	}

	// translate old player data into the player presets format
	if ( typeof settings.player === "string" ) {
		settings.player = {
			"default": {
				"exec": settings[ "player" ] || "",
				"args": settings[ "player_params" ] || ""
			}
		};
		delete settings[ "player_params" ];
	}

	// make sure that default player params are set/updated once a new one gets added
	if ( typeof settings.player === "object" ) {
		Object.keys( players ).forEach(function( name ) {
			if ( !settings.player.hasOwnProperty( name ) ) {
				settings.player[ name ] = {
					"exec": "",
					"args": "",
					"params": {}
				};
			}
			let playerParams = settings.player[ name ].params;
			// iterate player preset params
			players[ name ].params.forEach(function( param ) {
				// don't overwrite already existing values
				if ( playerParams.hasOwnProperty( param.name ) ) { return; }
				playerParams[ param.name ] = param.default;
			});
		});
	}

	let renamedProps = {
		"livestreamer_oauth": "streamprovider_oauth",
		"gui_flagsvisible": "stream_show_flag",
		"gui_gamevisible" : "stream_show_info",
		"gui_streamclick_mid": "stream_click_middle",
		"gui_streamclick_mod": "stream_click_modify"
	};

	Object.keys( renamedProps ).forEach(function( key ) {
		if ( !settings.hasOwnProperty( key ) ) { return; }
		settings[ renamedProps[ key ] ] = settings[ key ];
		delete settings[ key ];
	});

	// remove unused or disabled language filters
	Object.keys( settings.gui_langfilter || {} ).forEach(function( code ) {
		const lang = langs[ code ];
		if ( !lang || lang.disabled ) {
			delete settings.gui_langfilter[ code ];
		}
	});

	// update notification provider
	if ( settings.notify_provider === "libnotify" ) {
		settings.notify_provider = "freedesktop";
	}

	// map quality number IDs to strings
	_upgradeQuality( settings );

	// use new streaming model fragments
	if ( !settings.hasOwnProperty( "streaming" ) ) {
		const streaming = settings.streaming = {};
		const mapping = {
			provider: "streamprovider",
			providers: "streamproviders",
			oauth: "streamprovider_oauth",
			player_passthrough: "player_passthrough",
			player_reconnect: "player_reconnect",
			player_no_close: "player_no_close",
			hls_live_edge: "hls_live_edge",
			hls_segment_threads: "hls_segment_threads",
			retry_open: "retry_open",
			retry_streams: "retry_streams"
		};
		for ( const [ newKey, oldKey ] of Object.entries( mapping ) ) {
			streaming[ newKey ] = settings[ oldKey ];
			delete settings[ oldKey ];
		}
	}

	LS.setItem( "settings", JSON.stringify( data ) );
}

function upgradeChannelSettings() {
	const data = JSON.parse( LS.getItem( "channelsettings" ) );
	// data key has a dash in it
	if ( !data || !data[ "channel-settings" ] ) { return; }
	const channelsettings = data[ "channel-settings" ].records;

	Object.keys( channelsettings ).forEach(function( key ) {
		let settings = channelsettings[ key ];

		// map quality number IDs to strings
		_upgradeQuality( settings );
	});

	LS.setItem( "channelsettings", JSON.stringify( data ) );
}

function _upgradeQuality( settings ) {
	if ( !settings.hasOwnProperty( "quality" ) ) { return; }
	if ( settings.quality === null ) { return; }
	if ( !qualities.hasOwnProperty( settings.quality || 0 ) ) { return; }

	settings.quality = qualities[ settings.quality || 0 ].id;
}


upgradeLocalstorage();
upgradeSettings();
upgradeChannelSettings();
