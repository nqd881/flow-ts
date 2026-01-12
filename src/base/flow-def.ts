import { IFlowDef, IStepDef } from "../abstraction";
import { v4 } from "uuid";
import { FlowBuilderClient, FlowDefBuilder } from "./flow-def-builder";

export class FlowDef implements IFlowDef {
  static builder(client: FlowBuilderClient) {
    return new FlowDefBuilder(client);
  }

  public readonly id: string;

  constructor(public readonly steps: IStepDef[]) {
    this.id = v4();
  }
}
