import { CatType } from "../../types/item_types";

const CatTypeSelection = ({ catTypes, selectCatType, currentCatType }: { catTypes?: CatType[], selectCatType: ((catType: CatType) => void) | undefined, currentCatType: "מכשיר" | "אביזר" | "מתכלה" | "חלק חילוף" }) => {
    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        selectCatType?.(event.target.value as CatType);
    }

    return (
        <select name="cattype" id="cattype" onChange={handleSelect} value={currentCatType}>
            {(catTypes ?? Object.values(CatType)).map(ct => <option>{ct}</option>)}
        </select>
    )
};

export default CatTypeSelection;