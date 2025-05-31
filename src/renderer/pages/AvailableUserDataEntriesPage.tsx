import { Box, Typography } from "@mui/material";
import AvailableUserDataEntriesDataGrid from "@renderer/components/dataGrids/AvailableUserDataEntriesDataGrid";
import {
  IDashboardLayoutRootContext,
  useDashboardLayoutRootContext
} from "@renderer/components/roots/dashboardLayoutRoot/DashboardLayoutRootContext";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataTemplateIdentifier } from "@shared/user/data/template/identifier/UserDataTemplateIdentifier";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { FC, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

export interface IAvailableUserDataEntriesPageParams extends Record<string, string> {
  storageId: string;
  boxId: string;
  templateId: string;
}

interface IAvailableUserDataEntriesPageData {
  templateInfo: IUserDataTemplateInfo;
  boxInfo: IUserDataBoxInfo;
  storageInfo: IUserDataStorageInfo;
}

const AvailableUserDataEntriesPage: FC = () => {
  const dashboardLayoutRootContext: IDashboardLayoutRootContext = useDashboardLayoutRootContext();
  const params: Readonly<Partial<IAvailableUserDataEntriesPageParams>> = useParams<IAvailableUserDataEntriesPageParams>();
  const pageData = useMemo<IAvailableUserDataEntriesPageData | null>((): IAvailableUserDataEntriesPageData | null => {
    if (params.storageId === undefined || params.boxId === undefined || params.templateId === undefined) {
      return null;
    }
    const USER_DATA_TEMPLATE_IDENTIFIER: IUserDataTemplateIdentifier = {
      storageId: params.storageId,
      boxId: params.boxId,
      templateId: params.templateId
    } satisfies IUserDataTemplateIdentifier;
    const STORAGE_INFO: IUserDataStorageInfo | null = dashboardLayoutRootContext.getInitialisedUserDataStorageInfoById(
      USER_DATA_TEMPLATE_IDENTIFIER.storageId
    );
    if (STORAGE_INFO === null) {
      return null;
    }
    const BOX_INFO: IUserDataBoxInfo | null = dashboardLayoutRootContext.getAvailableUserDataBoxInfoByIdentifier(USER_DATA_TEMPLATE_IDENTIFIER);
    if (BOX_INFO === null) {
      return null;
    }
    const TEMPLATE_INFO: IUserDataTemplateInfo | null =
      dashboardLayoutRootContext.getAvailableUserDataTemplateInfoByIdentifier(USER_DATA_TEMPLATE_IDENTIFIER);
    if (TEMPLATE_INFO === null) {
      return null;
    }
    return {
      templateInfo: TEMPLATE_INFO,
      boxInfo: BOX_INFO,
      storageInfo: STORAGE_INFO
    } satisfies IAvailableUserDataEntriesPageData;
  }, [params, dashboardLayoutRootContext]);

  useEffect((): void => {
    dashboardLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.boxes);
    dashboardLayoutRootContext.setForbiddenLocationName("Available Entries");
  }, [dashboardLayoutRootContext]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%"
      }}
    >
      {pageData === null ? (
        <Typography variant="h4" align="center">
          Invalid template parameters
        </Typography>
      ) : (
        <>
          <Typography variant="h5">Available entries:</Typography>
          <Typography variant="caption">
            From template <b>{pageData.templateInfo.name}</b>, box <b>{pageData.boxInfo.name}</b>, storage <b>{pageData.storageInfo.name}</b>.
          </Typography>
          <Box sx={{ flex: 1, minHeight: 0, marginTop: ".5rem" }}>
            <AvailableUserDataEntriesDataGrid userDataTemplateInfo={pageData.templateInfo} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default AvailableUserDataEntriesPage;
