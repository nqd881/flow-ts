import { IClient } from "./client";
import { IFlowExecutionContext } from "./flow-execution-context";
import { IStepDef } from "./step-def";
import { StepExecutionStatus } from "./step-execution-status";

export interface IStepExecution<TStep extends IStepDef = IStepDef> {
  readonly client: IClient;
  readonly stepDef: TStep;
  readonly context: IFlowExecutionContext;

  getStatus(): StepExecutionStatus;
  getError(): unknown | undefined;
  isStopRequested(): boolean;

  start(): Promise<void>;
  requestStop(): void;
  waitUntilFinished(): Promise<void>;

  onStopRequested(action: () => any): void;
  onFinished(action: () => any): void;
}
