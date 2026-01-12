import { IStepExecution, IStepExecutor } from "../../abstraction";
import { ParallelStepStrategy } from "../step-defs/parallel-step-def";
import { ParallelForEachStepDef } from "../step-defs/parallel-for-each-step-def";
import { StepStoppedError } from "../step-execution";

export class ParallelForEachStepExecutor
  implements IStepExecutor<ParallelForEachStepDef>
{
  async execute(execution: IStepExecution<ParallelForEachStepDef>): Promise<any> {
    const { client, stepDef, context } = execution;

    const items = await stepDef.items(context);

    const tasks: Promise<any>[] = [];
    let index = 0;

    for await (const item of this.toAsyncIterable(items)) {
      this.ensureNotStopped(execution);

      const itemContext = stepDef.createItemContext(context, item, index);
      const flowExecution = client.runFlow(stepDef.body, itemContext);

      execution.onStopRequested(() => flowExecution.requestStop());

      const task = (async () => {
        await flowExecution.start();
        await flowExecution.waitUntilFinished();
      })();

      tasks.push(task);
      index += 1;
    }

    switch (stepDef.strategy) {
      case ParallelStepStrategy.FailFast: {
        await Promise.all(tasks);
        break;
      }
      case ParallelStepStrategy.FirstCompleted: {
        await Promise.race(tasks);
        break;
      }
      case ParallelStepStrategy.CollectAll:
      default: {
        await Promise.allSettled(tasks);
        break;
      }
    }

    this.ensureNotStopped(execution);
  }

  protected toAsyncIterable<T>(
    items: Iterable<T> | AsyncIterable<T>
  ): AsyncIterable<T> {
    if (typeof (items as any)[Symbol.asyncIterator] === "function") {
      return items as AsyncIterable<T>;
    }

    return (async function* () {
      for (const item of items as Iterable<T>) {
        yield item;
      }
    })();
  }

  protected ensureNotStopped(execution: IStepExecution) {
    if (execution.isStopRequested()) {
      throw new StepStoppedError();
    }
  }
}
