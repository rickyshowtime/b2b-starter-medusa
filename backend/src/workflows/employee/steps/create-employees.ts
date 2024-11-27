import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  ICompanyModuleService,
  ModuleCreateEmployee,
  ModuleEmployee,
} from "@starter/types";
import { COMPANY_MODULE } from "../../../modules/company";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const createEmployeesStep = createStep(
  "create-employees",
  async (
    input: ModuleCreateEmployee,
    { container }
  ): Promise<StepResponse<ModuleEmployee, string>> => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    const createdEmployee = await companyModuleService.createEmployees(input);

    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const {
      data: [employee],
    } = await query.graph(
      {
        entity: "employee",
        filters: { id: createdEmployee.id },
        fields: ["id", "company.*"],
      },
      { throwIfKeyNotFound: true }
    );

    return new StepResponse(employee, employee.id);
  },
  async (employeeId: string, { container }) => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);
    await companyModuleService.deleteEmployees([employeeId]);
  }
);
