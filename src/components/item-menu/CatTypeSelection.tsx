const CatTypeSelection = ({ selectCatType, currentCatType }: { selectCatType: (catType: "מכשיר" | "אביזר" | "מתכלה" | "חלק חילוף") => void, currentCatType: "מכשיר" | "אביזר" | "מתכלה" | "חלק חילוף" }) => {
    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        selectCatType(event.target.value as "מכשיר" | "אביזר" | "מתכלה" | "חלק חילוף");
    }

    return (
        <select name="cattype" id="cattype" onChange={handleSelect} value={currentCatType}>
            <option>מכשיר</option>
            <option>אביזר</option>
            <option>מתכלה</option>
            <option>חלק חילוף</option>
        </select>
    )
};

export default CatTypeSelection;