import React, { useContext, useEffect, useState } from "react";
import { ReactComponent as Flip } from "../assets/rmback.svg";
import { ReactComponent as Draw } from "../assets/draw.svg";
import { ReactComponent as Text } from "../assets/text.svg";
import { ReactComponent as Search } from "../assets/search.svg";
import { ReactComponent as AutoTranslate } from "../assets/aa.svg";
import { ReactComponent as Translation } from "../assets/shapes.svg";

import Tooltip from "./Tooltip";
import useStore from "../hooks/useStore";
import { useObserver } from "mobx-react";
import { ModeName } from "../stores/canvasStore";
import { DataContext } from "../Context/DataContext";
interface IMenuItems {
  icon: React.ReactElement;
  name: ModeName;
  handler: () => void;
  tooltip?: string;
}
export const baseURL= "http://127.0.0.1:8000";
const Menu = () => {
  const {
    imageText, setImageText, 
    imageUrl, setImageUrl, 
    loader, setLoader,
    setNewImage,
     setOldImage  
  } = useContext(DataContext);
  const { UIStore, canvasStore, imageStore } = useStore(); 
  const setImagePath = async() => {
    // console.log("Image Data useEffect: ", imageUrl)
    const url = String(imageUrl);
      await imageStore.load(url);
  }

 useEffect(()=>{
  setImagePath()
 },[imageUrl])


  const handleClick = async (modeName: ModeName) => {
    // console.log("Image Data in HandleClick: ", imageUrl)
    if (!imageStore.url && modeName !== "search") {
      return;
    }

    UIStore.toggleToolbar(modeName);

    if (canvasStore.mode || canvasStore.scale !== 1) {
      if (canvasStore.mode !== "search") {
        canvasStore.setScale(1);
      }
      // if(canvasStore.mode === "text")
      //   translation()
    }

    if (!canvasStore.mode) {
      canvasStore.resetToBaseScale();
    }
  };



  const items: IMenuItems[] = [
    {
      icon: <Search />,
      name: "search",
      handler: () => loadFromAPI(),
      tooltip: "Load from URL",
    },
    // {
    //   icon: <Crop />,
    //   name: "crop",
    //   handler: () => handleClick("crop"),
    // },
    // {
    //   icon: <Flip />,
    //   name: "adjust",
    //   handler: () => handleClick("adjust"),
    // },
    {
      icon: <Draw />,
      name: "drawing",
      handler: () => handleClick("drawing"),
      tooltip: "Inpaint"
    },
    {
      icon: <Text />,
      name: "text",
      handler: () => handleClick("text"),
      tooltip: "Add Text"
    },
    {
      icon: <Translation />,
      name: "translate",
      handler: () => autoInpaint(),
      tooltip: "Translation"
    },
    {
      icon: <Flip />,
      name: "removeBG",
      handler: () => removeBG(),
      tooltip: "Remove Background"
    },
    {
      icon: <AutoTranslate />,
      name: "text",
      handler: () => autoTranslation(),
      tooltip: "Auto Translation"
    },
  ];


  const loadFromAPI = async () => {
    setLoader(false);
     const apiURL = prompt("Paste Image URL")
    // console.log("API-URL: ", apiURL)
    const u = apiURL ? apiURL : ""
    const imageUrlData = await fetch(u);
    const buffer = await imageUrlData.arrayBuffer();
    const stringifiedBuffer = Buffer.from(buffer).toString('base64');
    const contentType = imageUrlData.headers.get('content-type');
    const imageBas64 = `data:image/${contentType};base64,${stringifiedBuffer}`;
    setLoader(true)
    setImageUrl(imageBas64)
    setOldImage(imageBas64)
    UIStore.canUndo = true;
    await imageStore.load(String(imageBas64))
  }

  const autoInpaint = async () => {
    if(!imageStore.url) return;
    setLoader(false)
    let responseData = await fetch(`${baseURL}/autoinpaint`, {
      method: "POST",
      headers: { 
        'Content-Type': 'multipart/x-www-form-urlencoded'
        },
      body: JSON.stringify({image: imageStore.url})
    })
     const resonse = await responseData.json()
    setLoader(true);
    setImageUrl(resonse.image_base64);
    setNewImage(resonse.image_base64);
    // console.log("Auto Inpaint: ", resonse)
    UIStore.canUndo = true
    setImageText(resonse.result);
    // console.log("Image Res: ", imageText);
  }

  const removeBG = async () => {
    if(!imageStore.url) return;
    setLoader(false)
    let responseData = await fetch(`${baseURL}/removebg`, {
      method: "POST",
      headers: { 
        'Content-Type': 'multipart/x-www-form-urlencoded'
        },
      body: JSON.stringify({image: imageStore.url})
    })
     const resonse = await responseData.json()
     setLoader(true);
    setImageUrl(resonse.image_base64);
    setNewImage(resonse.image_base64);
    UIStore.canUndo = true
    // console.log("BG Remove: ", resonse)
  }

  const autoTranslation = async () => {
    if(!imageStore.url) return;
    setLoader(false)
    let responseData = await fetch(`${baseURL}/autotranslation`, {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json'
        },
      body: JSON.stringify({image: imageStore.url})
    })
     const resonse = await responseData.json()
     setLoader(true);
    setImageUrl(resonse.image_base64);
    setNewImage(resonse.image_base64);
    UIStore.canUndo = true
    // console.log("Auto Translation: ", resonse)
  } 

  const inpaint = async () => {
    if(!imageStore.url) return;
    //Image & Mask both in req
    let responseData = await fetch(`${baseURL}/inpaint`, {
      method: "POST",
      headers: { 
        'Content-Type': 'multipart/x-www-form-urlencoded'
        },
      body: JSON.stringify({image: imageStore.url, mask: "mask here"})
    })
  }

  return useObserver(() => (
    <section className="menu">
      <div className="menu__wrapper">
      
        {items.map((item, index) => {
          const tooltip = item.tooltip || item.name;
          return (
            <Tooltip key={index} content={tooltip} placement="right">
              <abbr title={item.tooltip}>
              <div
                className={`menu__item ${
                  canvasStore.mode === item.name ? "menu__item_active" : ""
                } ${!imageStore.url && item.name !== "search" ? "disabled" : ""}
                ${!loader ? "disabled" : ""}`}
                // {`menu__item ${
                //   canvasStore.mode === item.name ? "menu__item_active" : ""
                // }`}
                onClick={loader ? item.handler : ()=>console.log("Loading...")}
              >
                {item.icon}
              </div></abbr>
            </Tooltip>
          );
        })}
      </div>
    </section>
  ));
};

export default Menu;