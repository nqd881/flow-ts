import { IStepExecution, IStepExecutor } from "../../abstraction";
import { ParallelStepDef, ParallelStepStrategy } from "../step-defs";

export class ParallelStepExecutor implements IStepExecutor<ParallelStepDef> {
  async execute(execution: IStepExecution<ParallelStepDef>): Promise<any> {
    const { client, stepDef, context } = execution;

    const flowExecutions = stepDef.branches.map((branch) => {
      client.runFlow(branch, context);
    });

    switch (stepDef.strategy) {
      case ParallelStepStrategy.CollectAll: {
        await Promise.allSettled(flowExecutions);
        break;
      }
      case ParallelStepStrategy.FailFast: {
        await Promise.all(flowExecutions);
        break;
      }
      case ParallelStepStrategy.FirstCompleted: {
        await Promise.race(flowExecutions);
        break;
      }
    }
  }
}
