import { IFlowDef, IFlowExecution, IFlowExecutionContext } from "./abstraction";
import { IClient } from "./abstraction/client";
import { FlowBuilderClient, FlowDefBuilder } from "./base/flow-def-builder";
import { FlowExecution } from "./base/flow-execution";
import { FlowExecutor } from "./base/flow-executor";
import { SagaDef } from "./saga/saga-def";
import { SagaDefBuilder } from "./saga/saga-def-builder";
import { SagaExecution } from "./saga/saga-execution";
import { SagaExecutor } from "./saga/saga-executor";

export class Client implements IClient, FlowBuilderClient {
  newFlow<TContext extends IFlowExecutionContext = IFlowExecutionContext>(): FlowDefBuilder<TContext, Client> {
    return new FlowDefBuilder<TContext, Client>(this);
  }

  newSaga<TContext extends IFlowExecutionContext = IFlowExecutionContext>(): SagaDefBuilder<TContext, Client> {
    return new SagaDefBuilder<TContext, Client>(this);
  }

  runFlow(flowDef: IFlowDef, context: IFlowExecutionContext): IFlowExecution {
    if (flowDef instanceof SagaDef) {
      return new SagaExecution(this, new SagaExecutor(), flowDef, context);
    }

    return new FlowExecution(this, new FlowExecutor(), flowDef, context);
  }
}
