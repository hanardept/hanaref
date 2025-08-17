import { Auth0Provider, AppState } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { backendFirebaseUri } from './backend-variables/address'

interface AuthProviderWithNavigateProps {
  children: React.ReactNode
}

const AuthProviderWithNavigate: React.FC<AuthProviderWithNavigateProps> = ({ children }) => {

  const navigate = useNavigate()

  const onRedirectCallback = (appState?: AppState) => {
    console.log(`navigating to: ${appState?.returnTo || window.location.pathname}. app state: ${JSON.stringify(appState)}`);
    navigate(appState?.returnTo || window.location.pathname)
  }

  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN!}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: backendFirebaseUri
      }}
      onRedirectCallback={onRedirectCallback}>
      {children}
    </Auth0Provider>
  )
}

export default AuthProviderWithNavigate