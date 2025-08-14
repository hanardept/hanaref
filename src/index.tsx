import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/redux-logic';
import { Auth0Provider } from '@auth0/auth0-react';

console.log(`backend url: ${process.env.REACT_APP_BACKEND_URL}`);
console.log(process.env);
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
    <Provider store={store}>
    <BrowserRouter>
    <Auth0Provider
      domain={process.env.VITE_AUTH0_DOMAIN!}
      clientId={process.env.VITE_AUTH0_CLIENT_ID!}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <App />
    </Auth0Provider>          
    </BrowserRouter>
    </Provider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
