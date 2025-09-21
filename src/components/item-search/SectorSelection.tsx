import React from "react";

const SectorSelection = ({ sectorNames, handleSetSector, priorChosenSector, required }:
    { sectorNames: string[], handleSetSector: ((value: string) => void) | undefined, priorChosenSector?: string, required?: boolean }) => {
    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSetSector?.(event.target.value);
    }
    
    return (
        <select name="sectors" id="sectors" onChange={handleSelect} value={priorChosenSector} required={required}>
            <option value="">בחר מדור...{required ? ' *' : ''}</option>
            {sectorNames.map(s => <option key={`${s}x`} value={s}>{s}</option>)}
        </select>
    );
};

export default SectorSelection;