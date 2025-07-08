// src/components/item-search/ListItem.tsx

import classes from './HomePage.module.css'; // Uses the same CSS file as HomePage

interface ListItemProps {
    name: string;
    cat: string;
    shouldBeColored: boolean;
    goToItemPage: (cat: string) => void;
    isArchived?: boolean;
}

const ListItem = (props: ListItemProps) => {
    console.log('ListItem props:', props.name, 'isArchived:', props.isArchived, 'shouldBeColored:', props.shouldBeColored); // DEBUG LINE

    const handleClick = () => {
        props.goToItemPage(props.cat);
    }

    const itemStyle: React.CSSProperties = {};

    if (props.isArchived) {
        itemStyle.backgroundColor = "#f0f0f0"; // Light grey for archived items
    }

    // If shouldBeColored (e.g. missing image), this takes precedence
    if (props.shouldBeColored) {
        itemStyle.backgroundColor = "#ffe1bc"; // Orange background for missing image
    }

    const displayName = props.isArchived ? `${props.name} (בארכיון)` : props.name;

    return (
        <div onClick={handleClick} className={classes.listItem} style={itemStyle}>
            <h2>{displayName}</h2>
            <p>{props.cat}</p>
            {/* The existing archivedBadge can be removed if not used, or kept for other purposes if any */}
            {/* For this task, we are adding "(בארכיון)" to the name directly */}
        </div>
    )
};

export default ListItem;
