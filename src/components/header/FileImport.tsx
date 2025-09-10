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
                const err = await res.json().catch(() => ({}));
                alert("שגיאה בייבוא: " + (err.details ? err.details.join("\n") : await res.text()));
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