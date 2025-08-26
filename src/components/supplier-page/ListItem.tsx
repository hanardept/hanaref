import { Supplier } from '../../types/supplier_types';

interface ListItemProps {
    _id: string;
    supplier: Supplier;
    goToSupplierPage: (_id: string) => void;
    className?: string;
    textContentClassName?: string;
}


const ListItem = (props: ListItemProps) => {
    const handleClick = () => {
        props.goToSupplierPage(props._id);
    }


    const style: React.CSSProperties = {};

    return (
        <div onClick={handleClick} className={props.className} style={style}>
            <div className={props.textContentClassName}>
                <h2>{props.supplier.name}</h2>
                <h2>{props.supplier.id}</h2>
            </div>       
        </div>
    )
};

export default ListItem;
