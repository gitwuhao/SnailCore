import React, { Component } from 'react';

import { createNativeInvoke } from 'w-rn-invoke';

const noop = function () {
};

let redirectIndex = 10086;

function getURL(host, path) {
	let url;

	path = path || '';

	if (path.match(/^http[s]?:\/\//i)) {
		url = path;
	} else {
		let subPath = path.replace(/^\//, '');
		let newHost = host.replace(/\/$/, '');
		url = `${newHost}/${subPath}`;
	}

	let newUrl;
	if (url.match(/\?/)) {
		newUrl = url.replace(/\?/, `?_${redirectIndex++}_&`);
	} else {
		newUrl = `${url}?_${redirectIndex++}_`;
	}
	return newUrl;
}

export default function ({ INS, dispatch }) {

	function initInvoke(webviewComponent) {
		let invoke = createNativeInvoke(webviewComponent.postMessage);
		invoke.post = function (data, success, error) {
			if (!data.type) {
				data = { type: data };
			}
			data.success = success || noop;
			data.error = error || noop;
			this.emit(data.type, data);
		};

		invoke.dispatch = invoke.emit;
		invoke.emit = function (type, data) {
			this.dispatch(type, data);
			dispatch({
				type: 'invoke/request',
				payload: {
					...data
				}
			});
		};
		return invoke;
	}

	return {
		namespace: 'invoke',
		state: {
			invokeMessager: null,
			invokeComponent: null,
			webviewComponent: null,
			firstURL: null,
		},
		reducers: {
			set: function (state, { payload }) {
				return {
					...state,
					...payload
				}
			},
			init(state, { payload:{ webviewComponent, invokeComponent } }) {
				let invokeMessager = initInvoke(webviewComponent);
				// debugger;
				return {
					...state,
					invokeMessager,
					webviewComponent,
					invokeComponent
				};
			}
		},
		effects: {
			*steup(action, { call, apply, put, select }){
				const state = yield  select((state)=> state);
				const appState = state.app;
				const invokeState = state.invoke;

				let firstURL = yield call(getURL, appState.host, appState.path);
				yield put({
					type: 'set',
					payload: {
						firstURL
					}
				});

			},
			*init(action, { call, apply, put, select }){
				const state = yield  select((state)=> state);
				const appState = state.app;
				const invokeState = state.invoke;

				yield put({
					type: 'app/init',
					payload: {
						isWebView: true,
					}
				});
			},
			*redirectPath({ payload:{ path } }, { call, apply, put, select }){
				const state = yield  select((state)=> state);
				const appState = state.app;
				const invokeState = state.invoke;
				let url = yield call(getURL, appState.host, path);

				let { invokeComponent }=invokeState;
				yield apply(invokeComponent, invokeComponent.onRedirectURL, [url]);
			},
			*redirect({ payload:{ url } }, { call, apply, put, select }){
				const state = yield  select((state)=> state);
				const appState = state.app;
				const invokeState = state.invoke;
				let redirectUrl = yield call(getURL, appState.host, url);

				let { invokeComponent }=invokeState;
				yield apply(invokeComponent, invokeComponent.onRedirectURL, [redirectUrl]);
			},
			*reload(action, { call, apply, put, select }){
				const state = yield  select((state)=> state);
				const appState = state.app;
				const invokeState = state.invoke;
				const { webviewComponent } = invokeState;
				yield apply(webviewComponent, webviewComponent.reload || noop);
			},
			*goBack(action, { call, apply, put, select }){
				const state = yield  select((state)=> state);
				const appState = state.app;
				const invokeState = state.invoke;
				const { webviewComponent } = invokeState;
				yield apply(webviewComponent, webviewComponent.goBack || noop);
			},
			*clearCache(action, { call, apply, put, select }){
				const state = yield  select((state)=> state);
				const appState = state.app;
				const invokeState = state.invoke;
				const { webviewComponent } = invokeState;
				yield apply(webviewComponent, webviewComponent.clearCache || noop, [true]);

				yield put({
					type: 'app/clearCache'
				});
			},
			*goHome(action, { call, apply, put, select }) {
				const state = yield  select((state)=> state);
				const appState = state.app;
				const invokeState = state.invoke;
				let { invokeComponent }=invokeState;
				yield apply(invokeComponent, invokeComponent.onRedirectURL, [invokeState.firstURL]);
			},
			*message({ payload:{ event } }, { call, apply, put, select }){
				const state = yield  select((state)=> state);
				const appState = state.app;
				const { invokeMessager } = state.invoke;
				yield apply(invokeMessager, invokeMessager.onMessageHandle, [event]);
			},
			*request({ type, payload }, { call, put, select }){
				if (payload.type == 'ready') {

				} else if (payload.type == 'clearCache') {
					yield put({ type: 'clearCache' });
				} else {
					let paths = payload.type.split(/\//);
					if (!paths[1]) {
						paths[1] = 'request';
					}
					yield put({
						type: `${INS}${paths[0]}/${paths[1]}`,
						payload
					});
				}
			}
		},
		subscriptions: {
			initURL({ dispatch }, done) {
				dispatch({ type: 'steup' });
			}
		}
	};

}