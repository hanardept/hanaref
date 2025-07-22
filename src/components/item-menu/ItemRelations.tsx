import React from "react";
import { AbbreviatedItem } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";

interface ItemRelationsProps {
    catType: "מקט רגיל" | "מקט ערכה";
    kitItem: AbbreviatedItem[];
    models: AbbreviatedItem[];
    accessories: AbbreviatedItem[];
    consumables: AbbreviatedItem[];
    belongsToKits: AbbreviatedItem[];
    similarItems: AbbreviatedItem[];
    setKitItem: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setModels: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setAccessories: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setConsumables: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setBelongsToKits: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setSimilarItems: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
}

const ItemRelations = (props: ItemRelationsProps) => {
    const { catType, kitItem, models, accessories, consumables, belongsToKits, similarItems, setKitItem, setModels, setAccessories, setConsumables, setBelongsToKits, setSimilarItems } = props;

    return (
        <>
            {catType === "מקט ערכה" && <InfoSectionMenu title="מכשיר" items={kitItem} setItems={setKitItem} />}
            {catType === "מקט רגיל" && <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />}
            <InfoSectionMenu title="אביזרים" items={accessories} setItems={setAccessories} />
            <InfoSectionMenu title="מתכלים" items={consumables} setItems={setConsumables} />
            {catType === "מקט רגיל" && <InfoSectionMenu title="שייך לערכות" items={belongsToKits} setItems={setBelongsToKits} />}
            {catType === "מקט רגיל" && <InfoSectionMenu title="קשור ל..." items={similarItems} setItems={setSimilarItems} />}
        </>
    )
}

export default ItemRelations;
