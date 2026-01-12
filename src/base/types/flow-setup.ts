import { IFlowExecutionContext } from "../../abstraction";
import { FlowDefBuilder } from "../flow-def-builder";

export type FlowSetup<
  TContext extends IFlowExecutionContext = IFlowExecutionContext
> = (flowDefBuilder: FlowDefBuilder<TContext>) => void;
