import React, { useState} from "react";
import Menu from "./components/Menu";
import Header from "./components/Header/Header";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar/Toolbar";
import { DataContext } from "./Context/DataContext";
const App = () => {
  const [imageText, setImageText] = useState([])
  const [imageUrl, setImageUrl] = useState(``)
  const [loader, setLoader] = useState(true);
  const [newImage, setNewImage] = useState("")
  const [oldImage, setOldImage] = useState("")
  return (
    <div className="app">
      <DataContext.Provider
       value={{ 
        imageText, setImageText, 
        imageUrl, setImageUrl, 
        loader, setLoader,
        newImage, setNewImage,
        oldImage, setOldImage
      }}
       >
      <Header />
      <Menu />
      <Toolbar/>
      {loader ? <Canvas /> : 
      <div style={{width: 1200, height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <div className="spinner-grow text-light"  style={{width: 60, height: 60}} role="status" hidden={loader}>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
      }
      </DataContext.Provider>
    
    </div>
  );
};

export default App;