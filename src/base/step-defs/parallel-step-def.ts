import { IFlowDef } from "../../abstraction";
import { StepDef } from "./step-def";

export enum ParallelStepStrategy {
  FailFast = "fail-fast",
  CollectAll = "collect-all",
  FirstCompleted = "first-completed",
}

export class ParallelStepDef extends StepDef {
  constructor(
    public readonly branches: IFlowDef[],
    public readonly strategy: ParallelStepStrategy = ParallelStepStrategy.CollectAll,
    id?: string
  ) {
    super(id);
  }
}
