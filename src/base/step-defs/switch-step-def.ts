import { IFlowDef, IFlowExecutionContext } from "../../abstraction";
import { CasePredicate, Selector } from "../types";
import { StepDef } from "./step-def";

export interface SwitchCase<
  TContext extends IFlowExecutionContext = IFlowExecutionContext,
  TValue = unknown
> {
  readonly predicate: CasePredicate<TContext, TValue>;
  readonly flow: IFlowDef;
}

export class SwitchStepDef<
  TContext extends IFlowExecutionContext = IFlowExecutionContext,
  TValue = unknown
> extends StepDef {
  constructor(
    public readonly selector: Selector<TContext, TValue>,
    public readonly cases: Array<SwitchCase<TContext, TValue>>,
    public readonly defaultBranch?: IFlowDef,
    id?: string
  ) {
    super(id);
  }
}
