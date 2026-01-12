import { IStepExecution, IStepExecutor } from "../../abstraction";
import { ForEachStepDef } from "../step-defs";
import { StepStoppedError } from "../step-execution";

export class ForEachStepExecutor implements IStepExecutor<ForEachStepDef> {
  async execute(execution: IStepExecution<ForEachStepDef>): Promise<any> {
    const { client, stepDef, context } = execution;

    const items = await stepDef.items(context);

    let index = 0;

    for await (const item of this.toAsyncIterable(items)) {
      this.ensureNotStopped(execution);

      const itemContext = stepDef.createItemContext(context, item, index);
      const flowExecution = client.runFlow(stepDef.body, itemContext);

      execution.onStopRequested(() => flowExecution.requestStop());

      await flowExecution.start();
      await flowExecution.waitUntilFinished();

      index += 1;

      this.ensureNotStopped(execution);
    }
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
