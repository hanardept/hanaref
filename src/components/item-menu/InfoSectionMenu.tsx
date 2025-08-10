import React from 'react';
import { AbbreviatedItem } from '../../types/item_types';
import InfoSectionLine from './InfoSectionLine';

const InfoSectionMenu = ({ title, items, setItems, itemSuggestions, onFetchSuggestions, onClearSuggestions }: { 
        title: string,
        items: AbbreviatedItem[],
        setItems: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>
        itemSuggestions?: AbbreviatedItem[],
        onFetchSuggestions?: (value: string) => any,
        onClearSuggestions?: () => any,
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
    const deleteLine = () => {
        setItems(prev => {
            const output = [...prev];
            return output.slice(0, output.length-1);
        });
    }

    return (
        <>
            <h3 style={{ textAlign: "right" }}>{title}</h3>
            <InfoSectionLine 
                isLast={items.length === 1}
                addLine={addLine}
                deleteLine={deleteLine}
                item={items[0]}
                editItemName={(name: string) => editItemName(0, name)}
                editItemCat={(cat: string) => editItemCat(0, cat)}
                editItemManufacturer={(manufacturer: string) => editItemManufacturer(0, manufacturer)}
                first={true}
                modelsLine={title==="דגמים"}
                itemSuggestions={itemSuggestions}
                onFetchSuggestions={onFetchSuggestions}
                onClearSuggestions={onClearSuggestions}
            />
            {items.map((item, index) => {
                if (index === 0) return <React.Fragment key={title+"f"}></React.Fragment>;
                if (index === items.length - 1) {
                    return <InfoSectionLine 
                                key={index+title+"a"}
                                isLast={true}
                                addLine={addLine}
                                deleteLine={deleteLine}
                                item={item}
                                editItemName={(name: string) => editItemName(index, name)}
                                editItemCat={(cat: string) => editItemCat(index, cat)}
                                editItemManufacturer={(manufacturer: string) => editItemManufacturer(index, manufacturer)}
                                modelsLine={title==="דגמים"}
                                itemSuggestions={itemSuggestions}
                                onFetchSuggestions={onFetchSuggestions}
                                onClearSuggestions={onClearSuggestions}
                            />
                } else {
                    return <InfoSectionLine key={index+title+"b"} isLast={false} addLine={addLine} deleteLine={deleteLine} item={item} editItemName={(name: string) => editItemName(index, name)} editItemCat={(cat: string) => editItemCat(index, cat)} editItemManufacturer={(manufacturer: string) => editItemManufacturer(index, manufacturer)} modelsLine={title==="דגמים"} itemSuggestions={itemSuggestions} onFetchSuggestions={onFetchSuggestions} onClearSuggestions={onClearSuggestions} />
                }
            })}
        </>
    )
};

export default InfoSectionMenu;