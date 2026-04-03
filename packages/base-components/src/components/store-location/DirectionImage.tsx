"use client";

import {
  Ferry,
  FerryTrain,
  ForkLeft,
  ForkRight,
  Merge,
  Ramp,
  RampLeft,
  RampRight,
  RoundAboutLeft,
  RoundAboutRight,
  Straight,
  TurnLeft,
  TurnRight,
  TurnSharpLeft,
  TurnSharpRight,
  TurnSlightLeft,
  TurnSlightRight,
  ULeftTurnIcon,
  URightTurnIcon,
} from "../common/icons";

export function DirectionImage({ name }: { name: string }) {
  const getDirectionSVG = new Map([
    ["straight", <Straight />],
    ["turn-left", <TurnLeft />],
    ["keep-left", <TurnLeft />],
    ["turn-right", <TurnRight />],
    ["keep-right", <TurnRight />],
    ["u-right", <URightTurnIcon />],
    ["u-left", <ULeftTurnIcon />],
    ["turn-slight-left", <TurnSlightLeft />],
    ["turn-slight-right", <TurnSlightRight />],
    ["turn-sharp-left", <TurnSharpLeft />],
    ["turn-sharp-right", <TurnSharpRight />],
    ["roundabout-right", <RoundAboutRight />],
    ["roundabout-left", <RoundAboutLeft />],
    ["ferry", <Ferry />],
    ["ferry-train", <FerryTrain />],
    ["fork-left", <ForkLeft />],
    ["fork-right", <ForkRight />],
    ["merge", <Merge />],
    ["ramp", <Ramp />],
    ["ramp-left", <RampLeft />],
    ["ramp-right", <RampRight />],
  ]);

  return <>{getDirectionSVG.get(name) || ""}</>;
}
