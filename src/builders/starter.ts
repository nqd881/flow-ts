import { IFlowExecutionContext } from "../abstraction";
import { FlowBuilderClient, FlowDefBuilder } from "../base/flow-def-builder";
import { SagaDefBuilder } from "../saga/saga-def-builder";

export class FlowStarter<
  TContext extends IFlowExecutionContext = IFlowExecutionContext,
  TClient extends FlowBuilderClient = FlowBuilderClient
> extends FlowDefBuilder<TContext, TClient> {
  constructor(client: TClient) {
    super(client);
  }

  saga() {
    return new SagaDefBuilder<TContext, TClient>(this.client);
  }
}
