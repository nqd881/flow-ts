import { IFlowExecutionContext } from "../../abstraction";
import { AnyTask, Task } from "../types";
import { StepDef } from "./step-def";

export class TaskStepDef<
  TTask extends Task<TContext> = AnyTask,
  TContext extends IFlowExecutionContext = IFlowExecutionContext
> extends StepDef {
  constructor(public readonly task: TTask) {
    super();
  }
}
