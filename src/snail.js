import React, { Component } from 'react';
import { AppRegistry } from 'react-native';

import dva, { connect } from 'dva/mobile';
import { component as AppComponent }  from './app';

// import dvaLog from  './dvaLog';

import { factory as appModelFactory }  from './app';
import { factory as invokeModelFactory } from './invoke';
// import takePictureModules from './modules/takePicture';
// import qrCodeReadModules from './modules/qrCodeRead';
// import deviceInfoModules from './modules/deviceInfo';
// import notifyModules from './modules/notify';
// import linkingModules from './modules/linking';

export default function (initialState = {
	app: {
		host: 'http://172.17.205.67:8089/',
		injectedJavaScript: null,
		path: ''
	}
}) {

	const snail = dva({
		initialState,
	});

	const SnailStore = {
		//invoke name space
		INS: 'invoke-message-',
		dispatch: function (action) {
			return snail._store.dispatch(action);
		},
		getState: function () {
			return snail._store.getState();
		}
	};

// snail.use(dvaLog());

	snail.model(appModelFactory(SnailStore));
	snail.model(invokeModelFactory(SnailStore));

// snail.model(takePictureModules(SnailStore));
// snail.model(qrCodeReadModules(SnailStore));
// snail.model(deviceInfoModules(SnailStore));
// snail.model(notifyModules(SnailStore));
// snail.model(linkingModules(SnailStore));

	return {
		snail,
		SnailStore,
		AppComponent
	};
};