import React, { Component, PropTypes } from 'react';
import {
	Dimensions,
	StyleSheet,
	View,
	Text, Button,
	NativeModules
} from 'react-native';

import { connect } from 'dva/mobile';
import WebView from 'w-rn-crosswalk-webview';
import ProgressBar from '../Components/ProgressBar';

class WebViewInvokeComponent extends Component {

	constructor(props) {
		super(props);
		this.state = {
			url: props.url || '',
			progress: 0,
		};
		this.onRefWebview = this.onRefWebview.bind(this);
		this.onMessage = this.onMessage.bind(this);
	}

	onRefWebview(webviewComponent) {
		let { dispatch } = this.props;

		dispatch({
			type: 'invoke/init',
			payload: {
				webviewComponent,
				invokeComponent: this
			}
		});
	}

	onRedirectURL(url) {
		this.setState({
			url,
		});
	}

	onMessage(event) {
		let { dispatch } = this.props;
		dispatch({
			type: 'invoke/message',
			payload: {
				event: event.nativeEvent
			}
		});
		//this.props.invoke.onMessageHandle(event.nativeEvent)
	}

	render() {
		let { injectedJavaScript }=this.props;
		let { url, progress }=this.state;
		let webViewProps = {
			ref: this.onRefWebview,
			injectedJavaScript,
			source: {
				uri: url,
			},
			onMessage: this.onMessage,
			scalesPageToFit: false,
			onProgress: (value)=> (
				this.setState({ progress: value })
			),
			onError: function () {

			}
		};

		let progressProps = {
			fillStyle: {
				backgroundColor: '#03a9f4',
				height: 2
			},
			backgroundStyle: {
				backgroundColor: 'transparent',
				width: Dimensions.get('window').width,
			},
			progress,
		};

		return (
			<View style={[styles.container]}>
				<WebView {...webViewProps} style={styles.webview} />
				{progress < 1 && (<View style={styles.progressWrapper}><ProgressBar {...progressProps} /></View> )}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		// backgroundColor: '#FFFFFF',
		// height: Dimensions.get('window').height,
		// width: Dimensions.get('window').width,
		// borderWidth:5,
		// borderColor:"#ff9800",
	},
	webview: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	progressWrapper: {
		position: 'absolute',
		left: 0,
		top: 0,
	}
});

const WebViewInvoke = connect(function (state) {
	let { host, path, injectedJavaScript, cacheMode } = state.app;
	let { invoke, firstURL } = state.invoke;
	return {
		host,
		path,
		url: firstURL,
		invoke,
		cacheMode,
		injectedJavaScript
	};
})(WebViewInvokeComponent);

export default WebViewInvoke;