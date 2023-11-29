import React, {useContext} from "react";
import { useObserver } from "mobx-react";
import Tooltip from "../Tooltip";
import useStore from "../../hooks/useStore";
import { ReactComponent as Redo } from "../../assets/redo.svg";
import { DataContext } from "../../Context/DataContext";
export const RedoButton = () => {
  const {newImage, setImageUrl} = useContext(DataContext)
  const {UIStore, canvasStore} = useStore();
  return useObserver(() => (
    <div>
      <Tooltip content="Redo" placement="bottom">
        <Redo
          className={`${!UIStore.canRedo ? "disabled" : ""}`}
          onClick={() => {
              setImageUrl(newImage)
            if (!UIStore.canRedo) {
              return;
            }
            canvasStore.history.redo();
          }}
        />
      </Tooltip>
    </div>
  ));
};

export default RedoButton;