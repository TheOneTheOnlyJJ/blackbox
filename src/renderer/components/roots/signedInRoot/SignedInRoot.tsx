import { FC, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { IAppRootContext, useAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { ISignedInRootContext } from "./SignedInRootContext";
import { appLogger } from "@renderer/utils/loggers";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { useAvailableUserDataStorageConfigsInfoState } from "./hooks/useAvailableUserDataStorageConfigsInfoState";
import { useOpenUserDataStorageVisibilityGroupsInfoState } from "./hooks/useOpenUserDataStorageVisibilityGroupsInfoState";
import { useForbiddenLocationNameState } from "./hooks/useForbiddenLocationNameState";
import { useInitialisedUserDataStoragesInfoState } from "./hooks/useInitialisedUserDataStoragesInfoState";
import { useAvailableUserDataBoxesInfoState } from "./hooks/useAvailableUserDataBoxesInfoState";
import { useAvailableUserDataTemplatesInfoState } from "./hooks/useAvailableUserDataTemplatesInfoState";
import { useAvailableUserDataEntriesInfoState } from "./hooks/useAvailableUserDataEntriesInfoState";

const SignedInRoot: FC = () => {
  const appRootContext: IAppRootContext = useAppRootContext();

  const availableUserDataStorageConfigsInfo: IUserDataStorageConfigInfo[] = useAvailableUserDataStorageConfigsInfoState(appLogger);
  const { initialisedUserDataStoragesInfo, getInitialisedUserDataStorageInfoById } = useInitialisedUserDataStoragesInfoState(appLogger);
  const { openUserDataStorageVisibilityGroupsInfo, getOpenUserDataStorageVisibilityGroupInfoById } =
    useOpenUserDataStorageVisibilityGroupsInfoState(appLogger);
  const { availableUserDataDataBoxesInfo, getAvailableUserDataBoxInfoByIdentifier } = useAvailableUserDataBoxesInfoState(appLogger);
  const { availableUserDataDataTemplatesInfo, getAvailableUserDataTemplateInfoByIdentifier } = useAvailableUserDataTemplatesInfoState(appLogger);
  const { availableUserDataDataEntriesInfo, getAvailableUserDataEntryInfoByIdentifier } = useAvailableUserDataEntriesInfoState(appLogger);
  const [forbiddenLocationName, URIEncodeAndSetForbiddenLocationName] = useForbiddenLocationNameState(appLogger);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering Signed In Root component.");
    return (): void => {
      appLogger.debug("Removing Signed In Root component.");
    };
  }, []);

  return appRootContext.signedInUserInfo !== null ? (
    <Outlet
      // TODO: Put these in useMemo
      context={
        {
          ...appRootContext,
          signedInUserInfo: appRootContext.signedInUserInfo,
          availableUserDataStorageConfigsInfo: availableUserDataStorageConfigsInfo,
          initialisedUserDataStoragesInfo: initialisedUserDataStoragesInfo,
          openUserDataStorageVisibilityGroupsInfo: openUserDataStorageVisibilityGroupsInfo,
          availableUserDataDataBoxesInfo: availableUserDataDataBoxesInfo,
          availableUserDataDataTemplatesInfo: availableUserDataDataTemplatesInfo,
          availableUserDataDataEntriesInfo: availableUserDataDataEntriesInfo,
          getInitialisedUserDataStorageInfoById: getInitialisedUserDataStorageInfoById,
          getOpenUserDataStorageVisibilityGroupInfoById: getOpenUserDataStorageVisibilityGroupInfoById,
          getAvailableUserDataBoxInfoByIdentifier: getAvailableUserDataBoxInfoByIdentifier,
          getAvailableUserDataTemplateInfoByIdentifier: getAvailableUserDataTemplateInfoByIdentifier,
          getAvailableUserDataEntryInfoByIdentifier: getAvailableUserDataEntryInfoByIdentifier,
          setForbiddenLocationName: URIEncodeAndSetForbiddenLocationName
        } satisfies ISignedInRootContext
      }
    />
  ) : (
    <Navigate to={`/forbidden/you-must-be-signed-in-to-access-the-${forbiddenLocationName}-page`} />
  );
};

export default SignedInRoot;
