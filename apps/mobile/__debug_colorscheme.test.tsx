import React from "react";
import renderer from "react-test-renderer";
import { Text, useColorScheme } from "react-native";

function Probe() {
  const scheme = useColorScheme();
  return <Text>{String(scheme)}</Text>;
}

it("probes useColorScheme mock", () => {
  const tree = renderer.create(<Probe />).toJSON();
  console.log("PROBE RESULT", JSON.stringify(tree));
});
