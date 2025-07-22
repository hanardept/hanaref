import classes from './Technicians.module.css';


interface ListItemProps {
    id: string;
    firstName: string;
    lastName: string;
    goToTechnicianPage: (_id: string) => void;
}


const ListItem = (props: ListItemProps) => { // Use the new interface
    const handleClick = () => {
        props.goToTechnicianPage(props.id);
    }


    const style: React.CSSProperties = {};
    // if (props.shouldBeColored) {
    //     style.backgroundColor = "#ffe1bc";
    // }

    return (
        // 3. Apply the combined style object.
        <div onClick={handleClick} className={classes.listItem} style={style}>
            <div className={classes.itemTextContent}>
                <h2>{props.firstName} {props.lastName}</h2>
                {/* <p>{props.cat}</p> */}
            </div>
        </div>
    )
};

export default ListItem;
