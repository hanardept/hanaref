import { IoCloudUploadOutline } from "react-icons/io5";
import "./UploadFile.css";
import { ChangeEventHandler } from "react";

const UploadFile = <T extends HTMLInputElement>({ placeholder, url, accept, isUploading, onChange }
    : { placeholder: string, url?: string, accept?: string, isUploading?: boolean, onChange: ChangeEventHandler<T> | undefined }) => {
    return <div className="file-upload">
        <span>
            {isUploading ?
            <progress className="upload-progress"/> :
            <input type="text" placeholder={placeholder} value={url} disabled={true}/>}
            <span>
                <IoCloudUploadOutline/>
                <input type="file" accept={accept} onChange={e => onChange?.(e as any)} />
            </span>
        </span>
    </div>
}

export default UploadFile;