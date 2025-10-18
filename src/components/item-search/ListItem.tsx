// src/components/item-search/ListItem.tsx

import { useRef } from 'react';
import classes from './HomePage.module.css'; // Uses the same CSS file as HomePage
import { useLongPress } from "@uidotdev/usehooks";

interface ListItemProps {
    name: string;
    cat: string;
    kitCat?: string;
    imageLink?: string;
    shouldBeColored: boolean;
    goToItemPage?: (cat: string) => void;
    selectItem?: () => void;
    isArchived?: boolean;
    className?: string;
    textContentClassName?: string;
    imageClassName?: string;
    customElement?: React.ReactNode;
    scrollContainerRef?: HTMLDivElement;
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

    const startScrollLocation = useRef<number | null>();
    const startMousePosition = useRef<{ x: number, y: number } | null>();
    const lastMousePosition = useRef<{ x: number, y: number } | null>();

    function getScrollParent(node: Element | null): Element | null {
        if (node == null) {
            return null;
        }

        if (node.scrollHeight > node.clientHeight) {
            return node;
        } else {
            return getScrollParent(node.parentElement as Element);
        }
    }

    const hasMoved = () => {
        const scrollContainerRef = getScrollParent(document.activeElement);
        if (scrollContainerRef) {
            const movement = Math.abs(startScrollLocation.current! - scrollContainerRef.scrollTop!)
            if (movement > 20) {
                return true;
            }
        }
        console.log(`lastMouse: ${JSON.stringify(lastMousePosition.current)}, startMouse: ${JSON.stringify(startMousePosition.current)}`);
        if (lastMousePosition.current && startMousePosition.current) {
            if (Math.abs(lastMousePosition.current.x - startMousePosition.current?.x!) > 5 || Math.abs(lastMousePosition.current.y - startMousePosition.current?.y!) > 5) {
                return true;
            }
        }
        return false;
    }

    const press = useLongPress((e: any) => {
        if (!hasMoved()) {
            props.selectItem?.();
        }
    }, {
        onStart: (e) => {
            const scrollContainerRef = getScrollParent(e.currentTarget as Element);
            startScrollLocation.current = scrollContainerRef?.scrollTop;
        },
        onFinish: () => {
            startScrollLocation.current = undefined;
            startMousePosition.current = undefined;
            lastMousePosition.current = undefined;
        },
        onCancel: (e) => {
            if (!hasMoved()) {
                handleClick();
            }
            startScrollLocation.current = undefined;
            startMousePosition.current = undefined;
            lastMousePosition.current = undefined;
        },
        threshold: 500
    });

    return (
        <div {...press}
            // onTouchMove={e => console.log(`touch mouse move: ${JSON.stringify({ x: e.touches[0].clientX, y: e.touches[0].clientY })}`)}

            //onPointerMove={e => {
            onTouchMove={e => {
            //console.log(`current mouse pos: ${JSON.stringify({ x: e.clientX, y: e.clientY })}`);
            lastMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            if (startScrollLocation.current !== undefined && startMousePosition.current === undefined) {
                startMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
                console.log(`set start mouse position to: ${JSON.stringify(startMousePosition.current)}`);
            }}} className={props.className} style={style}>
            <div className={props.textContentClassName} data-custom-element={props.customElement}>
                <h2>{props.name}</h2>
                <p>{catText}</p>
            </div>
            <div className={classes.customElementContainer} data-custom-element={props.customElement}>
                {props.customElement}
            </div>
            {props.imageLink?.length !== undefined && props.imageLink?.length > 0 && <img src={props.imageLink} alt={props.cat} className={props.imageClassName} />}
            {props.isArchived && <span className={classes.archivedBadge}>בארכיון</span>}
        </div>
    )
};

export default ListItem;
