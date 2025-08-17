import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/redux-logic';
import AuthProviderWithNavigate from './AuthProviderWithNavigate';

console.log(`backend url: ${process.env.REACT_APP_BACKEND_URL}`);
console.log(process.env);
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
console.log(`domain: ${process.env.REACT_APP_AUTH0_DOMAIN}, redirect_uri: ${window.location.origin}`);

root.render(
    <React.StrictMode>
    <Provider store={store}>
    <BrowserRouter>
    <AuthProviderWithNavigate>
      <App />
    </AuthProviderWithNavigate>        
    </BrowserRouter>
    </Provider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
