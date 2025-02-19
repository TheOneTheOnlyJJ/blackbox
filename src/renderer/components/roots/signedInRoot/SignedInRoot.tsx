import { FC, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { IAppRootContext, useAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { ISignedInRootContext } from "./SignedInRootContext";
import { appLogger } from "@renderer/utils/loggers";

const SignedInRoot: FC = () => {
  const appRootContext: IAppRootContext = useAppRootContext();
  const [forbiddenLocationName, setForbiddenLocationName] = useState<string>("this-page");

  useEffect((): void => {
    try {
      setForbiddenLocationName(encodeURIComponent(forbiddenLocationName));
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      appLogger.error(`Could not set forbidden location name: ${ERROR_MESSAGE}!`);
      setForbiddenLocationName("this-page");
    }
  }, [forbiddenLocationName]);

  useEffect((): void => {
    appLogger.debug("Rendering Signed In Root component.");
  }, []);

  return appRootContext.currentlySignedInUser !== null ? (
    <Outlet
      context={
        {
          ...appRootContext,
          currentlySignedInUser: appRootContext.currentlySignedInUser,
          setForbiddenLocationName: setForbiddenLocationName
        } satisfies ISignedInRootContext
      }
    />
  ) : (
    <Navigate to={`/forbidden/must-be-signed-in-to-access-${forbiddenLocationName}`} />
  );
};

export default SignedInRoot;
