import { IStepDef } from "./step-def";

export interface IFlowDef {
  readonly id: string;
  readonly steps: IStepDef[];
}
