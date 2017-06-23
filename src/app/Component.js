import React, { Component } from 'react';
import  {
	BackAndroid,
	Dimensions,
	View,
	StyleSheet,
	Platform,
} from 'react-native';
import { connect } from 'dva/mobile';
import DisplayView from 'w-rn-display-view';

import SplashScreen from 'react-native-splash-screen';

import { component as InvokeComponent } from '../invoke';

class AppComponent extends Component {

	constructor(props) {
		super(props);
		this.onBackAndroid = this.onBackAndroid.bind(this);
	}

	componentDidMount() {
		SplashScreen.hide();
	}

	componentWillMount() {
		if (Platform.OS === 'android') {
			BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
		}
	}

	componentWillUnmount() {
		if (Platform.OS === 'android') {
			BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
		}
	}

	onBackAndroid() {
		let { dispatch } = this.props;
		dispatch({
			type: 'app/goBack'
		});
		return true;
	}

	render() {
		let { isWebView, moduleNamespace } = this.props;
		let ModulesComponent = this.props.component;
		return (
			<View style={styles.container}>
				<DisplayView hidden={ isWebView == false ? true : false  } style={styles.show}>
					<InvokeComponent />
				</DisplayView>
				{!isWebView && ModulesComponent && <ModulesComponent style={styles.show} moduleNamespace={moduleNamespace} /> }
			</View>);
	}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	show: {
		flex: 1,
		height: Dimensions.get('window').height,
		width: Dimensions.get('window').width,
		backgroundColor: '#DDDDDD',
	}
});

const App = connect(function (state) {
	return { ...state.app };
})(AppComponent);

export default App;
