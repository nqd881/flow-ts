import { IStepDef } from "../abstraction";
import { FlowDef } from "../base/flow-def";
import { FlowBuilderClient } from "../base/flow-def-builder";
import { CompensationMap } from "./compensation-map";
import { SagaDefBuilder } from "./saga-def-builder";

export class SagaDef extends FlowDef {
  static builder(client: FlowBuilderClient) {
    return new SagaDefBuilder(client);
  }

  public readonly compensationMap: CompensationMap;
  public readonly pivotStepId?: string;

  constructor(
    steps: IStepDef[],
    compensationMap: CompensationMap,
    pivotStepId?: string
  ) {
    super(steps);

    this.compensationMap = compensationMap;
    this.pivotStepId = pivotStepId;
  }
}
