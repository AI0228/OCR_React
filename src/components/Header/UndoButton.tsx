import React, { useContext } from "react";
import { useObserver } from "mobx-react";
import Tooltip from "../Tooltip";
import useStore from "../../hooks/useStore";
import { ReactComponent as Undo } from "../../assets/undo.svg";
import { DataContext } from "../../Context/DataContext";
export const UndoButton = () => {
  const {oldImage, setImageUrl} = useContext(DataContext)
  const {UIStore, canvasStore} = useStore();
  return useObserver(() => (
    <div>
      <Tooltip content="Undo" placement="bottom">
        <Undo
          className={`${!UIStore.canUndo ? "disabled" : ""}`}
          onClick={() => {
              setImageUrl(oldImage)
              UIStore.canRedo = true;
            if (!UIStore.canUndo) {
              return;
            }
            canvasStore.history.undo();
          }}
        />
      </Tooltip>
    </div>
  ));
};

export default UndoButton;