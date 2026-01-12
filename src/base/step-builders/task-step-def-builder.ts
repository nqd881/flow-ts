import { TaskStepDef } from "../step-defs";
import { IStepDefBuilder } from "./step-def-builder";
import type { FlowDefBuilder } from "../flow-def-builder";

export class TaskStepDefBuilder implements IStepDefBuilder<TaskStepDef> {
  constructor(protected parentBuilder: FlowDefBuilder<any>) {}

  onSuccess() {}

  build(): TaskStepDef {
    throw new Error("Method not implemented.");
  }
}
