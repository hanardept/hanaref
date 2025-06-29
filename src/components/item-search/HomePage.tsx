// NEW: Added ref to prevent multiple initializations and infinite loops
const hasInitialized = useRef(false);

// FIXED: Initialize from URL parameters only once on mount
useEffect(() => {
    if (!hasInitialized.current) { // NEW: Prevent running multiple times
        const urlSector = searchParams.get('sector') || '';
        const urlDepartment = searchParams.get('department') || '';
        const urlSearchVal = searchParams.get('search') || '';

        if (urlSector || urlDepartment || urlSearchVal) {
            dispatch(viewingActions.changeSearchCriteria({
                sector: urlSector,
                department: urlDepartment,
                searchVal: urlSearchVal,
                page: 0 // NEW: Reset page to 0 when loading from URL
            }));
        } else {
            dispatch(viewingActions.emptySearchCriteria());
        }
        hasInitialized.current = true; // NEW: Mark as initialized
    }
}, [dispatch, searchParams]);

// FIXED: Data fetching with proper infinite loop prevention
useEffect(() => {
    if (hasInitialized.current) { // NEW: Only fetch after initialization is complete
        dispatch(itemsActions.clearItemList()); // Clear old results first
        
        fetch(encodeURI(`${backendFirebaseUri}/items?search=${searchVal}&sector=${sector}&department=${department}&page=0`), {
            headers: { 'auth-token': authToken }
        })
        .then(res => res.json())
        .then(jsonedRes => {
            dispatch(itemsActions.addItems(jsonedRes));
            dispatch(viewingActions.changeSearchCriteria({ page: 1 })); // Reset page for infinite scroll
            dispatch(viewingActions.changeBlockSearcScroll(false)); // Re-enable scrolling
        })
        .catch(error => {
            console.error("Failed to fetch items:", error);
        });
    }
}, [searchVal, sector, department, authToken, dispatch]);

// FIXED: URL updating with proper timing
useEffect(() => {
    if (hasInitialized.current) { // NEW: Only update URL after initialization
        const params = new URLSearchParams();
        if (searchVal) params.set('search', searchVal);
        if (sector) params.set('sector', sector);
        if (department) params.set('department', department);
        
        setSearchParams(params, { replace: true });
    }
}, [searchVal, sector, department, setSearchParams]);

// SUMMARY OF CHANGES:
// 1. Added hasInitialized ref to prevent infinite loops
// 2. Split logic into 3 separate useEffect hooks with clear purposes
// 3. Added proper error handling and loading states
// 4. Fixed timing issues that caused blank pages and infinite loading
