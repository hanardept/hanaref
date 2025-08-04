import React from "react";
import { AbbreviatedItem } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";

interface ItemRelationsProps {
    catType: "מקט רגיל" | "מקט ערכה";
    kitItem: AbbreviatedItem[];
    models: AbbreviatedItem[];
    accessories: AbbreviatedItem[];
    consumables: AbbreviatedItem[];
    belongsToDevices: AbbreviatedItem[];
    similarItems: AbbreviatedItem[];
    setKitItem: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setModels: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setAccessories: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setConsumables: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setBelongsToDevices: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setSimilarItems: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
}

const ItemRelations = (props: ItemRelationsProps) => {
    const { catType, kitItem, models, accessories, consumables, belongsToDevices, similarItems, setKitItem, setModels, setAccessories, setConsumables, setBelongsToDevices, setSimilarItems } = props;

    return (
        <>
            {catType === "מקט ערכה" && <InfoSectionMenu title="מכשיר" items={kitItem} setItems={setKitItem} />}
            {catType === "מקט רגיל" && <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />}
            <InfoSectionMenu title="אביזרים" items={accessories} setItems={setAccessories} />
            <InfoSectionMenu title="מתכלים" items={consumables} setItems={setConsumables} />
            {catType === "מקט רגיל" && <InfoSectionMenu title="שייך לערכות" items={belongsToDevices} setItems={setBelongsToDevices} />}
            {catType === "מקט רגיל" && <InfoSectionMenu title="קשור ל..." items={similarItems} setItems={setSimilarItems} />}
        </>
    )
}

export default ItemRelations;
