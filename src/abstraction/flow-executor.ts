import { IFlowExecution } from "./flow-execution";

export interface IFlowExecutor {
  execute(flowExecution: IFlowExecution): Promise<any>;
}
