import classes from './Technicians.module.css';


interface ListItemProps {
    _id?: string;
    id: string;
    firstName: string;
    lastName: string;
    association?: string
    isArchived?: boolean;
    shouldBeColored: boolean;
    goToTechnicianPage?: (_id: string) => void;
    className?: string;
    textContentClassName?: string;
}


const ListItem = (props: ListItemProps) => {
    const handleClick = () => {
        props.goToTechnicianPage?.(props._id ?? props.id);
    }


    const style: React.CSSProperties = {};
    if (props.shouldBeColored) {
        style.backgroundColor = "#ffe1bc";
    }

    if (props.isArchived) {
        style.backgroundColor = "#f0f0f0";
        style.opacity = 0.7;
    }

    return (
        <div onClick={handleClick} className={props.className} style={style}>
            <div className={props.textContentClassName}>
                <h2>{props.firstName} {props.lastName}</h2>
                <p>{props.id}</p>
                {props.association && <h6>{props.association}</h6>}
            </div>
            {props.isArchived && <span className={classes.archivedBadge}>בארכיון</span>}
        </div>
    )
};

export default ListItem;
