import React, { Component } from 'react';
import {
	ToastAndroid
} from 'react-native';
import { createNativeInvoke } from 'w-rn-invoke';

const noop = function () {
};

let getFirstState = (function () {
	let firstState;
	return function (state) {
		if (state) {
			firstState = state;
			firstState.isWebView = true;
		}
		return firstState;
	};
})();

export default  function ({ INS }) {
	return {
		namespace: 'app',
		state: {
			isWebView: true,
			moduleNamespace: null,
			component: null,
			host: 'http://172.17.205.67:8089/',
			path: '',
			injectedJavaScript: null,
		},
		reducers: {
			init(state, { payload }) {
				if (getFirstState()) {
					throw Error('重复初始化，请用app/revert还原');
				}
				return getFirstState({
					...state,
					...payload
				});
			},
			set: function (state, { payload }) {
				return {
					...state,
					...payload
				}
			},
			revert(state){
				let firstState = getFirstState();
				return {
					...firstState
				};
			},
			switch(state, { payload:{ component, moduleNamespace } }){
				return {
					...state,
					isWebView: false,
					component,
					moduleNamespace
				};
			}
		},
		effects: {
			*goBack(action, { call, put, select }){
				const appState = yield select((state)=> state.app);
				if (appState.isWebView) {
					yield put({
						type: 'invoke/goBack'
					});
				} else {
					yield put({
						type: 'revert'
					});
				}
			},
			*clearCache(action, { call, put, select }){
				ToastAndroid.show('缓存清除成功', ToastAndroid.SHORT);
			}
		}
	};
}
