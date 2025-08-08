import { IoCloudUploadOutline } from "react-icons/io5";
import "./UploadFile.css";
import { ChangeEventHandler } from "react";

const UploadFile = <T extends HTMLInputElement>({ placeholder, url, accept, isUploading, onChange, onClear }
    : { placeholder: string, url?: string, accept?: string, isUploading?: boolean, onChange: ChangeEventHandler<T> | undefined, onClear?: () => void }) => {
    return <div className="file-upload">
        <span>
        {isUploading ? (
                    <progress className="upload-progress" />
                ) : (
                    <span className="text-input-container">
                        <input className="text-input"
                            type="text"
                            placeholder={placeholder}
                            value={url}
                            disabled={true}
                        />
                        {url && (
                            <span className="clear-text"
                                onClick={onClear}
                                title="נקה"
                            >
                                ×
                            </span>
                        )}
                    </span>
                )}
            <span className="upload-button">
                <IoCloudUploadOutline/>
                <input type="file" accept={accept} onChange={e => onChange?.(e as any)} />
            </span>
        </span>
    </div>
}

export default UploadFile;