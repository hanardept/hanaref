import { useNavigate, useParams } from "react-router-dom";
import AdminOnly from "../authorization/RolesOnly";
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
            <AdminOnly><BigButton text="צור ערך" action={moveToCreatingItemPage} /></AdminOnly>
        </>
    )
};

export default NoItemFound;