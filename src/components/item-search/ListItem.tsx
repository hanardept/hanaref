// src/components/item-search/ListItem.tsx

import classes from './HomePage.module.css'; // Uses the same CSS file as HomePage

interface ListItemProps {
    name: string;
    cat: string;
    kitCat?: string;
    imageLink?: string;
    shouldBeColored: boolean;
    goToItemPage?: (cat: string) => void;
    isArchived?: boolean;
    className?: string;
    textContentClassName?: string;
    imageClassName?: string;
    customElement?: React.ReactNode;
}

const ListItem = (props: ListItemProps) => {
    const handleClick = () => {
        props.goToItemPage?.(props.cat);
    }

    const style: React.CSSProperties = {};
    if (props.shouldBeColored) {
        style.backgroundColor = "#ffe1bc";
    }

    // If archived, add a different background and make it slightly transparent.
    if (props.isArchived) {
        style.backgroundColor = "#f0f0f0";
        style.opacity = 0.7;
    }

    const catText = [
        { label: 'מק"ט', value: props.cat },
        { label: 'מק"ט ערכה', value: props.kitCat },
    ].filter(part => part.value?.length)
    .map(part => `${part.label}: ${part.value}`)
    .join(' | ');

    return (
        <div onClick={handleClick} className={props.className} style={style}>
            <div className={props.textContentClassName} data-custom-element={props.customElement}>
                <h2>{props.name}</h2>
                <p>{catText}</p>
            </div>
            <div className={classes.customElementContainer} data-custom-element={props.customElement}>
                {props.customElement}
            </div>
            {props.imageLink?.length !== undefined && props.imageLink?.length > 0 && <img src={props.imageLink} alt={props.cat} className={props.imageClassName} />}
            {/* 4. Add a visual marker for archived items using a span. */}
            {props.isArchived && <span className={classes.archivedBadge}>בארכיון</span>}
        </div>
    )
};

export default ListItem;
