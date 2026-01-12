import { IFlowDef, IFlowExecutionContext } from "../../abstraction";
import { Condition } from "../types";
import { StepDef } from "./step-def";

export class WhileStepDef<
  TContext extends IFlowExecutionContext = IFlowExecutionContext
> extends StepDef {
  constructor(
    public readonly condition: Condition<TContext>,
    public readonly body: IFlowDef,
    id?: string
  ) {
    super(id);
  }
}
