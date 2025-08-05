import { MdAddCircle, MdEdit, MdRemoveCircle } from "react-icons/md"
import classes from './MultiItem.module.css';
import { useState } from "react";

const MultiItem = ({ items, getElementForItem, getNewItemSelectElement, allowAdd, allowEdit, allowRemove, onAdd, onEdit, onRemove }: {
    items: any[],
    getElementForItem: (item: any) => JSX.Element,
    getNewItemSelectElement: JSX.Element,
    allowAdd: boolean,
    allowEdit: (item: any) => boolean,
    allowRemove: (item: any) => boolean,
    onAdd?: () => void,
    onEdit?: (item: any) => void,
    onRemove?: (item: any) => void,
}) => {

    const [addItemRequested, setAddItemRequested] = useState(false);

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {items?.map(item => 
                        <span className={classes.listItemContainer}>
                            <>{getElementForItem(item)}</>
                            {allowEdit(item) ? 
                            <MdEdit
                                onClick={() => onEdit?.(item)}
                            /> :
                            allowRemove(item) ? <MdRemoveCircle
                                onClick={() => onRemove?.(item)}
                            /> : <></>}
                        </span>
                    )}
                    {!addItemRequested || !allowAdd ? 
                    getNewItemSelectElement :
                    <span className={classes.addButtonContainer}>
                        <MdAddCircle onClick={() => setAddItemRequested(true)}/>
                    </span>}
            </div>
}

export default MultiItem;
