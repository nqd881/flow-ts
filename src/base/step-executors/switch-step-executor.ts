import {
  IFlowExecutionContext,
  IStepExecution,
  IStepExecutor,
} from "../../abstraction";
import { SwitchCase, SwitchStepDef } from "../step-defs";
import { StepStoppedError } from "../step-execution";

export class SwitchStepExecutor implements IStepExecutor<SwitchStepDef> {
  async execute(execution: IStepExecution<SwitchStepDef>): Promise<any> {
    this.ensureNotStopped(execution);

    const { client, stepDef, context } = execution;

    const selected = await stepDef.selector(context);
    const matchedCase = await this.findMatchingCase(stepDef.cases, selected, context);
    const branch = matchedCase?.flow ?? stepDef.defaultBranch;

    if (!branch) return;

    const flowExecution = client.runFlow(branch, context);

    execution.onStopRequested(() => flowExecution.requestStop());

    await flowExecution.start();
    await flowExecution.waitUntilFinished();

    this.ensureNotStopped(execution);
  }

  protected async findMatchingCase<
    TContext extends IFlowExecutionContext,
    TValue
  >(
    cases: Array<SwitchCase<TContext, TValue>>,
    value: TValue,
    context: TContext
  ): Promise<SwitchCase<TContext, TValue> | undefined> {
    for (const currentCase of cases) {
      if (await currentCase.predicate(value, context)) {
        return currentCase;
      }
    }
  }

  protected ensureNotStopped(execution: IStepExecution) {
    if (execution.isStopRequested()) {
      throw new StepStoppedError();
    }
  }
}
