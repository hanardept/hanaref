export const backendFirebaseUri = process.env.REACT_APP_BACKEND_URL;

export const fetchBackend = async(path: string, init?: { method?: string, headers: HeadersInit }, loginWithRedirect?: (f: any) => any,) =>
    fetch(`${backendFirebaseUri}/${path}`, init)
    .then(res => {
        console.log(`status type: ${typeof res.status}`);
        if (res.status === 401) {
            const returnTo = window.location.pathname;
            console.log(`return to: ${returnTo}`);
            loginWithRedirect?.({ appState: { returnTo } });
        }
        console.log(`received res: ${JSON.stringify(res)}, status: ${res.status}`);
        return res;
    })
    .catch(err => {
        console.log(`err: ${err}`);
        throw err;
    })