import { useNavigate } from "react-router-dom";
import { AbbreviatedItem, Item } from "../../types/item_types";
import classes from './ItemPage.module.css';

interface InfoSectionProps {
    title: string;
    fieldName: keyof Item;
    item: Item;
    isAdmin: boolean;
    decision?: 'approve' | 'reject';
    onDecision: (field: string, action: 'approve' | 'reject' | null) => void;
    unclickable?: boolean;
}

const InfoSection = ({ title, fieldName, item, isAdmin, decision, onDecision, unclickable }: InfoSectionProps) => {
    const navigate = useNavigate();

    const liveElements: AbbreviatedItem[] = (item[fieldName] as AbbreviatedItem[]) || [];
    const pendingElements: AbbreviatedItem[] = (item as any).pendingChanges?.[fieldName];

    // If no pending changes for this specific list, render the original logic
    if (pendingElements === undefined) {
        return (
            <>
                <h2>{title}</h2>
                {liveElements.map(m => (
                    <div 
                        onClick={() => { if (!unclickable) navigate(`/items/${m.cat}`) }}
                        key={m.cat}
                        className={!unclickable ? classes.clickable : ""}
                    >
                        <p>{`${m.cat} - ${m.name}`}</p>
                        {m.imageLink && <img alt={m.name} className={classes.accessoryImage} src={m.imageLink} />}
                    </div>
                ))}
            </>
        );
    }

    // Calculate Diff
    const added = pendingElements.filter(p => !liveElements.find(l => l.cat === p.cat));
    const removed = liveElements.filter(l => !pendingElements.find(p => p.cat === l.cat));
    const unchanged = liveElements.filter(l => pendingElements.find(p => p.cat === l.cat));

    return (
        <div className={`${classes.diffContainer} ${decision ? classes[decision] : ''}`}>
            <h2 className={classes.diffLabel}>{title} (שינויים ממתינים)</h2>
            
            <div className={classes.diffBox}>
                {/* Removed Items - Red */}
                {removed.map(m => (
                    <div key={m.cat} className={`${classes.valueOld} ${classes.listDiffItem}`}>
                        <span>{`הסרה: ${m.cat} - ${m.name}`}</span>
                    </div>
                ))}

                {/* Added Items - Green */}
                {added.map(m => (
                    <div key={m.cat} className={`${classes.valueNew} ${classes.listDiffItem}`}>
                        <span>{`הוספה: ${m.cat} - ${m.name}`}</span>
                    </div>
                ))}

                {/* Unchanged Items - Neutral */}
                {unchanged.length > 0 && (
                    <div className={classes.unchangedList}>
                        <small>ללא שינוי:</small>
                        {unchanged.map(m => <div key={m.cat} className={classes.neutralItem}>{`${m.cat} - ${m.name}`}</div>)}
                    </div>
                )}

                {isAdmin && (
                    <div className={classes.diffActions}>
                        <button 
                            onClick={() => onDecision(fieldName as string, decision === 'approve' ? null : 'approve')} 
                            className={`${classes.approveBtn} ${decision === 'approve' ? classes.active : ''}`}
                        >
                            {decision === 'approve' ? 'ביטול בחירה' : 'אשר רשימה'}
                        </button>
                        <button 
                            onClick={() => onDecision(fieldName as string, decision === 'reject' ? null : 'reject')} 
                            className={`${classes.rejectBtn} ${decision === 'reject' ? classes.active : ''}`}
                        >
                            {decision === 'reject' ? 'ביטול בחירה' : 'דחה רשימה'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InfoSection;