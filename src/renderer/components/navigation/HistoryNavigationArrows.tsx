import { Stack, Tooltip, IconButton } from "@mui/material";
import { appLogger } from "@renderer/utils/loggers";
import { FC, useCallback, useEffect, useState } from "react";
import { NavigateFunction, useLocation, useNavigate, Location } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";

// export interface IHistoryNavigationArrowsProps {}

export const HistoryNavigationArrows: FC = () => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();

  const navigate: NavigateFunction = useNavigate();
  const location: Location = useLocation();

  const [isBackDisabled, setIsBackDisabled] = useState<boolean>(false);
  const [isForwardDisabled, setIsForwardDisabled] = useState<boolean>(false);

  const handleNavigationArrowButtonClick = useCallback(
    (direction: "back" | "forward"): void => {
      appLogger.debug(`Clicked ${direction} arrow from the Dashboard App Bar.`);
      navigate(direction === "back" ? -1 : 1);
    },
    [navigate]
  );

  const updateButtonStates = useCallback((): void => {
    // TODO: Remove @types/dom-navigation once it becomes Baseline widely available
    if (window.navigation.currentEntry === null) {
      appLogger.error("Window DOM navigation API current entry is null! Not updating back button disabled state!");
    } else {
      setIsBackDisabled(signedInRootContext.signedInNavigationEntryIndex === window.navigation.currentEntry.index);
    }
    setIsForwardDisabled(!window.navigation.canGoForward);
  }, [signedInRootContext.signedInNavigationEntryIndex]);

  useEffect((): (() => void) => {
    updateButtonStates();
    window.navigation.addEventListener("currententrychange", updateButtonStates);
    return (): void => {
      window.navigation.removeEventListener("currententrychange", updateButtonStates);
    };
  }, [updateButtonStates, location]);

  return (
    <Stack direction="row">
      <Tooltip title="Go back">
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          sx={{ mr: 1 }}
          onClick={(): void => {
            handleNavigationArrowButtonClick("back");
          }}
          disabled={isBackDisabled}
        >
          <ArrowBackOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Go forward">
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          sx={{ mr: 2 }}
          onClick={(): void => {
            handleNavigationArrowButtonClick("forward");
          }}
          disabled={isForwardDisabled}
        >
          <ArrowForwardOutlinedIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default HistoryNavigationArrows;
