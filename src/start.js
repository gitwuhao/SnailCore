import React, { Component } from 'react';
import {
	AppRegistry,
} from 'react-native';

import factory  from  './snail';

const { snail, AppComponent } = factory({
	app: {
		host: 'http://m.baidu.com/',
		path: ''
	}
});

snail.router(()=> <AppComponent />);

AppRegistry.registerComponent('snail', ()=> snail.start());