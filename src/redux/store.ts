import { applyMiddleware, combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { auth } from './reducers/auth';
import { domains, domainQueries } from './reducers/domains';
import { tabs } from './reducers/tabs';

const rootReducer = combineReducers({
  auth: auth.reducer,
  domains: domains.reducer,
  domainQueries: domainQueries.reducer,

  tabs: tabs.reducer,
});

export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));
