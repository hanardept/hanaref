import { useNavigate, useParams } from "react-router-dom";
import AdminOnly from "../authorization/AdminOnly";
import BigButton from "../UI/BigButton";

const NoItemFound = () => {
    const navigate = useNavigate();
    const params = useParams();

    const moveToCreatingItemPage = () => {
        navigate(`/itemmenu/newitem/${params.itemid}`);
    }

    return (
        <>
            <p>{`לא נמצא ערך עבור ${params.itemid}`}</p>
            <AdminOnly hide={true}><BigButton text="צור ערך" action={moveToCreatingItemPage} /></AdminOnly>
        </>
    )
};

export default NoItemFound;