import { IUserDataTemplateIntegerFieldConfigCreateDTO } from "@shared/user/data/template/field/config/create/DTO/implementations/integer/UserDataTemplateIntegerFieldConfigCreateDTO";
import { IUserDataTemplateIntegerFieldConfigCreateInput } from "../UserDataTemplateIntegerFieldConfigCreateInput";
import { LogFunctions } from "electron-log";
import { IUserDataTemplateIntegerFieldNumericThresholdConfigCreateDTO } from "@shared/user/data/template/field/config/create/DTO/implementations/integer/UserDataTemplateIntegerFieldNumericThresholdConfigCreateDTO";

export const userDataTemplateIntegerFieldConfigCreateInputToUserDataTemplateIntegerFieldConfigCreateDTO = (
  userDataTemplateIntegerFieldConfigCreateInput: IUserDataTemplateIntegerFieldConfigCreateInput,
  logger: LogFunctions | null
): IUserDataTemplateIntegerFieldConfigCreateDTO => {
  logger?.debug("Converting User Data Template Integer Field Config Create Input to User Data Template Integer Field Config Create DTO.");
  let min: IUserDataTemplateIntegerFieldNumericThresholdConfigCreateDTO | null;
  if (userDataTemplateIntegerFieldConfigCreateInput.integerMinimum?.integerValue !== undefined) {
    min = {
      value: userDataTemplateIntegerFieldConfigCreateInput.integerMinimum.integerValue,
      exclusive: userDataTemplateIntegerFieldConfigCreateInput.integerMinimum.integerExclusive ?? false
    } satisfies IUserDataTemplateIntegerFieldNumericThresholdConfigCreateDTO;
  } else {
    min = null;
  }
  let max: IUserDataTemplateIntegerFieldNumericThresholdConfigCreateDTO | null;
  if (userDataTemplateIntegerFieldConfigCreateInput.integerMaximum?.integerValue !== undefined) {
    max = {
      value: userDataTemplateIntegerFieldConfigCreateInput.integerMaximum.integerValue,
      exclusive: userDataTemplateIntegerFieldConfigCreateInput.integerMaximum.integerExclusive ?? false
    } satisfies IUserDataTemplateIntegerFieldNumericThresholdConfigCreateDTO;
  } else {
    max = null;
  }
  return {
    type: userDataTemplateIntegerFieldConfigCreateInput.type,
    name: userDataTemplateIntegerFieldConfigCreateInput.name,
    description: userDataTemplateIntegerFieldConfigCreateInput.description ?? null,
    isRequired: userDataTemplateIntegerFieldConfigCreateInput.isRequired ?? false,
    minimum: min,
    maximum: max,
    multipleOf: userDataTemplateIntegerFieldConfigCreateInput.integerMultipleOf ?? null,
    default: userDataTemplateIntegerFieldConfigCreateInput.integerDefault ?? null
  } satisfies IUserDataTemplateIntegerFieldConfigCreateDTO;
};
