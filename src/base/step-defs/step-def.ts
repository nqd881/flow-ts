import { IStepDef } from "../../abstraction";
import { v4 } from "uuid";

export class StepDef implements IStepDef {
  constructor(public readonly id: string = v4()) {}
}
