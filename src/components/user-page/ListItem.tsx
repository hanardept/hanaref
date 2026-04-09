import { useRef } from 'react';
import { Role, roleNames } from '../../types/user_types';
import { useLongPress } from '@uidotdev/usehooks';


interface ListItemProps {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    role: Role,
    shouldBeColored: boolean;
    goToUserPage?: (_id: string) => void;
    className?: string;
    textContentClassName?: string;
    scrollContainerRef?: HTMLDivElement;
}


const ListItem = (props: ListItemProps) => {
    const startScrollLocation = useRef<number | null>();
    const startMousePosition = useRef<{ x: number, y: number } | null>();
    const lastMousePosition = useRef<{ x: number, y: number } | null>();

    const handleClick = () => {
        props.goToUserPage?.(props._id);
    }

    const hasMoved = (node: Element | null) => {
        const scrollContainerRef = props.scrollContainerRef as Element;
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

    const press = useLongPress((e: Event) => {
    }, {
        onStart: (e) => {
            const scrollContainerRef = props.scrollContainerRef as Element;
            console.log(`start: scroll parent: ${scrollContainerRef?.id}`);
            startScrollLocation.current = scrollContainerRef?.scrollTop;
        },
        onFinish: () => {
            startScrollLocation.current = undefined;
            startMousePosition.current = undefined;
            lastMousePosition.current = undefined;
        },
        onCancel: (e) => {
            if (!hasMoved(e.currentTarget as Element)) {
                handleClick();
            }
            startScrollLocation.current = undefined;
            startMousePosition.current = undefined;
            lastMousePosition.current = undefined;
        },
        threshold: 500
    });    


    const style: React.CSSProperties = {};
    if (props.shouldBeColored) {
        style.backgroundColor = "#ffe1bc";
    }

    return (
        <div {...press}
            onTouchMove={e => {
                //console.log(`current mouse pos: ${JSON.stringify({ x: e.clientX, y: e.clientY })}`);
                console.log(`on touch move. start mouse: ${JSON.stringify(startMousePosition.current)}, start scroll: ${JSON.stringify(startScrollLocation.current)}`);
                lastMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                if (startScrollLocation.current !== undefined && startMousePosition.current === undefined) {
                    startMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
                    console.log(`set start mouse position to: ${JSON.stringify(startMousePosition.current)}`);
                }
            }}         
            onClick={handleClick} className={props.className} style={style}>
                <div className={props.textContentClassName}>
                    <h2>{props.firstName} {props.lastName}</h2>
                    {props.username && <p>{props.username}</p>}
                    <h6>{roleNames[props.role]}</h6>
                </div>
        </div>
    )
};

export default ListItem;
