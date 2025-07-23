import classes from './App.module.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { get } from 'idb-keyval';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from './hooks/redux-hooks';
import { authActions } from './store/auth-slice';
import Header from './components/header/Header';
import ItemPage from './components/item-page/ItemPage';
import AdminOnly from './components/authorization/AdminOnly';
import HomePage from './components/item-search/HomePage';
import LoginPage from './components/login/LoginPage';
import ItemMenu from './components/item-menu/ItemMenu';
import SectorManagement from './components/sector-management/SectorManagement';
import SectorMenu from './components/sector-management/SectorMenu';
import NoItemFound from './components/item-page/NoItemFound';
import Technicians from './components/technician-page/Technicians';
import TechnicianPage from './components/technician-page/TechnicianPage';
import TechnicianMenu from './components/technician-menu/TechnicianMenu';

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const firstRender = useRef(true);

  console.log(`firstRender: ${firstRender.current}, showWelcome: ${showWelcome}`);

  useEffect(() => {
    if (firstRender.current) {
      console.log(`App first render, setting showWelcome to true`);
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

  return (
    <div className={classes.App}>
      <Header />
      <div className={classes.pushBodyDown}>
        <Routes>
          {/* Public Routes: */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/items/:itemid" element={<ItemPage />} />
          <Route path="/" element={<HomePage />} />
          {/* Protected Routes: */}
          <Route path="/itemmenu" element={<AdminOnly><ItemMenu /></AdminOnly>} />
          <Route path="/itemmenu/:itemid" element={<AdminOnly><ItemMenu /></AdminOnly>} />
          <Route path="/itemmenu/newitem/:newitemid" element={<AdminOnly><ItemMenu /></AdminOnly>} />
          <Route path="/itemnotfound/:itemid" element={<NoItemFound />} />
          <Route path="/managesectors" element={<AdminOnly><SectorManagement /></AdminOnly>} />
          <Route path="/sectormenu" element={<AdminOnly><SectorMenu exit={() => navigate(-1)} /></AdminOnly>} />
          <Route path="/technicians" element={<AdminOnly><Technicians /></AdminOnly>} />
          <Route path="/technicians/:technicianid" element={<AdminOnly><TechnicianPage /></AdminOnly>} />
          <Route path="/technicianmenu" element={<AdminOnly><TechnicianMenu /></AdminOnly>} />          
          <Route path="/technicianmenu/:technicianid" element={<AdminOnly><TechnicianMenu /></AdminOnly>} />
          <Route path="/technicianmenu/newtechnician/:newtechnicianid" element={<AdminOnly><TechnicianMenu /></AdminOnly>} />
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