import { useRef } from "react";
import { useAppSelector } from "../../hooks/redux-hooks";
import { fetchBackend } from "../../backend-variables/address";


const FileImport = ({ children }: { children: any }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const authToken = useAppSelector(state => state.auth.jwt);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("excelFile", file);

        try {
            const res = await fetchBackend(`items/import-worksheet`, {
                method: "POST",
                headers: {
                    "auth-token": authToken,
                },
                body: formData
            });
            if (res.ok) {
                alert("הייבוא הצליח!");
            } else {
                const contentType = res.headers.get('Content-Type');
                let alertText;
                if (contentType?.includes('text/html')) {
                    alertText = await res.text();
                } else if (contentType?.includes('application/json')) {
                    const err = await res.json();
                    alertText = err.details ? err.details.join("\n") : '';
                }
                if (!alertText.length) {
                    alertText = 'שגיאה בלתי צפויה';
                }
                alert("שגיאה בייבוא: " + alertText);
            }
        } catch (e) {
            alert("שגיאה בייבוא: " + e);
        } finally {
            event.target.value = ""; // allow re-uploading the same file
        }
    };

    return (
        <>
            <span onClick={handleImportClick} style={{ lineHeight: 0, cursor: "pointer" }}>
                {children}
            </span>
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
        </>
    );
}

export default FileImport;