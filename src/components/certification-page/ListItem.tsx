import { Certification } from '../../types/certification_types';
import classes from './Certifications.module.css';


interface ListItemProps {
    _id: string;
    certification: Certification
    goToCertificationPage: (_id: string) => void;
}


const ListItem = (props: ListItemProps) => {
    const handleClick = () => {
        props.goToCertificationPage(props._id);
    }


    const style: React.CSSProperties = {};

    return (
        <div onClick={handleClick} className={classes.listItem} style={style}>
            <div className={classes.itemTextContent}>
                <h2>{props.certification.item.name}</h2>
                <h2>{props.certification.technician.firstName} {props.certification.technician.lastName}</h2>
            </div>
        </div>
    )
};

export default ListItem;
