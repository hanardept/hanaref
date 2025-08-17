import classes from './Users.module.css';


interface ListItemProps {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    shouldBeColored: boolean;
    goToUserPage?: (_id: string) => void;
    className?: string;
    textContentClassName?: string;
}


const ListItem = (props: ListItemProps) => {
    const handleClick = () => {
        props.goToUserPage?.(props._id);
    }


    const style: React.CSSProperties = {};
    if (props.shouldBeColored) {
        style.backgroundColor = "#ffe1bc";
    }

    return (
        <div onClick={handleClick} className={props.className} style={style}>
            <div className={props.textContentClassName}>
                <h2>{props.firstName} {props.lastName}</h2>
                {props.username && <h6>{props.username}</h6>}
            </div>
        </div>
    )
};

export default ListItem;
