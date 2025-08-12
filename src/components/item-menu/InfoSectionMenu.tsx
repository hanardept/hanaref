import React from 'react';
import { AbbreviatedItem } from '../../types/item_types';
import InfoSectionLine from './InfoSectionLine';

const InfoSectionMenu = ({ title, items, setItems, itemSuggestions, onFetchSuggestions, onClearSuggestions, onBlur }: { 
        title: string,
        items: AbbreviatedItem[],
        setItems: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>
        itemSuggestions?: AbbreviatedItem[],
        onFetchSuggestions?: (value: string, field: string) => any,
        onClearSuggestions?: () => any,
        onBlur?: () => any,
    }) => {
    const editItemCat = (index: number, cat: string) => {
        setItems(prev => {
            const output = [...prev];
            output[index].cat = cat;
            return output;
        });
    }
    const editItemName = (index: number, name: string) => {
        setItems(prev => {
            const output = [...prev];
            output[index].name = name;
            return output;
        });
    }
    const editItemManufacturer = (index: number, manufacturer: string) => {
        setItems(prev => {
            const output = [...prev];
            output[index].manufacturer = manufacturer;
            return output;
        });
    }
    const addLine = () => {
        setItems(prev => {
            const output = [...prev];
            output.push({ name: "", cat: "", manufacturer: "" });
            return output;
        })
    };
    const deleteLine = (index: number) => {
        setItems(prev => {
            const output = [...prev];
            // if there is 1 item left, do not delete it, just reset the fields
            if (output.length === 1) {
                output[0].cat = "";
                output[0].name = "";
                output[0].manufacturer = "";
            } else {
                output.splice(index, 1);
            }
            return output;
        });
    }

    return (
        <>
            <h3 style={{ textAlign: "right" }}>{title}</h3>
            {/* Display at least 1 line, even if there are no items */}
            {Array.from({ length: items?.length ? items.length : 1 }).map((_, index) => {
                const isLast = index === items.length - 1;
                const item = items[index];
                return <InfoSectionLine 
                            first={index === 0}
                            key={index+title+(isLast ? "b" : "a")}
                            isLast={isLast}
                            addLine={addLine}
                            deleteLine={() => deleteLine(index)}
                            item={item}
                            editItemName={(name: string) => editItemName(index, name)}
                            editItemCat={(cat: string) => editItemCat(index, cat)}
                            editItemManufacturer={(manufacturer: string) => editItemManufacturer(index, manufacturer)}
                            modelsLine={title==="דגמים"}
                            itemSuggestions={itemSuggestions}
                            onFetchSuggestions={onFetchSuggestions}
                            onClearSuggestions={onClearSuggestions}
                            onBlur={onBlur}
                        />
            })}
        </>
    )
};

export default InfoSectionMenu;