import classes from './Technicians.module.css';


interface ListItemProps {
    _id: string;
    id: string;
    firstName: string;
    lastName: string;
    association: string
    goToTechnicianPage: (_id: string) => void;
}


const ListItem = (props: ListItemProps) => {
    const handleClick = () => {
        props.goToTechnicianPage(props._id);
    }


    const style: React.CSSProperties = {};

    return (
        <div onClick={handleClick} className={classes.listItem} style={style}>
            <div className={classes.itemTextContent}>
                <h2>{props.firstName} {props.lastName}</h2>
                <p>{props.id}</p>
                <h6>{props.association}</h6>
            </div>
        </div>
    )
};

export default ListItem;
