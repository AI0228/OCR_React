import React, {useEffect, useContext} from "react";
import { useObserver } from "mobx-react";
import Slider from "../Slider";
import useStore from "../../hooks/useStore";
import { DataContext } from "../../Context/DataContext";

export const baseURL= "http://1.248.227.222:8000"
const ToolbarDrawing: React.FC = () => {
  const {
    setImageText, 
    setImageUrl, 
    setLoader,
    setNewImage,
  } = useContext(DataContext);
  const { drawingStore, imageStore, canvasStore } = useStore();

  useEffect(()=>{
    drawingStore.setColorCode("255,255,255")
    drawingStore.setOpacity(1.0);
  },[])

  const draw = async () => {
    if(!imageStore.url || !canvasStore.getDataUrl()) return;
    setLoader(false)
    let responseData = await fetch(`${baseURL}/inpaint`, {
      method: "POST",
      headers: { 
        'Content-Type': 'multipart/x-www-form-urlencoded'
        },
      body: JSON.stringify({image: imageStore.url, mask: canvasStore.getDataUrl()})
    })
     const resonse = await responseData.json()
    setLoader(true);
    setImageUrl(resonse.image_base64);
    setNewImage(resonse.image_base64);
    setImageText(resonse.result);
  }

  return useObserver(() => (
    <div className="toolbar__content">
      {/* <ColorPicker
        title="Colors"
        currentColorCode={drawingStore.colorCode}
        callback={rgbCode => alert(rgbCode)}
      /> */}
      <Slider
        title="Width"
        value={drawingStore.lineWidth}
        min={1}
        max={150}
        callback={value => drawingStore.setLineWidth(value)}
      />
      <button className="btn btn-secondary" onClick={()=> draw()}>Inpaint</button>

      {/* <Slider
        title="Opacity"
        value={Math.round(drawingStore.opacity * 100)}
        min={0}
        max={100}
        callback={value => alert(value / 100)}
      /> */}
      {/* <ToggleButton
        title="Straight Line"
        checked={drawingStore.isLineStraight}
        callback={() => drawingStore.toggleFreeDrawingMode()}
      /> */}
    </div>
  ));
};

export default ToolbarDrawing;