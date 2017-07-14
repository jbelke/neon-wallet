import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/App';
import Login from './components/Login';
import Balance from './components/Balance';
import CreateWallet from './components/CreateWallet';
import Send from './components/Send';


export default (
	<Route path="/" component={App}>
		<IndexRoute component={Login} />
		<Route path="/create" component={CreateWallet} />
		<Route path="/balance" component={Balance} />
		<Route path="/send" component={Send} />
	</Route>
);
