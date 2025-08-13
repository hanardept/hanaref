export const associationOptions = [
     'הבימ"ל הרפואי',
     'מדור בחינה במקרפ"ר',
];

const AssociationSelection = ({ selectAssociation, priorChosenAssociation }: { selectAssociation: (association: string) => void, priorChosenAssociation: string }) => {
    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        selectAssociation(event.target.value);
    }

    return (
        <select name="association" id="association" value={priorChosenAssociation} onChange={handleSelect}>
            {associationOptions.map(option => (
            <option>{option}</option>
            ))}
        </select>
    )
};

export default AssociationSelection;