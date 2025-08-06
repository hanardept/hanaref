import { IoCloudUploadOutline } from "react-icons/io5";
import "./UploadFile.css";
import { ChangeEventHandler } from "react";

const UploadFile = <T extends HTMLInputElement>({ placeholder, url, onChange }: { placeholder: string, url?: string, onChange: ChangeEventHandler<T> | undefined }) => {
    return <div className="file-upload">
        <span>
        {/* <img src={uploadImg} alt="upload" /> */}
        <input type="text" placeholder={placeholder} value={url} disabled={true}/>
        <IoCloudUploadOutline/>
        {/* <h3>Click box to upload</h3> */}
        {/* <p>Maximun file size 10mb</p> */}
        <input type="file" onChange={e => onChange?.(e as any)} />
        </span>
    </div>
}

export default UploadFile;