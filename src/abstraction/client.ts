import { IFlowDef } from "./flow-def";
import { IFlowExecution } from "./flow-execution";
import { IFlowExecutionContext } from "./flow-execution-context";

export interface IClient {
  runFlow(flowDef: IFlowDef, context: IFlowExecutionContext): IFlowExecution;
}
