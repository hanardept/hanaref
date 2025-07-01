import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendFirebaseUri } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import { AbbreviatedItem, Item } from '../../types/item_types';
import { Sector, Department } from '../../types/sector_types';
import DepartmentSelection from '../item-search/DepartmentSelection';
import SectorSelection from '../item-search/SectorSelection';
import AreYouSure from '../UI/AreYouSure';
import BigButton from '../UI/BigButton';
import CatTypeSelection from './CatTypeSelection';
import InfoSectionMenu from './InfoSectionMenu';
import classes from './ItemMenu.module.css';

function vacateItemListIfEmptyAndRemoveSpaces(itemList: AbbreviatedItem[]) {
  const filtered = itemList.filter(i => i.cat !== "" || i.name !== "");
  return filtered.map(i => {
    const output = { ...i };
    output.cat = output.cat.replace(/ /g, '');
    return output;
  });
}

const ItemMenu: React.FC = () => {
  const params = useParams<{ itemid?: string; newitemid?: string }>();
  const authToken = useAppSelector(state => state.auth.jwt);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [sectorsToChooseFrom, setSectorsToChooseFrom] = useState<Sector[]>([]);
  const [name, setName] = useState("");
  const [cat, setCat] = useState(params.newitemid || "");
  const [sector, setSector] = useState("");
  const [department, setDepartment] = useState("");
  const [catType, setCatType] = useState<"מקט רגיל" | "מקט ערכה">("מקט רגיל");
  const [description, setDescription] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [qaStandardLink, setQaStandardLink] = useState("");
  const [models, setModels] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
  const [accessories, setAccessories] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
  const [consumables, setConsumables] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
  const [belongsToKits, setBelongsToKits] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
  const [similarItems, setSimilarItems] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
  const [kitItem, setKitItem] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
  const [areYouSureDelete, setAreYouSureDelete] = useState(false);

  const itemDetails = {
    name,
    cat: cat.replace(/ /g, ''),
    sector,
    department,
    catType,
    description,
    imageLink,
    qaStandardLink,
    models,
    accessories,
    consumables,
    belongsToKits,
    similarItems,
    kitItem
  };

  useEffect(() => {
    const getSectors = async (): Promise<Sector[]> => {
      const res = await fetch(`${backendFirebaseUri}/sectors`, {
        headers: { 'auth-token': authToken }
      });
      return res.json();
    };

    if (params.itemid) {
      const getItem = async (): Promise<Item> => {
        const res = await fetch(`${backendFirebaseUri}/items/${params.itemid}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'auth-token': authToken
          }
        });
        return res.json();
      };

      getSectors()
        .then(s => {
          setSectorsToChooseFrom(s);
          return getItem();
        })
        .then(i => {
          setName(i.name);
          setCat(i.cat);
          setSector(i.sector);
          setDepartment(i.department);
          setCatType(i.catType);
          setDescription(i.description);
          if (i.imageLink) setImageLink(i.imageLink);
          if (i.qaStandardLink) setQaStandardLink(i.qaStandardLink);
          if (i.models?.length) setModels(i.models);
          if (i.accessories?.length) setAccessories(i.accessories);
          if (i.consumables?.length) setConsumables(i.consumables);
          if (i.belongsToKits?.length) setBelongsToKits(i.belongsToKits);
          if (i.similarItems?.length) setSimilarItems(i.similarItems);
          if (i.kitItem?.length) setKitItem(i.kitItem);
        })
        .catch(e => console.log(`Error fetching item details: ${e}`));
    } else {
      getSectors().then(s => setSectorsToChooseFrom(s));
    }
  }, [params.itemid, authToken, dispatch]);

  // Handlers
  const handleInput = (setter: React.Dispatch<React.SetStateAction<string>>, e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    dispatch(viewingActions.changesAppliedToItem(true));
  };

  const handleDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    dispatch(viewingActions.changesAppliedToItem(true));
  };

  const handleSetSector = (value: string) => {
    setSector(value);
    setDepartment('');
    dispatch(viewingActions.changesAppliedToItem(true));
  };

  const handleSetDepartment = (value: string) => {
    setDepartment(value);
    dispatch(viewingActions.changesAppliedToItem(true));
  };

  const sectorNames = sectorsToChooseFrom.map(s => s.sectorName);

  const rawDepartments: (string | Department)[] = (
    sector && sectorsToChooseFrom.length > 0
      ? sectorsToChooseFrom.find(s => s.sectorName === sector)!.departments
      : []
  );

  const departmentsToChooseFrom = rawDepartments.map(d =>
    typeof d === 'string'
      ? { departmentName: d }
      : d as { departmentName: string }
  );

  const handleSetCatType = (ct: "מקט רגיל" | "מקט ערכה") => {
    setCatType(ct);
    dispatch(viewingActions.changesAppliedToItem(true));
  };

  const handleSave = () => {
    itemDetails.models = vacateItemListIfEmptyAndRemoveSpaces(itemDetails.models);
    itemDetails.belongsToKits = vacateItemListIfEmptyAndRemoveSpaces(itemDetails.belongsToKits);
    itemDetails.similarItems = vacateItemListIfEmptyAndRemoveSpaces(itemDetails.similarItems);
    itemDetails.kitItem = vacateItemListIfEmptyAndRemoveSpaces(itemDetails.kitItem);

    if (catType === "מקט ערכה") {
      itemDetails.models = [];
      itemDetails.belongsToKits = [];
      itemDetails.similarItems = [];
    }
    if (catType === "מקט רגיל") {
      itemDetails.kitItem = [];
    }

    if (!itemDetails.name || !itemDetails.cat || !itemDetails.sector || !itemDetails.department) {
      console.log("Please make sure to enter a name, catalog number, sector and department");
      return;
    }

    const method = params.itemid ? 'PUT' : 'POST';
    const url = params.itemid
      ? `${backendFirebaseUri}/items/${params.itemid}`
      : `${backendFirebaseUri}/items`;

    fetch(encodeURI(url), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'auth-token': authToken
      },
      body: JSON.stringify(itemDetails)
    })
      .then(() => {
        console.log(params.itemid ? "success updating item" : "success saving item");
        dispatch(viewingActions.changesAppliedToItem(false));
        navigate(-1);
      })
      .catch(err => console.log(`Error saving item: ${err}`));
  };

  const handleDelete = () => {
    fetch(encodeURI(`${backendFirebaseUri}/items/${params.itemid}`), {
      method: 'DELETE',
      headers: { 'auth-token': authToken }
    })
      .then(() => {
        console.log("Successfully deleted item!");
        dispatch(viewingActions.changesAppliedToItem(false));
        setAreYouSureDelete(false);
        navigate("/");
      })
      .catch(err => console.log(`Error deleting item: ${err}`));
  };

  return (
    <div className={classes.itemMenu}>
      <h1>{params.itemid ? "עריכת פריט" : "הוספת פריט"}</h1>
      <input
        type="text"
        placeholder="שם הפריט"
        value={name}
        onChange={e => handleInput(setName, e)}
      />
      <input
        type="text"
        placeholder='מק\"ט'
        value={cat}
        onChange={e => handleInput(setCat, e)}
      />
      <SectorSelection
        sectorNames={sectorNames}
        handleSetSector={handleSetSector}
        priorChosenSector={sector}
      />
      <DepartmentSelection
        departments={departmentsToChooseFrom}
        handleSetDepartment={handleSetDepartment}
        priorChosenDepartment={department}
      />
      <CatTypeSelection selectCatType={handleSetCatType} />
      <textarea
        value={description}
        onChange={handleDescription}
        placeholder="תיאור"
      />
      <input
        type="text"
        placeholder="קישור לתמונה"
        value={imageLink}
        onChange={e => handleInput(setImageLink, e)}
      />
      <input
        type="text"
        placeholder="קישור לתקן בחינה"
        value={qaStandardLink}
        onChange={e => handleInput(setQaStandardLink, e)}
      />
      {catType === "מקט ערכה" && (
        <InfoSectionMenu title="מכשיר" items={kitItem} setItems={setKitItem} />
      )}
      {catType === "מקט רגיל" && (
        <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />
      )}
      <InfoSectionMenu title="אביזרים" items={accessories} setItems={setAccessories} />
      <InfoSectionMenu title="מתכלים" items={consumables} setItems={setConsumables} />
      {catType === "מקט רגיל" && (
        <InfoSectionMenu title="שייך לערכות" items={belongsToKits} setItems={setBelongsToKits} />
      )}
      {catType === "מקט רגיל" && (
        <InfoSectionMenu title="קשור ל..." items={similarItems} setItems={setSimilarItems} />
      )}
      <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "2.5rem" }} />
      {params.itemid && (
        <BigButton
          text="מחק פריט"
          action={() => setAreYouSureDelete(true)}
          overrideStyle={{ marginTop: "1rem", backgroundColor: "#CE1F1F" }}
        />
      )}
      {areYouSureDelete && (
        <AreYouSure
          text="האם באמת למחוק פריט?"
          leftText="מחק"
          leftAction={handleDelete}
          rightText="לא"
          rightAction={() => setAreYouSureDelete(false)}
        />
      )}
    </div>
  );
};

export default ItemMenu;
