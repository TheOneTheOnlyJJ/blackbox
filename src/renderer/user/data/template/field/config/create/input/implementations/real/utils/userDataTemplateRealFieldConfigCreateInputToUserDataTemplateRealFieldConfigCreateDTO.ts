import { LogFunctions } from "electron-log";
import { IUserDataTemplateRealFieldConfigCreateInput } from "../UserDataTemplateRealFieldConfigCreateInput";
import { IUserDataTemplateRealFieldConfigCreateDTO } from "@shared/user/data/template/field/config/create/DTO/implementations/real/UserDataTemplateRealFieldConfigCreateDTO";
import { IUserDataTemplateRealFieldNumericThresholdConfigCreateDTO } from "@shared/user/data/template/field/config/create/DTO/implementations/real/UserDataTemplateRealFieldNumericThresholdConfigCreateDTO";

export const userDataTemplateRealFieldConfigCreateInputToUserDataTemplateRealFieldConfigCreateDTO = (
  userDataTemplateRealFieldConfigCreateInput: IUserDataTemplateRealFieldConfigCreateInput,
  logger: LogFunctions | null
): IUserDataTemplateRealFieldConfigCreateDTO => {
  logger?.debug("Converting User Data Template Real Field Config Create Input to User Data Template Real Field Config Create DTO.");
  let min: IUserDataTemplateRealFieldNumericThresholdConfigCreateDTO | null;
  if (userDataTemplateRealFieldConfigCreateInput.realMinimum?.realValue !== undefined) {
    min = {
      value: userDataTemplateRealFieldConfigCreateInput.realMinimum.realValue,
      exclusive: userDataTemplateRealFieldConfigCreateInput.realMinimum.realExclusive ?? false
    } satisfies IUserDataTemplateRealFieldNumericThresholdConfigCreateDTO;
  } else {
    min = null;
  }
  let max: IUserDataTemplateRealFieldNumericThresholdConfigCreateDTO | null;
  if (userDataTemplateRealFieldConfigCreateInput.realMaximum?.realValue !== undefined) {
    max = {
      value: userDataTemplateRealFieldConfigCreateInput.realMaximum.realValue,
      exclusive: userDataTemplateRealFieldConfigCreateInput.realMaximum.realExclusive ?? false
    } satisfies IUserDataTemplateRealFieldNumericThresholdConfigCreateDTO;
  } else {
    max = null;
  }
  return {
    type: userDataTemplateRealFieldConfigCreateInput.type,
    name: userDataTemplateRealFieldConfigCreateInput.name,
    description: userDataTemplateRealFieldConfigCreateInput.description ?? null,
    minimum: min,
    maximum: max,
    multipleOf: userDataTemplateRealFieldConfigCreateInput.realMultipleOf ?? null,
    default: userDataTemplateRealFieldConfigCreateInput.realDefault ?? null
  } satisfies IUserDataTemplateRealFieldConfigCreateDTO;
};
