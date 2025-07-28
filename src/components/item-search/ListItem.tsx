// src/components/item-search/ListItem.tsx

import classes from './HomePage.module.css'; // Uses the same CSS file as HomePage

// highlight-start
// 1. Add 'isArchived' to the props interface.
interface ListItemProps {
    name: string;
    cat: string;
    imageLink?: string;
    shouldBeColored: boolean;
    goToItemPage: (cat: string) => void;
    isArchived?: boolean; // It's optional so existing uses don't break.
    className?: string;
    textContentClassName?: string;
    imageClassName?: string;
}
// highlight-end

const ListItem = (props: ListItemProps) => { // Use the new interface
    const handleClick = () => {
        props.goToItemPage(props.cat);
    }

    // highlight-start
    // 2. Combine styles and classes conditionally.
    // Start with a base style object.
    const style: React.CSSProperties = {};
    if (props.shouldBeColored) {
        style.backgroundColor = "#ffe1bc";
    }

    // If archived, add a different background and make it slightly transparent.
    if (props.isArchived) {
        style.backgroundColor = "#f0f0f0"; // A light grey for archived items
        style.opacity = 0.7;
    }
    // highlight-end

    return (
        // 3. Apply the combined style object.
        <div onClick={handleClick} className={props.className} style={style}>
            <div className={props.textContentClassName}>
                <h2>{props.name}</h2>
                <p>{props.cat}</p>
            </div>
            {props.imageLink?.length !== undefined && props.imageLink?.length > 0 && <img src={props.imageLink} alt={props.cat} className={props.imageClassName} />}
            {/* 4. Add a visual marker for archived items using a span. */}
            {props.isArchived && <span className={classes.archivedBadge}>בארכיון</span>}
        </div>
    )
};

export default ListItem;
