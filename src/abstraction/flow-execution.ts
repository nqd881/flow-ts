import { IClient } from "./client";
import { IFlowDef } from "./flow-def";
import { IFlowExecutionContext } from "./flow-execution-context";

export interface IFlowExecution<TFlowDef extends IFlowDef = IFlowDef> {
  readonly client: IClient;
  readonly flowDef: TFlowDef;
  readonly context: IFlowExecutionContext;

  start(): Promise<void>;
  requestStop(): void;
  waitUntilFinished(): Promise<any>;

  onStopRequested(action: () => any): void;
  onFinished(action: () => any): void;
}
