import { Certification } from '../../types/certification_types';
import classes from './ListItem.module.css';

interface ListItemProps {
    _id: string;
    certification: Certification;
    goToCertificationPage: (_id: string) => void;
    className?: string;
    textContentClassName?: string;
    customElement?: React.ReactElement;
}


const ListItem = (props: ListItemProps) => {
    const handleClick = () => {
        props.goToCertificationPage(props._id);
    }


    const style: React.CSSProperties = {};

    return (
        <div onClick={handleClick} className={props.className} style={style}>
            <div className={props.textContentClassName} data-custom-element={props.customElement}>
                <h2>{props.certification.item.name}</h2>
                <h2>{props.certification.technician.firstName} {props.certification.technician.lastName}</h2>
            </div>
            <div className={classes.customElementContainer} data-custom-element={props.customElement}>
                {props.customElement}
            </div>            
        </div>
    )
};

export default ListItem;
