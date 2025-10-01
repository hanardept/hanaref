import classes from './App.module.css';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { get } from 'idb-keyval';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from './hooks/redux-hooks';
import { authActions } from './store/auth-slice';
import Header from './components/header/Header';
import ItemPage from './components/item-page/ItemPage';
import AdminOnly from './components/authorization/AdminOnly';
import RolesOnly from './components/authorization/RolesOnly';
import HomePage from './components/item-search/HomePage';
import LoginPage from './components/login/LoginPage';
import ItemMenu from './components/item-menu/ItemMenu';
import SectorManagement from './components/sector-management/SectorManagement';
import SectorMenu from './components/sector-management/SectorMenu';
import NoItemFound from './components/item-page/NoItemFound';
import Technicians from './components/technician-page/Technicians';
import TechnicianPage from './components/technician-page/TechnicianPage';
import TechnicianMenu from './components/technician-menu/TechnicianMenu';
import CertificationPage from './components/certification-page/CertificationPage';
import Certifications from './components/certification-page/Certifications';
import CertificationMenu from './components/certification-menu/CertificationMenu';
import UserPage from './components/user-page/UserPage';
import Users from './components/user-page/Users';
import UserMenu from './components/user-menu/UserMenu';
import { useAuth0 } from '@auth0/auth0-react';
import { jwtDecode } from 'jwt-decode';
import { backendFirebaseUri } from './backend-variables/address';
import LoadingSpinner from './components/UI/LoadingSpinner';
import { Role } from './types/user_types';
import SupplierPage from './components/supplier-page/SupplierPage';
import Suppliers from './components/supplier-page/Suppliers';
import SupplierMenu from './components/supplier-menu/SupplierMenu';
import MultiItemEdit from './components/item-menu/MultiItemEdit';

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const firstRender = useRef(true);
  const [params] = useSearchParams();

  useEffect(() => {
    if (firstRender.current) {
      setTimeout(() => {
        firstRender.current = false;
        setShowWelcome(false);
      }, 5000);
    }

    let autoLogoutTimer: NodeJS.Timeout;

    Promise.all([get('hanaref-jwt'), get('hanaref-front-end-privilege'), get('hanaref-jwt-expiry-date')])
      .then((values) => {
        if (values.every(v => !!v)) {
          const [jwt, frontEndPrivilege, jwtExpiryDate] = values;
          if (new Date().getTime() >= jwtExpiryDate) {
            dispatch(authActions.clearAuthStateUponLogout());
          } else {
            dispatch(authActions.consumeAuthStateFromIDB({ jwt: jwt, frontEndPrivilege: frontEndPrivilege, jwtExpiryDate: jwtExpiryDate }));
            autoLogoutTimer = setTimeout(() => {
              dispatch(authActions.clearAuthStateUponLogout());
            }, jwtExpiryDate - new Date().getTime());
          }
        }
      }).catch((err) => console.log(`Error consuming auth state from IDB: ${err}`));

    return () => {
      clearTimeout(autoLogoutTimer);
    }
  }, [dispatch]);

    const { isAuthenticated, user, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();

    console.log(`App: isAuthenticated: ${isAuthenticated}, isLoading: ${isLoading}`);


    console.log(`params: ${JSON.stringify(params)}`);
    if (params.get('error')) {
      console.log(`params error: ${params.get('error')}`);
      loginWithRedirect({ authorizationParams: { audience: backendFirebaseUri } });
    }

    useEffect(() => {
      if (isAuthenticated) {
        console.log(`isAuthenticated = true, calling getAccessTokenSilently`);
        getAccessTokenSilently({ /*cacheMode: 'off',*/ authorizationParams: { audience: backendFirebaseUri } })
        .then(token => {
            //console.log(`getAccessTokenSilently token: ${token}`);
            try {
              const rolesTokenField = `${process.env.REACT_APP_AUTH0_NAMESPACE}/roles`;
              const userIdField = `${process.env.REACT_APP_AUTH0_NAMESPACE}/user_id`;
              const decoded = jwtDecode<any>(token);
              console.log(`token field: ${rolesTokenField}`);
              console.log(`decoded: ${JSON.stringify(decoded)}`);
              console.log(`role: ${decoded[rolesTokenField]?.[0]}`);
              dispatch(authActions.setAuthStateUponLogin({ jwt: token, frontEndPrivilege: decoded[rolesTokenField]?.[0], jwtExpiryDate: decoded.exp!, userId: decoded[
                userIdField] }));
            } catch (error) {
              console.log(`error decoding auth0 token: ${error}`);
            }
          })
          .catch(error => {
            console.log(`getAccessTokenSilently error: ${error?.error}, whole: ${JSON.stringify(error)}`);
          })
      } else if (!isLoading) {
        console.log(`isAuthenticated = false and isLoading = false, calling loginWithRedirect`);
        loginWithRedirect({ authorizationParams: { audience: backendFirebaseUri } });
      }




        // This effect runs whenever isLoading or isAuthenticated changes
        // if (!isLoading) {
        //   // Auth0 SDK has finished checking authentication state
        //   if (!isAuthenticated) {
        //     // User is not authenticated, redirect to login
        //     loginWithRedirect();
        //   } else {
        //     // User is authenticated, proceed with rendering content
        //     // or navigating to a protected route
        //     console.log('User is authenticated and isLoading is false.');
        //   }
        // }
      }, [isLoading, isAuthenticated, loginWithRedirect, dispatch, getAccessTokenSilently]); // Dependencies for useEffect

    useEffect(() => {
      console.log(`user: ${JSON.stringify(user)}, isLoading: ${isLoading}`)
      if (!isLoading && user) {
        // Check if there's a returnTo URL in the appState
        const appState = user.appState; 
        if (appState && appState.returnTo) {
          console.log(`navigating to: ${appState.returnTo}`);
          navigate(appState.returnTo);
        }
      }
    }, [user, isLoading, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }    

  return (
    <div className={classes.App}>
      <Header />
      <div className={classes.pushBodyDown}>
        <Routes>
          {/* Public Routes: */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/items/:itemid" element={<ItemPage />} />
          <Route path="/" element={<RolesOnly roles={Object.values(Role)}><HomePage /></RolesOnly>} />
          {/* <Route path="/items" element={<HomePage />} /> */}
          {/* Protected Routes: */}
          <Route path="/itemmenu/multiple" element={<RolesOnly roles={[ Role.Admin, Role.Technician ]}><MultiItemEdit /></RolesOnly>} />
          <Route path="/itemmenu" element={<RolesOnly roles={[ Role.Admin, Role.Technician ]}><ItemMenu /></RolesOnly>} />
          <Route path="/itemmenu/:itemid" element={<AdminOnly><ItemMenu /></AdminOnly>} />
          <Route path="/itemmenu/newitem/:newitemid" element={<AdminOnly><ItemMenu /></AdminOnly>} />
          <Route path="/itemnotfound/:itemid" element={<NoItemFound />} />
          <Route path="/managesectors" element={<AdminOnly><SectorManagement /></AdminOnly>} />
          <Route path="/sectormenu" element={<AdminOnly><SectorMenu exit={() => navigate(-1)} /></AdminOnly>} />

          <Route path="/technicians" element={<RolesOnly roles={[ Role.Admin, Role.Technician ]}><Technicians /></RolesOnly>} />
          <Route path="/technicians/:technicianid" element={<RolesOnly roles={[ Role.Admin, Role.Technician ]}><TechnicianPage /></RolesOnly>} />
          <Route path="/technicianmenu" element={<AdminOnly><TechnicianMenu /></AdminOnly>} />          
          <Route path="/technicianmenu/:technicianid" element={<AdminOnly><TechnicianMenu /></AdminOnly>} />
          <Route path="/technicianmenu/newtechnician/:newtechnicianid" element={<AdminOnly><TechnicianMenu /></AdminOnly>} />

          <Route path="/certifications" element={<RolesOnly roles={[ Role.Admin, Role.Technician ]}><Certifications /></RolesOnly>} />
          <Route path="/certifications/:certificationid" element={<RolesOnly roles={[ Role.Admin, Role.Technician ]}><CertificationPage /></RolesOnly>} />
          <Route path="/certificationmenu" element={<RolesOnly roles={[ Role.Admin, Role.Technician ]}><CertificationMenu /></RolesOnly>} />          
          <Route path="/certificationmenu/:certificationid" element={<AdminOnly><CertificationMenu /></AdminOnly>} />
          <Route path="/certificationmenu/newcertification/:newcertificationid" element={<AdminOnly><CertificationMenu /></AdminOnly>} />

          <Route path="/users" element={<AdminOnly><Users /></AdminOnly>} />
          <Route path="/users/:userid" element={<AdminOnly><UserPage /></AdminOnly>} />
          <Route path="/usermenu" element={<AdminOnly><UserMenu /></AdminOnly>} />          
          <Route path="/usermenu/:userid" element={<AdminOnly><UserMenu /></AdminOnly>} />
          <Route path="/usermenu/newuser/:newuserid" element={<AdminOnly><UserMenu /></AdminOnly>} />

          <Route path="/suppliers" element={<AdminOnly><Suppliers /></AdminOnly>} />
          <Route path="/suppliers/:supplierid" element={<AdminOnly><SupplierPage /></AdminOnly>} />
          <Route path="/suppliermenu" element={<AdminOnly><SupplierMenu /></AdminOnly>} />          
          <Route path="/suppliermenu/:supplierid" element={<AdminOnly><SupplierMenu /></AdminOnly>} />
          <Route path="/suppliermenu/newsupplier/:newsupplierid" element={<AdminOnly><SupplierMenu /></AdminOnly>} />                   
        </Routes>
      </div>
      {showWelcome && <div className={classes.welcome} onClick={() => setShowWelcome(false)}>
          <div className={classes.logoWrapper}>
            <h1>hanaref</h1>
            <h2>כל המכשור הרפואי במקום אחד</h2>
          </div>
          <div className={classes.medicalCorps}><img src="/MedicalCorpsSnake.png" alt="medical corps" />חיל הרפואה. בשבילך.</div>
        </div>}
    </div>
  );
}

export default App;

// פריטים רפואיים בקליק
// פריטים רפואיים במקום אחד
// כל הפריטים הרפואיים
// פריטים רפואיים בשלוף
// פריטי הנדסה רפואית
// 