import React, { useRef, ChangeEvent, useState, useEffect, useContext } from "react";

import { ReactComponent as Upload } from "../../assets/upload.svg";
import Tooltip from "../Tooltip";
import useStore from "../../hooks/useStore";
import { DataContext } from "../../Context/DataContext";
const UploadButton = () => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { imageStore, UIStore,canvasStore } = useStore();
  const {setImageUrl, oldImage, setOldImage} = useContext(DataContext);

  const [i, setI] = useState(0);
  let uploadedFile: File;
  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
  
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    uploadedFile = (target.files as FileList)[0];
    console.log("FILE: ", file)
    if (!file) {  
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageUrl = String(reader.result);
      await imageStore.load(imageUrl);
      console.log("Image URL: ",imageStore.url)
      setImageUrl(imageStore.url)
      setOldImage(imageStore.url)
      UIStore.closeToolbar();
    };
    reader.readAsDataURL(file);
  };


  useEffect(()=>{console.log(i)},[i, inputFileRef]);


  const clickHandler = () => {
    if (inputFileRef && inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  return (
    <div style={{display: "flex", flexDirection: "row"}}>
      <Tooltip content="Upload an image" placement="bottom">
        <Upload onClick={clickHandler}/>
      </Tooltip>
      <input
        ref={inputFileRef}
        type="file"
        className="header__upload-image-input"
        onChange={uploadImage}
        accept="image/jpg"
      />
    </div>
  );
};

export default UploadButton;